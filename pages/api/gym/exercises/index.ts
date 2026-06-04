import type { NextApiRequest, NextApiResponse } from 'next'
import { exercises } from '../../../../lib/gymData'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return res.status(200).json({ ok: true, rows: exercises })
  if (req.method === 'POST') return res.status(201).json({ ok: true, exercise: { id: `ex_${Date.now().toString(36)}`, ...req.body } })
  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ ok: false, error: 'method_not_allowed' })
}
