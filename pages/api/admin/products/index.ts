import type { NextApiRequest, NextApiResponse } from 'next'
import { products } from '../../../../lib/marketplace'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, products })
  }

  if (req.method === 'POST') {
    const { name, description, basePrice, discountPrice, discountCode, imageUrl, active = true } = req.body || {}
    if (!name || !basePrice || !discountPrice || !discountCode) {
      return res.status(400).json({ ok: false, error: 'missing_required_fields' })
    }

    return res.status(201).json({
      ok: true,
      product: {
        id: String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name,
        description: description || '',
        basePrice: Number(basePrice),
        discountPrice: Number(discountPrice),
        discountCode,
        imageUrl: imageUrl || '/product-protein.svg',
        active: Boolean(active),
      },
    })
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ ok: false, error: 'method_not_allowed' })
}
