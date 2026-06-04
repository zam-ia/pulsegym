import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    ok: true,
    kpis: { totalIncome: 12450, previousPeriodIncome: 11500, trend: 8.26, activeCount: 95, averageTicket: 131.05 },
    incomeByMembership: [
      { plan: 'Pro', amount: 8000, count: 50 },
      { plan: 'Basico', amount: 4450, count: 45 },
    ],
    incomeEvolution: Array.from({ length: 12 }).map((_, index) => ({ month: `2025-${String(index + 7).padStart(2, '0')}`, total: 10200 + index * 240 })),
  })
}
