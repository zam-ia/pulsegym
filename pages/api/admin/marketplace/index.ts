import type { NextApiRequest, NextApiResponse } from 'next'
import { randomUUID } from 'crypto'
import { products as fallbackProducts, Product } from '../../../../lib/marketplace'
import { getServerPool } from '../../../../lib/serverDb'

function toCamel(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    category: row.category || '',
    basePrice: Number(row.base_price ?? row.basePrice ?? 0),
    discountPrice: Number(row.discount_price ?? row.discountPrice ?? 0),
    discountCode: row.discount_code ?? row.discountCode ?? '',
    stock: Number(row.stock ?? 0),
    featured: Boolean(row.featured),
    imageUrl: row.image_url ?? row.imageUrl ?? '',
    active: Boolean(row.active),
    requests: Number(row.requests ?? 0),
  }
}

function filterProducts(items: Product[], query: NextApiRequest['query']) {
  const search = String(query.search || '').toLowerCase()
  const category = String(query.category || 'Todas')
  const status = String(query.status || 'Activos')
  const featured = String(query.featured || 'Todos')
  const stock = String(query.stock || 'Todos')

  return items.filter((product) => {
    if (search && !`${product.name} ${product.description} ${product.discountCode}`.toLowerCase().includes(search)) return false
    if (category !== 'Todas' && product.category !== category) return false
    if (status === 'Activos' && !product.active) return false
    if (status === 'Inactivos' && product.active) return false
    if (featured === 'En oferta' && !product.featured) return false
    if (featured === 'No destacados' && product.featured) return false
    if (stock === 'Con stock' && product.stock === 0) return false
    if (stock === 'Agotados' && product.stock > 0) return false
    return true
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const pool = getServerPool()
      const result = await pool.query(`
        select id, name, description, category, base_price, discount_price, discount_code, stock, active, featured, image_url, 0 as requests
        from products
        order by created_at desc
      `)
      const filtered = filterProducts(result.rows.map(toCamel), req.query)
      return res.status(200).json({ ok: true, products: filtered, total: filtered.length, source: 'database' })
    } catch (error) {
      const filtered = filterProducts(fallbackProducts, req.query)
      return res.status(200).json({ ok: true, products: filtered, total: filtered.length, source: 'fallback' })
    }
  }

  if (req.method === 'POST') {
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
      id: body.id || randomUUID(),
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
      requests: 0,
    }

    try {
      const pool = getServerPool()
      await pool.query(
        `
          insert into products (id, name, description, category, base_price, discount_price, discount_code, stock, active, featured, image_url, created_at, updated_at)
          values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,now(),now())
        `,
        [product.id, product.name, product.description, product.category, product.basePrice, product.discountPrice, product.discountCode, product.stock, product.active, product.featured, product.imageUrl],
      )
    } catch (error) {
      return res.status(201).json({ ok: true, product, source: 'fallback' })
    }

    return res.status(201).json({ ok: true, product, source: 'database' })
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ ok: false, error: 'method_not_allowed' })
}
