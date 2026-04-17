import { getPool } from '@/lib/db';
import type { Rule } from '@/lib/types';

export async function getAllRules(): Promise<Rule[]> {
  const pool = getPool();
  const result = await pool.query('SELECT * FROM rules ORDER BY created_at DESC');
  return result.rows;
}

export async function getRuleById(id: number): Promise<Rule | null> {
  const pool = getPool();
  const result = await pool.query('SELECT * FROM rules WHERE id = $1', [id]);
  return result.rows[0] ?? null;
}

export async function createRule(
  name: string,
  criteria_field: string,
  criteria_value: string,
  created_by: string,
  role_required: string
): Promise<{ id: number }> {
  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO rules (name, criteria_field, criteria_value, created_by, role_required)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [name, criteria_field, criteria_value, created_by, role_required]
  );
  return result.rows[0];
}

export async function updateRule(
  id: number,
  name: string,
  criteria_field: string,
  criteria_value: string,
  role_required: string
): Promise<Rule | null> {
  const pool = getPool();
  const result = await pool.query(
    `UPDATE rules SET name=$1, criteria_field=$2, criteria_value=$3, role_required=$4
     WHERE id=$5 RETURNING *`,
    [name, criteria_field, criteria_value, role_required, id]
  );
  return result.rows[0] ?? null;
}

export async function deleteRule(id: number): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query('DELETE FROM rules WHERE id = $1 RETURNING id', [id]);
  return (result.rowCount ?? 0) > 0;
}
