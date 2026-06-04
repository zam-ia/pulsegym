import type { NextApiRequest, NextApiResponse } from 'next'
import { gateways } from '../../../../lib/gymData'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return res.status(200).json({ ok: true, gateways })
  if (req.method === 'POST') return res.status(201).json({ ok: true, gateway: { id: `gw_${Date.now().toString(36)}`, ...req.body } })
  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ ok: false, error: 'method_not_allowed' })
}
