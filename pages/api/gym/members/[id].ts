import type { NextApiRequest, NextApiResponse } from 'next'
import { members } from '../../../../lib/gymData'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const member = members.find((item) => item.id === req.query.id) || members[0]

  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, member })
  }

  if (req.method === 'PUT') {
    return res.status(200).json({ ok: true, member: { ...member, ...req.body } })
  }

  res.setHeader('Allow', 'GET, PUT')
  return res.status(405).json({ ok: false, error: 'method_not_allowed' })
}
