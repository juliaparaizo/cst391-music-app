import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import * as rulesService from '@/lib/services/rulesService';

export const runtime = 'nodejs';

// GET /api/rules — admin only
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const rules = await rulesService.listRules();
    return NextResponse.json(rules, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 });
  }
}

// POST /api/rules — admin only
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { name, criteria_field, criteria_value, role_required } = await request.json();
    const result = await rulesService.createRule(
      name, criteria_field, criteria_value, session.username, role_required || 'admin'
    );
    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create rule';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
