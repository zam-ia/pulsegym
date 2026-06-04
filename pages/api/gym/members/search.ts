import type { NextApiRequest, NextApiResponse } from 'next'
import { members } from '../../../../lib/gymData'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const q = String(req.query.q || '').toLowerCase()
  return res.status(200).json({
    ok: true,
    rows: members.filter((member) => !q || `${member.name} ${member.email}`.toLowerCase().includes(q)).slice(0, 8),
  })
}
