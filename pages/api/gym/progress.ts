import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method_not_allowed' })
  }
  return res.status(201).json({ ok: true, progress: { id: `prog_${Date.now().toString(36)}`, ...req.body } })
}
