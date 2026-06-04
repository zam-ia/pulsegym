import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerPool } from '../../lib/serverDb'

const fallbackNotifications = [
  {
    id: 'local-payment-overdue',
    type: 'payment_overdue',
    title: 'Pago vencido',
    body: 'Hay membresias vencidas que requieren seguimiento hoy.',
    created_at: new Date().toISOString(),
    read_at: null,
  },
  {
    id: 'local-risk-member',
    type: 'member_risk',
    title: 'Cliente en riesgo',
    body: 'Un miembro supera 14 dias sin asistencia registrada.',
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    read_at: null,
  },
  {
    id: 'local-routine',
    type: 'routine_assigned',
    title: 'Rutina asignada',
    body: 'Se asigno una nueva rutina y esta lista para revision.',
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    read_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const pool = getServerPool()
      const userId = typeof req.query.userId === 'string' ? req.query.userId : null
      const result = await pool.query(
        `
          select id, type, title, body, created_at, read_at
          from notifications
          where ($1::uuid is null or user_id = $1::uuid or user_id is null)
          order by read_at nulls first, created_at desc
          limit 20
        `,
        [userId],
      )
      return res.status(200).json({ notifications: result.rows })
    } catch (error) {
      return res.status(200).json({ notifications: fallbackNotifications, source: 'fallback' })
    }
  }

  if (req.method === 'POST') {
    try {
      const pool = getServerPool()
      const { id, userId, action } = req.body || {}

      if (action === 'mark_all_read') {
        await pool.query(
          `
            update notifications
            set read_at = now()
            where read_at is null and ($1::uuid is null or user_id = $1::uuid or user_id is null)
          `,
          [userId || null],
        )
        return res.status(200).json({ ok: true })
      }

      if (id) {
        await pool.query('update notifications set read_at = now() where id = $1::uuid', [id])
        return res.status(200).json({ ok: true })
      }

      return res.status(400).json({ ok: false, error: 'Missing notification id or action' })
    } catch (error) {
      return res.status(200).json({ ok: true, source: 'fallback' })
    }
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ ok: false, error: 'Method not allowed' })
}
