import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerPool } from '../../../../lib/serverDb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id || '')

  if (!id) {
    return res.status(400).json({ ok: false, error: 'missing_id' })
  }

  if (req.method === 'PUT') {
    const body = req.body || {}
    const basePrice = Number(body.basePrice)
    const discountPrice = Number(body.discountPrice)

    if (!body.name || !basePrice || !discountPrice || !body.discountCode || body.stock === undefined) {
      return res.status(400).json({ ok: false, error: 'missing_required_fields' })
    }

    if (discountPrice > basePrice) {
      return res.status(400).json({ ok: false, error: 'discount_price_greater_than_base' })
    }

    const product = {
      id,
      name: String(body.name),
      description: String(body.description || ''),
      category: String(body.category || ''),
      basePrice,
      discountPrice,
      discountCode: String(body.discountCode).toUpperCase().replace(/\s+/g, ''),
      stock: Number(body.stock || 0),
      active: body.active !== false,
      featured: Boolean(body.featured),
      imageUrl: String(body.imageUrl || '/product-protein.svg'),
    }

    try {
      const pool = getServerPool()
      await pool.query(
        `
          update products
          set name=$2, description=$3, category=$4, base_price=$5, discount_price=$6, discount_code=$7,
              stock=$8, active=$9, featured=$10, image_url=$11, updated_at=now()
          where id=$1
        `,
        [id, product.name, product.description, product.category, product.basePrice, product.discountPrice, product.discountCode, product.stock, product.active, product.featured, product.imageUrl],
      )
    } catch (error) {
      return res.status(200).json({ ok: true, product, source: 'fallback' })
    }

    return res.status(200).json({ ok: true, product, source: 'database' })
  }

  if (req.method === 'DELETE') {
    try {
      const pool = getServerPool()
      await pool.query('delete from products where id = $1', [id])
    } catch (error) {
      return res.status(200).json({ ok: true, deleted: id, source: 'fallback' })
    }

    return res.status(200).json({ ok: true, deleted: id, source: 'database' })
  }

  res.setHeader('Allow', 'PUT, DELETE')
  return res.status(405).json({ ok: false, error: 'method_not_allowed' })
}
