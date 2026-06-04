import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT')
    return res.status(405).json({ ok: false, error: 'method_not_allowed' })
  }
  return res.status(200).json({ ok: true, payment: { id: req.body?.id, status: 'paid', paidAt: new Date().toISOString() } })
}
