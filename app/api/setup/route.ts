// GET /api/setup — creates tables and seeds demo users (run once for setup)
import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const pool = getPool();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS recommendation_events (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        album_id INTEGER REFERENCES albums(id) ON DELETE CASCADE,
        rule_id INTEGER REFERENCES rules(id) ON DELETE SET NULL,
        event_type VARCHAR(30) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      INSERT INTO users (username, password, role) VALUES
        ('admin', 'admin123', 'admin'),
        ('customer', 'customer123', 'customer')
      ON CONFLICT (username) DO NOTHING;
    `);

    return NextResponse.json({
      success: true,
      message: 'Tables created. Demo users: admin/admin123 and customer/customer123',
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Setup failed', details: String(error) }, { status: 500 });
  }
}
