import type { NextApiRequest, NextApiResponse } from "next";
import pool from "../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await pool.query("select now()");
    res.status(200).json({ ok: true, time: result.rows[0].now, student: "Julia Paraizo" });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
