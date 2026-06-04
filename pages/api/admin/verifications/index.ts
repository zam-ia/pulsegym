import type { NextApiRequest, NextApiResponse } from 'next'

export const verificationRows = [
  {
    id: 'ver_pg_1041',
    createdAt: '2026-06-04 09:18',
    gym: 'Iron Club',
    owner: 'Mateo Vargas',
    email: 'mateo@ironclub.test',
    plan: 'Pro',
    amount: 'S/ 149',
    method: 'Yape',
    status: 'pending',
    reference: 'PG-291041',
    screenshot: 'captura-yape-iron-club.png',
  },
  {
    id: 'ver_pg_1042',
    createdAt: '2026-06-04 08:44',
    gym: 'Fit Norte',
    owner: 'Lucia Salas',
    email: 'lucia@fitnorte.test',
    plan: 'Starter',
    amount: 'S/ 79',
    method: 'Plin',
    status: 'approved',
    reference: 'PG-291042',
    screenshot: 'captura-plin-fit-norte.png',
  },
  {
    id: 'ver_pg_1043',
    createdAt: '2026-06-03 18:10',
    gym: 'Box 360',
    owner: 'Carlos Rivas',
    email: 'carlos@box360.test',
    plan: 'Enterprise',
    amount: 'A medida',
    method: 'WhatsApp',
    status: 'whatsapp',
    reference: 'PG-291043',
    screenshot: 'pendiente-whatsapp',
  },
]

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'method_not_allowed' })
  }

  const status = typeof req.query.status === 'string' ? req.query.status : undefined
  const rows = status ? verificationRows.filter((row) => row.status === status) : verificationRows

  return res.status(200).json({ ok: true, rows })
}
