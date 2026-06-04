import type { NextApiRequest, NextApiResponse } from 'next'
import { products } from '../../lib/marketplace'
import { getServerPool } from '../../lib/serverDb'

function toProduct(row: any) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    category: row.category || '',
    basePrice: Number(row.base_price || 0),
    discountPrice: Number(row.discount_price || 0),
    discountCode: row.discount_code || '',
    stock: Number(row.stock || 0),
    active: Boolean(row.active),
    featured: Boolean(row.featured),
    imageUrl: row.image_url || '',
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'method_not_allowed' })
  }

  const active = req.query.active === 'true'
  const featured = req.query.featured === 'true'
  const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 0
  let visibleProducts = products

  try {
    const pool = getServerPool()
    const result = await pool.query(`
      select id, name, description, category, base_price, discount_price, discount_code, stock, active, featured, image_url
      from products
      order by created_at desc
    `)
    visibleProducts = result.rows.map(toProduct)
  } catch (error) {
    visibleProducts = products
  }

  if (active) visibleProducts = visibleProducts.filter((product) => product.active)
  if (featured) visibleProducts = visibleProducts.filter((product) => product.featured)

  return res.status(200).json({
    ok: true,
    products: limit > 0 ? visibleProducts.slice(0, limit) : visibleProducts,
  })
}
