import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import * as recService from '@/lib/services/recommendationsService';

export const runtime = 'nodejs';

// POST /api/recommendations/feedback — authenticated users (customer + admin)
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { albumId, feedbackType, ruleId } = await request.json();
    await recService.submitFeedback(session.userId, albumId, feedbackType, ruleId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to record feedback';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// GET /api/recommendations/feedback — admin only (analytics aggregate)
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const analytics = await recService.getAnalytics();
    return NextResponse.json(analytics);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
