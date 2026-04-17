import { getPool } from '@/lib/db';
import type { Recommendation } from '@/lib/types';

export async function getAllRecommendations(): Promise<Recommendation[]> {
  const pool = getPool();
  const result = await pool.query(`
    SELECT rec.id, r.name as rule_name, a.title as album_title, a.artist, a.year,
           rec.album_id, rec.rule_id
    FROM recommendations rec
    JOIN rules r ON rec.rule_id = r.id
    JOIN albums a ON rec.album_id = a.id
    ORDER BY rec.created_at DESC
  `);
  return result.rows;
}

export async function createRecommendation(
  rule_id: number,
  album_id: number
): Promise<{ id: number }> {
  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO recommendations (rule_id, album_id) VALUES ($1, $2) RETURNING id`,
    [rule_id, album_id]
  );
  return result.rows[0];
}

export async function recordFeedbackEvent(
  user_id: number,
  album_id: number,
  event_type: string,
  rule_id?: number | null
): Promise<void> {
  const pool = getPool();
  await pool.query(
    `INSERT INTO recommendation_events (user_id, album_id, rule_id, event_type)
     VALUES ($1, $2, $3, $4)`,
    [user_id, album_id, rule_id ?? null, event_type]
  );
}

export async function getAnalyticsAggregate(): Promise<object[]> {
  const pool = getPool();
  const result = await pool.query(`
    SELECT
      r.name as rule_name,
      COUNT(*) FILTER (WHERE re.event_type = 'LIKE') as likes,
      COUNT(*) FILTER (WHERE re.event_type = 'DISLIKE') as dislikes,
      COUNT(*) FILTER (WHERE re.event_type = 'NOT_INTERESTED') as not_interested,
      COUNT(*) as total_events
    FROM recommendation_events re
    LEFT JOIN rules r ON re.rule_id = r.id
    GROUP BY r.name
    ORDER BY total_events DESC
  `);
  return result.rows;
}
