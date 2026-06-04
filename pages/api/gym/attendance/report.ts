import type { NextApiRequest, NextApiResponse } from 'next'
import { dashboardData } from '../../../../lib/gymData'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({ ok: true, weeklyAttendance: dashboardData.weeklyAttendance, byHour: [12, 18, 31, 26, 44, 36] })
}
