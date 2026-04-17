import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import * as rulesService from '@/lib/services/rulesService';

export const runtime = 'nodejs';

// GET /api/rules/[id] — admin only
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await context.params;
  try {
    const rule = await rulesService.getRule(parseInt(id, 10));
    if (!rule) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(rule, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch rule' }, { status: 500 });
  }
}

// PUT /api/rules/[id] — admin only
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await context.params;
  try {
    const { name, criteria_field, criteria_value, role_required } = await request.json();
    const updated = await rulesService.updateRule(
      parseInt(id, 10), name, criteria_field, criteria_value, role_required || 'admin'
    );
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update rule';
    const status = message === 'Rule not found' ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

// DELETE /api/rules/[id] — admin only
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await context.params;
  try {
    await rulesService.deleteRule(parseInt(id, 10));
    return NextResponse.json({ message: `Rule ${id} deleted` }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete rule';
    const status = message === 'Rule not found' ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
