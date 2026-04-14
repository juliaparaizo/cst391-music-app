import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const pool = getPool();
    const result = await pool.query('SELECT * FROM rules WHERE id = $1', [id]);
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rule' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const pool = getPool();
    const result = await pool.query('DELETE FROM rules WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    return NextResponse.json({ message: `Rule ${id} deleted` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 });
  }
}