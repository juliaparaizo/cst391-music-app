import * as albumsRepo from '@/lib/repositories/albumsRepository';
import type { Album, Track } from '@/lib/types';

export async function getAlbums(albumId?: number): Promise<Album[]> {
  return albumsRepo.getAlbums(albumId);
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  return albumsRepo.getAlbumBySlug(slug);
}

export async function createAlbum(
  title: string,
  artist: string,
  year: number,
  description: string | null,
  image: string | null,
  tracks: Track[]
): Promise<number> {
  if (!title || !artist || year == null) {
    throw new Error('title, artist, and year are required');
  }
  return albumsRepo.insertAlbum(title, artist, year, description ?? null, image ?? null, tracks ?? []);
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
  if (!albumId) throw new Error('albumId is required');
  await albumsRepo.updateAlbum(albumId, title, artist, year, description ?? null, image ?? null, tracks ?? []);
}

export async function searchByArtist(searchTerm: string): Promise<Album[]> {
  return albumsRepo.searchAlbumsByArtist(searchTerm);
}

export async function searchByDescription(searchTerm: string): Promise<Album[]> {
  return albumsRepo.searchAlbumsByDescription(searchTerm);
}

export async function getAlbumsByArtistExact(artistName: string): Promise<Album[]> {
  if (!artistName) throw new Error('artistName is required');
  return albumsRepo.getAlbumsByArtistExact(artistName);
}

export async function deleteAlbum(id: number): Promise<void> {
  if (!id) throw new Error('albumId is required');
  const deleted = await albumsRepo.deleteAlbumById(id);
  if (!deleted) throw new Error('Album not found');
}
