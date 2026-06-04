import type { NextApiRequest, NextApiResponse } from 'next'

const recipes = [{ id: 'rec-1', name: 'Bowl proteico', category: 'Desayuno', time: 12, difficulty: 'Facil' }]

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return res.status(200).json({ ok: true, rows: recipes })
  if (req.method === 'POST') return res.status(201).json({ ok: true, recipe: { id: `rec_${Date.now().toString(36)}`, ...req.body } })
  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ ok: false, error: 'method_not_allowed' })
}
