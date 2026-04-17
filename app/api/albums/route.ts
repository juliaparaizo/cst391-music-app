import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import * as albumsService from '@/lib/services/albumsService';
import type { Track } from '@/lib/types';

export const runtime = 'nodejs';

// GET /api/albums — public
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const albumIdParam = url.searchParams.get('albumId');
    let albumId: number | undefined;

    if (albumIdParam) {
      albumId = parseInt(albumIdParam, 10);
      if (isNaN(albumId)) {
        return NextResponse.json({ error: 'Invalid albumId parameter' }, { status: 400 });
      }
    }

    const albums = await albumsService.getAlbums(albumId);
    return NextResponse.json(albums);
  } catch (error) {
    console.error('GET /api/albums error:', error);
    return NextResponse.json({ error: 'Failed to fetch albums' }, { status: 500 });
  }
}

// POST /api/albums — admin only
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await request.json();
    const { title, artist, year, description, image, tracks } = body;
    const albumId = await albumsService.createAlbum(
      title, artist, year, description ?? null, image ?? null, (tracks ?? []) as Track[]
    );
    return NextResponse.json({ id: albumId }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create album';
    console.error('POST /api/albums error:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// PUT /api/albums — admin only
export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await request.json();
    const { albumId, title, artist, year, description, image, tracks } = body;
    await albumsService.updateAlbum(
      albumId, title, artist, year, description ?? null, image ?? null, (tracks ?? []) as Track[]
    );
    return NextResponse.json({ message: 'Album updated successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update album';
    console.error('PUT /api/albums error:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
