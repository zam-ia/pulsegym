import type { NextApiRequest, NextApiResponse } from 'next'
import { landingPlans } from '../../../lib/pulseData'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'method_not_allowed' })
  }

  return res.status(200).json({
    ok: true,
    plans: landingPlans.map((plan) => ({
      id: plan.name.toLowerCase().replace(/\s+/g, '-'),
      name: plan.name,
      price: plan.price,
      limit: plan.limit,
      trainers: plan.trainers,
      recommended: Boolean(plan.recommended),
      features: plan.features,
    })),
  })
}
