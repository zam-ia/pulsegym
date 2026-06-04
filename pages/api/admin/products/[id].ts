import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'PUT') {
    return res.status(200).json({ ok: true, product: { id, ...req.body, updatedAt: new Date().toISOString() } })
  }

  if (req.method === 'DELETE') {
    return res.status(200).json({ ok: true, product: { id, active: false } })
  }

  res.setHeader('Allow', 'PUT, DELETE')
  return res.status(405).json({ ok: false, error: 'method_not_allowed' })
}
