import type { NextApiRequest, NextApiResponse } from 'next'
import { members } from '../../../../lib/gymData'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const search = String(req.query.search || '').toLowerCase()
    const status = String(req.query.status || '')
    const rows = members.filter((member) =>
      (!search || `${member.name} ${member.email} ${member.phone}`.toLowerCase().includes(search)) &&
      (!status || status === 'all' || member.status === status)
    )
    return res.status(200).json({ ok: true, rows, total: rows.length, page: Number(req.query.page || 1), limit: Number(req.query.limit || 20) })
  }

  if (req.method === 'POST') {
    if (!req.body?.name || !req.body?.email || !req.body?.phone) {
      return res.status(400).json({ ok: false, error: 'missing_required_fields' })
    }
    return res.status(201).json({ ok: true, member: { id: `mem_${Date.now().toString(36)}`, ...req.body, status: 'active' } })
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ ok: false, error: 'method_not_allowed' })
}
