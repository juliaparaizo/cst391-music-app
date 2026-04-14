import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT * FROM rules ORDER BY created_at DESC');
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, criteria_field, criteria_value, created_by, role_required } = await request.json();
    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO rules (name, criteria_field, criteria_value, created_by, role_required)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [name, criteria_field, criteria_value, created_by || 'admin', role_required || 'admin']
    );
    return NextResponse.json({ id: result.rows[0].id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 });
  }
}