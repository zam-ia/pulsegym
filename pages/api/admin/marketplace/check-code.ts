import type { NextApiRequest, NextApiResponse } from 'next'
import { products } from '../../../../lib/marketplace'
import { getServerPool } from '../../../../lib/serverDb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'method_not_allowed' })
  }

  const code = String(req.query.code || '').trim().toUpperCase()
  const excludeId = String(req.query.exclude_id || '')
  if (!code) return res.status(400).json({ ok: false, error: 'missing_code' })

  try {
    const pool = getServerPool()
    const result = await pool.query(
      'select id from products where upper(discount_code) = $1 and ($2 = $3 or id::text <> $2) limit 1',
      [code, excludeId, ''],
    )
    return res.status(200).json({ ok: true, available: result.rowCount === 0 })
  } catch (error) {
    const exists = products.some((product) => product.discountCode.toUpperCase() === code && product.id !== excludeId)
    return res.status(200).json({ ok: true, available: !exists, source: 'fallback' })
  }
}
