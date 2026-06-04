import type { NextApiRequest, NextApiResponse } from 'next'
import { progressSummary } from '../../../../lib/gymData'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({ ok: true, rows: progressSummary })
}
