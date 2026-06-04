import type { NextApiRequest, NextApiResponse } from 'next'

type Intent = {
  label: string
  action: 'open_panel' | 'open_action'
  route: string
}

const intents: Record<string, Intent[]> = {
  superadmin: [
    { label: 'Buscar gimnasio', action: 'open_panel', route: '/admin/gyms' },
    { label: 'Ver ingresos mensuales', action: 'open_panel', route: '/admin/billing' },
    { label: 'Nuevo plan', action: 'open_action', route: '/admin/plans' },
    { label: 'Verificar pagos pendientes', action: 'open_panel', route: '/admin/verifications' },
    { label: 'Gestionar marketplace', action: 'open_panel', route: '/admin/marketplace' },
  ],
  owner: [
    { label: 'Buscar miembro', action: 'open_panel', route: '/members' },
    { label: 'Registrar pago', action: 'open_action', route: '/finances/payments' },
    { label: 'Nuevo ejercicio', action: 'open_action', route: '/training/exercises' },
    { label: 'Ver reporte asistencia', action: 'open_panel', route: '/reports/attendance' },
  ],
  supervisor: [
    { label: 'Registrar asistencia', action: 'open_action', route: '/supervisor/attendance' },
    { label: 'Asignar rutina', action: 'open_action', route: '/supervisor/routines' },
    { label: 'Ver miembros sin rutina', action: 'open_panel', route: '/supervisor/members' },
  ],
  executive: [
    { label: 'Nuevo miembro', action: 'open_action', route: '/ejecutivo/members' },
    { label: 'Registrar pago', action: 'open_action', route: '/ejecutivo/payments' },
    { label: 'Ver proximos cobros', action: 'open_panel', route: '/ejecutivo/payments' },
  ],
}

const keywords: Array<[RegExp, Intent]> = [
  [/market|producto|oferta|suplemento/i, { label: 'Gestionar marketplace', action: 'open_panel', route: '/admin/marketplace' }],
  [/pago|cobro|moroso|venc/i, { label: 'Registrar pago', action: 'open_action', route: '/finances/payments' }],
  [/miembro|cliente|persona/i, { label: 'Buscar miembro', action: 'open_panel', route: '/members' }],
  [/rutina|ejercicio|entren/i, { label: 'Abrir entrenamiento', action: 'open_panel', route: '/training/routines' }],
  [/asistencia|check/i, { label: 'Registrar asistencia', action: 'open_action', route: '/training/attendance' }],
  [/reporte|analytics|metrica/i, { label: 'Ver analytics', action: 'open_panel', route: '/reports' }],
]

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method_not_allowed' })
  }

  const { query = '', role = 'owner' } = req.body || {}
  const base = intents[role] || intents.owner
  const matches = keywords
    .filter(([pattern]) => pattern.test(String(query)))
    .map(([, intent]) => intent)

  const suggestions = [...matches, ...base].filter((item, index, array) => array.findIndex((candidate) => candidate.label === item.label) === index).slice(0, 6)

  return res.status(200).json({
    ok: true,
    action: suggestions[0] || base[0],
    suggestions,
  })
}
