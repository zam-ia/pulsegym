import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({ ok: true, satisfactionByRoutine: [{ routine: 'Fuerza 8 semanas', value: 4.6 }, { routine: 'Definicion full body', value: 3.8 }], energy: [2, 5, 12, 18, 9] })
}
