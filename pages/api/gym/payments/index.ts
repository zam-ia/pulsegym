import type { NextApiRequest, NextApiResponse } from 'next'
import { payments } from '../../../../lib/gymData'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const status = String(req.query.status || '')
    const rows = payments.filter((payment) => !status || status === 'all' || payment.status === status)
    return res.status(200).json({
      ok: true,
      summary: {
        totalPaid: rows.filter((item) => item.status === 'paid').reduce((sum, item) => sum + item.amount, 0),
        pending: rows.filter((item) => item.status !== 'paid').reduce((sum, item) => sum + item.amount, 0),
        transactions: rows.length,
      },
      rows,
    })
  }
  if (req.method === 'POST') {
    return res.status(201).json({ ok: true, payment: { id: `pay_${Date.now().toString(36)}`, ...req.body, status: req.body?.status || 'paid' } })
  }
  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ ok: false, error: 'method_not_allowed' })
}
