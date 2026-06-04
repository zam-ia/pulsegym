import type { NextApiRequest, NextApiResponse } from 'next'
import { gymPaymentMethods } from '../../../lib/gymData'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, methods: gymPaymentMethods })
  }
  if (req.method === 'PUT') {
    return res.status(200).json({ ok: true, methods: req.body?.methods || gymPaymentMethods })
  }
  res.setHeader('Allow', 'GET, PUT')
  return res.status(405).json({ ok: false, error: 'method_not_allowed' })
}
