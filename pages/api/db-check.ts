import type { NextApiRequest, NextApiResponse } from "next";
import pool from "../../lib/db";

const environment = process.env.NODE_ENV;
const dbUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const nowResult = await pool.query("select now()");
    const now = nowResult.rows[0]?.now ?? null;

    let artist: string | null = null;
    const artistResult = await pool.query("select artist from albums limit 1");
    if (artistResult.rows?.length) {
      artist = artistResult.rows[0].artist ?? null;
    }

    res.status(200).json({
      ok: true,
      time: now,
      artist,
      message: `Julia Paraizo Database connection successful. Running in ${environment}. DATABASE_URL: ${dbUrl}`,
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      error: "Database connection failed",
      details: err?.message,
      message: `Julia Paraizo Database connection failed. Running in ${environment}. DATABASE_URL: ${dbUrl}`,
    });
  }
}
