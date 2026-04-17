import { getPool } from '@/lib/db';
import type { Album, Track } from '@/lib/types';

export async function getAlbums(albumId?: number): Promise<Album[]> {
  const pool = getPool();
  const albumsRes = albumId
    ? await pool.query('SELECT * FROM albums WHERE id = $1', [albumId])
    : await pool.query('SELECT * FROM albums');

  const albumsData: Album[] = albumsRes.rows;
  if (albumsData.length === 0) return [];

  const albumIds = albumsData.map(a => a.id);
  const tracksRes = await pool.query(
    'SELECT * FROM tracks WHERE album_id = ANY($1) ORDER BY number',
    [albumIds]
  );

  const tracksByAlbum: Record<number, Track[]> = {};
  for (const track of tracksRes.rows) {
    (tracksByAlbum[track.album_id] ||= []).push({
      id: track.id,
      number: track.number,
      title: track.title,
      lyrics: track.lyrics,
      video: track.video_url,
    });
  }

  return albumsData.map(album => ({
    id: album.id,
    title: album.title,
    artist: album.artist,
    year: album.year,
    image: album.image,
    description: album.description,
    tracks: tracksByAlbum[album.id!] || [],
  }));
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  const pool = getPool();
  const albumRes = await pool.query(
    'SELECT * FROM albums WHERE LOWER(REPLACE(title, \' \', \'-\')) = $1',
    [slug]
  );
  if (albumRes.rows.length === 0) return null;

  const album = albumRes.rows[0];
  const tracksRes = await pool.query(
    'SELECT * FROM tracks WHERE album_id = $1 ORDER BY number',
    [album.id]
  );

  return {
    id: album.id,
    title: album.title,
    artist: album.artist,
    year: album.year,
    image: album.image,
    description: album.description,
    tracks: tracksRes.rows.map((t: Record<string, unknown>) => ({
      id: t.id as number,
      number: t.number as number,
      title: t.title as string,
      lyrics: t.lyrics as string | null,
      video: t.video_url as string | null,
    })),
  };
}

export async function insertAlbum(
  title: string,
  artist: string,
  year: number,
  description: string | null,
  image: string | null,
  tracks: Track[]
): Promise<number> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const albumRes = await client.query(
      `INSERT INTO albums (title, artist, description, year, image)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [title, artist, description, year, image]
    );
    const albumId: number = albumRes.rows[0].id;

    for (const t of tracks) {
      if (t.title == null || t.number == null) continue;
      await client.query(
        `INSERT INTO tracks (album_id, title, number, lyrics, video_url) VALUES ($1, $2, $3, $4, $5)`,
        [albumId, t.title, t.number, t.lyrics ?? null, t.video ?? null]
      );
    }

    await client.query('COMMIT');
    return albumId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function updateAlbum(
  albumId: number,
  title: string,
  artist: string,
  year: number,
  description: string | null,
  image: string | null,
  tracks: Track[]
): Promise<void> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE albums SET title=$1, artist=$2, description=$3, year=$4, image=$5 WHERE id=$6`,
      [title, artist, description, year, image, albumId]
    );

    for (const t of tracks) {
      if (t.id == null) continue;
      await client.query(
        `UPDATE tracks SET number=$1, title=$2, lyrics=$3, video_url=$4 WHERE id=$5 AND album_id=$6`,
        [t.number, t.title, t.lyrics ?? null, t.video ?? null, t.id, albumId]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function searchAlbumsByArtist(searchTerm: string): Promise<Album[]> {
  const pool = getPool();
  const result = await pool.query(
    'SELECT * FROM albums WHERE LOWER(artist) LIKE $1',
    [`%${searchTerm.toLowerCase()}%`]
  );
  return result.rows;
}

export async function searchAlbumsByDescription(searchTerm: string): Promise<Album[]> {
  const pool = getPool();
  const result = await pool.query(
    'SELECT * FROM albums WHERE LOWER(description) LIKE $1',
    [`%${searchTerm.toLowerCase()}%`]
  );
  return result.rows;
}

export async function getAlbumsByArtistExact(artistName: string): Promise<Album[]> {
  const pool = getPool();
  const albumsRes = await pool.query(
    'SELECT * FROM albums WHERE LOWER(artist) = LOWER($1)',
    [artistName]
  );
  const albumsData = albumsRes.rows;
  if (albumsData.length === 0) return [];

  const albumIds = albumsData.map((a: { id: number }) => a.id);
  const tracksRes = await pool.query(
    'SELECT * FROM tracks WHERE album_id = ANY($1) ORDER BY number',
    [albumIds]
  );

  const tracksByAlbum: Record<number, Track[]> = {};
  for (const track of tracksRes.rows) {
    (tracksByAlbum[track.album_id] ||= []).push({
      id: track.id,
      number: track.number,
      title: track.title,
      lyrics: track.lyrics,
      video: track.video_url,
    });
  }

  return albumsData.map((album: { id: number; title: string; artist: string; year: number; image: string | null; description: string | null }) => ({
    id: album.id,
    title: album.title,
    artist: album.artist,
    year: album.year,
    image: album.image,
    description: album.description,
    tracks: tracksByAlbum[album.id] || [],
  }));
}

export async function deleteAlbumById(id: number): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query('DELETE FROM albums WHERE id = $1 RETURNING id', [id]);
  return (result.rowCount ?? 0) > 0;
}
