import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT')
    return res.status(405).json({ ok: false, error: 'method_not_allowed' })
  }

  const { id } = req.query
  const action = req.body?.action

  if (action !== 'approve' && action !== 'reject') {
    return res.status(400).json({ ok: false, error: 'invalid_action' })
  }

  return res.status(200).json({
    ok: true,
    verification: {
      id,
      status: action === 'approve' ? 'approved' : 'rejected',
      audited: true,
      reviewedAt: new Date().toISOString(),
      rejectionReason: action === 'reject' ? req.body?.reason || 'Comprobante no validado' : null,
      nextStep: action === 'approve'
        ? 'create_supabase_auth_user_gym_owner_profile_subscription_and_send_welcome'
        : 'store_rejection_reason_and_notify_owner',
    },
  })
}
