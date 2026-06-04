import type { NextApiRequest, NextApiResponse } from 'next'
import { gateways, integrationRequests } from '../../../lib/gymData'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, gateways: gateways.filter((gateway) => gateway.isActive), requests: integrationRequests })
  }
  if (req.method === 'POST') {
    return res.status(201).json({
      ok: true,
      request: {
        id: `int_${Date.now().toString(36)}`,
        gatewayId: req.body?.gateway_id,
        notes: req.body?.notes,
        status: 'pending',
        whatsappUrl: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_ADMIN_NUMBER || '51987088359'}?text=${encodeURIComponent(`Nueva solicitud de integracion: ${req.body?.gateway_id}`)}`,
      },
    })
  }
  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ ok: false, error: 'method_not_allowed' })
}
