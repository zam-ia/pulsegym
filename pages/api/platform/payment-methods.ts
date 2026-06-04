import type { NextApiRequest, NextApiResponse } from 'next'
import { platformPaymentMethods } from '../../../lib/gymData'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'method_not_allowed' })
  }
  return res.status(200).json({ ok: true, methods: platformPaymentMethods.filter((method) => method.active) })
}
