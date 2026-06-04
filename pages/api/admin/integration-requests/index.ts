import type { NextApiRequest, NextApiResponse } from 'next'
import { integrationRequests } from '../../../../lib/gymData'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return res.status(200).json({ ok: true, rows: integrationRequests })
  if (req.method === 'POST') return res.status(201).json({ ok: true, request: { id: `int_${Date.now().toString(36)}`, ...req.body, status: 'pending' } })
  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ ok: false, error: 'method_not_allowed' })
}
