import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const pool = getPool();
    const result = await pool.query(`
      SELECT rec.id, r.name as rule_name, a.title as album_title, a.artist, a.year
      FROM recommendations rec
      JOIN rules r ON rec.rule_id = r.id
      JOIN albums a ON rec.album_id = a.id
      ORDER BY rec.created_at DESC
    `);
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { rule_id, album_id } = await request.json();
    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO recommendations (rule_id, album_id) VALUES ($1, $2) RETURNING id`,
      [rule_id, album_id]
    );
    return NextResponse.json({ id: result.rows[0].id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create recommendation' }, { status: 500 });
  }
}