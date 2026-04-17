import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import * as albumsService from '@/lib/services/albumsService';

export const runtime = 'nodejs';

// GET /api/albums/[slug] — look up albums by artist name (public)
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug: artistName } = await context.params;
  try {
    const albums = await albumsService.getAlbumsByArtistExact(artistName);
    return NextResponse.json(albums);
  } catch (error) {
    console.error(`GET /api/albums/${artistName} error:`, error);
    return NextResponse.json({ error: 'Failed to fetch albums by artist' }, { status: 500 });
  }
}

// DELETE /api/albums/[slug] — delete album by ID (admin only)
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { slug } = await context.params;
  const id = parseInt(slug, 10);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid album ID' }, { status: 400 });

  try {
    await albumsService.deleteAlbum(id);
    return NextResponse.json({ message: `Album ${id} deleted` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete album';
    const status = message === 'Album not found' ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
