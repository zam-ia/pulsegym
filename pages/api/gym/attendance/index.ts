import type { NextApiRequest, NextApiResponse } from 'next'
import { dashboardData, members } from '../../../../lib/gymData'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, rows: members.map((member, index) => ({ id: `att-${index}`, member: member.name, date: '2026-06-04', checkIn: `0${8 + index}:10`, checkOut: '10:20', duration: '2h 10m', source: 'Manual' })) })
  }
  if (req.method === 'POST') return res.status(201).json({ ok: true, attendance: { id: `att_${Date.now().toString(36)}`, ...req.body, checkinAt: new Date().toISOString() } })
  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ ok: false, error: 'method_not_allowed' })
}
