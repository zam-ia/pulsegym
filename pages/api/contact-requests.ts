import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method_not_allowed' })
  }

  const { ownerName, email, phone, desiredPlan } = req.body || {}
  if (!ownerName || !email || !phone || !desiredPlan) {
    return res.status(400).json({ ok: false, error: 'missing_required_fields' })
  }

  return res.status(201).json({
    ok: true,
    request: {
      id: `contact_${Date.now().toString(36)}`,
      status: 'new',
      whatsappUrl: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_ADMIN_NUMBER || '51987088359'}?text=${encodeURIComponent(`Nueva solicitud de demo: ${ownerName} - ${email} - ${phone} - Plan ${desiredPlan}`)}`,
    },
  })
}
