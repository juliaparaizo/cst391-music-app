import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import * as recService from '@/lib/services/recommendationsService';

export const runtime = 'nodejs';

// GET /api/recommendations — public (guests, customers, admins)
export async function GET() {
  try {
    const recommendations = await recService.getRecommendations();
    return NextResponse.json(recommendations, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}

// POST /api/recommendations — admin only (link a rule to an album)
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { rule_id, album_id } = await request.json();
    const result = await recService.linkRuleToAlbum(rule_id, album_id);
    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create recommendation';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
