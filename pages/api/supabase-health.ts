import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerPool } from '../../lib/serverDb'

type HealthResponse =
  | {
      ok: true
      database: string
      serverTime: string
    }
  | {
      ok: false
      error: string
    }

export default async function handler(_req: NextApiRequest, res: NextApiResponse<HealthResponse>) {
  try {
    const pool = getServerPool()
    const result = await pool.query<{ now: Date; database: string }>('select now(), current_database() as database')
    const row = result.rows[0]

    res.status(200).json({
      ok: true,
      database: row.database,
      serverTime: row.now.toISOString(),
    })
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown database error',
    })
  }
}
