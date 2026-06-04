import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') return res.status(200).json({ ok: true, routine: { id: req.query.id, ...req.body } })
  if (req.method === 'DELETE') return res.status(200).json({ ok: true, deleted: true, id: req.query.id })
  res.setHeader('Allow', 'PUT, DELETE')
  return res.status(405).json({ ok: false, error: 'method_not_allowed' })
}
