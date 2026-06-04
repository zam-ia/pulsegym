import type { NextApiRequest, NextApiResponse } from 'next'

const requiredFields = ['gymName', 'ownerName', 'email', 'phone', 'plan', 'paymentMethod']

const makeReference = () => Math.random().toString(36).replace(/[^a-z0-9]/g, '').slice(2, 8).toUpperCase().padEnd(6, 'X')

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method_not_allowed' })
  }

  const missing = requiredFields.filter((field) => !req.body?.[field])
  if (missing.length > 0) {
    return res.status(400).json({ ok: false, error: 'missing_fields', missing })
  }

  const reference = makeReference()
  const id = `ver_${reference.toLowerCase()}`
  const amount = req.body?.amount || 'Pendiente'
  const directUrl = `/admin/verifications/${id}`
  const whatsappText = encodeURIComponent(`Nueva solicitud de pago:
- Gimnasio: ${req.body.gymName}
- Dueno: ${req.body.ownerName}
- Email: ${req.body.email}
- Plan: ${req.body.plan} - S/ ${amount}
- Ref: ${reference}
Revisa y aprueba: ${directUrl}`)

  return res.status(200).json({
    ok: true,
    verification: {
      id,
      status: 'pending',
      reference,
      storagePath: `pending/${reference}-${req.body.screenshotName || 'comprobante'}`,
      adminDirectUrl: directUrl,
      whatsappUrl: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_ADMIN_NUMBER || '51987088359'}?text=${whatsappText}`,
      message: 'Comprobante enviado. Revisaremos tu pago en breve y activaremos tu gimnasio al aprobarlo.',
    },
  })
}
