export const gymPlans = [
  { id: 'mensual-full', name: 'Mensual Full', durationDays: 30, price: 149 },
  { id: 'trimestral-pro', name: 'Trimestral Pro', durationDays: 90, price: 399 },
  { id: 'basico', name: 'Basico', durationDays: 30, price: 99 },
]

export const gymPaymentMethods = [
  { id: 'cash', type: 'cash', label: 'Efectivo', active: true, config: {} },
  { id: 'bank_transfer', type: 'bank_transfer', label: 'Transferencia Bancaria', active: true, config: { bank: 'BCP', account: '***4321', holder: 'Pulse Gym Lima' } },
  { id: 'yape', type: 'yape', label: 'Yape', active: true, config: { phone: '+51987088359', qrUrl: '/qr-yape.png' } },
  { id: 'plin', type: 'plin', label: 'Plin', active: false, config: { phone: '+51987088359', qrUrl: '/qr-plin.png' } },
  { id: 'online', type: 'online', label: 'Pago en linea', active: false, config: { gateway: null } },
]

export const members = [
  { id: 'mem-1', name: 'Renato Silva', email: 'renato@gym.test', phone: '987 111 222', plan: 'Mensual Full', status: 'active', endDate: '2026-06-12', lastAttendance: 'Ayer 19:42', avatar: 'RS', risk: 'Bajo' },
  { id: 'mem-2', name: 'Maria Lopez', email: 'maria@gym.test', phone: '987 333 444', plan: 'Trimestral Pro', status: 'pending', endDate: '2026-06-09', lastAttendance: 'Hace 8 dias', avatar: 'ML', risk: 'Medio' },
  { id: 'mem-3', name: 'Lucia Castro', email: 'lucia@gym.test', phone: '987 555 666', plan: 'Basico', status: 'overdue', endDate: '2026-06-02', lastAttendance: 'Hace 14 dias', avatar: 'LC', risk: 'Alto' },
  { id: 'mem-4', name: 'Juan Perez', email: 'juan@gym.test', phone: '987 777 888', plan: 'Mensual Full', status: 'active', endDate: '2026-06-18', lastAttendance: 'Hoy 08:10', avatar: 'JP', risk: 'Bajo' },
  { id: 'mem-5', name: 'Ana Torres', email: 'ana@gym.test', phone: '987 999 000', plan: 'Trimestral Pro', status: 'active', endDate: '2026-06-21', lastAttendance: 'Hoy 07:22', avatar: 'AT', risk: 'Bajo' },
]

export const dashboardData = {
  kpis: {
    membersActive: { value: 142, trend: 12 },
    incomeThisMonth: { value: 4850, trend: 8.5 },
    newMembersThisMonth: { value: 18, trend: -3 },
    attendanceRate: { value: 78.2, trend: 4.1 },
    pendingPayments: { count: 7, amount: 840 },
    atRiskClients: { value: 12 },
  },
  membershipEvolution: [
    ['2025-07', 118], ['2025-08', 121], ['2025-09', 124], ['2025-10', 127], ['2025-11', 130], ['2025-12', 132],
    ['2026-01', 136], ['2026-02', 138], ['2026-03', 139], ['2026-04', 141], ['2026-05', 140], ['2026-06', 142],
  ].map(([month, count]) => ({ month, count })),
  incomeComparison: [
    ['2025-07', 4200, 3980], ['2025-08', 4350, 4100], ['2025-09', 4480, 4300], ['2025-10', 4520, 4390], ['2025-11', 4600, 4450], ['2025-12', 4710, 4520],
    ['2026-01', 4680, 4550], ['2026-02', 4760, 4610], ['2026-03', 4820, 4680], ['2026-04', 4900, 4750], ['2026-05', 4740, 4680], ['2026-06', 4850, 4470],
  ].map(([month, income, previous_income]) => ({ month, income, previous_income })),
  weeklyAttendance: [
    { day: 'Lun', date: '2026-05-26', count: 25 },
    { day: 'Mar', date: '2026-05-27', count: 31 },
    { day: 'Mie', date: '2026-05-28', count: 28 },
    { day: 'Jue', date: '2026-05-29', count: 34 },
    { day: 'Vie', date: '2026-05-30', count: 37 },
    { day: 'Sab', date: '2026-05-31', count: 22 },
    { day: 'Dom', date: '2026-06-01', count: 12 },
  ],
  nextExpirations: members.map((member) => ({
    memberId: member.id,
    name: member.name,
    avatar: member.avatar,
    plan: member.plan,
    endDate: member.endDate,
    status: member.status,
  })),
}

export const payments = [
  { id: 'pay-1', memberId: 'mem-1', member: 'Renato Silva', amount: 149, method: 'Yape', date: '2026-06-04', status: 'paid', proof: true },
  { id: 'pay-2', memberId: 'mem-2', member: 'Maria Lopez', amount: 399, method: 'Transferencia', date: '2026-06-03', status: 'pending', proof: false },
  { id: 'pay-3', memberId: 'mem-3', member: 'Lucia Castro', amount: 99, method: 'Efectivo', date: '2026-06-02', status: 'overdue', proof: false },
]

export const exercises = [
  { id: 'ex-1', name: 'Sentadilla', group: 'Piernas', level: 'Intermedio', image: '/product-protein.svg' },
  { id: 'ex-2', name: 'Press banca', group: 'Pecho', level: 'Intermedio', image: '/product-vitamin.svg' },
  { id: 'ex-3', name: 'Plancha', group: 'Core', level: 'Principiante', image: '/product-cookie.svg' },
]

export const routines = [
  { id: 'rut-1', name: 'Fuerza 8 semanas', objective: 'Fuerza', level: 'Intermedio', exercises: ['Sentadilla', 'Press banca', 'Remo', 'Plancha'], duration: 55 },
  { id: 'rut-2', name: 'Definicion full body', objective: 'Definicion', level: 'Principiante', exercises: ['Plancha', 'Burpees', 'Zancadas'], duration: 42 },
]

export const progressSummary = members.map((member, index) => ({
  memberId: member.id,
  name: member.name,
  avatar: member.avatar,
  lastMeasurement: index === 2 ? 'hace 18 dias' : 'hace 4 dias',
  weight: 78.4 - index * 1.6,
  change: index === 1 ? 1.2 : -2.1,
}))

export const surveys = [
  { id: 'sur-1', member: 'Renato Silva', routine: 'Fuerza 8 semanas', date: '2026-06-03', energy: 4, difficulty: 3, satisfaction: 5, comments: 'Buen entrenamiento, peso retador.' },
  { id: 'sur-2', member: 'Maria Lopez', routine: 'Definicion full body', date: '2026-06-02', energy: 3, difficulty: 5, satisfaction: 3, comments: 'Molestia leve en rodilla.' },
]

export const nutritionPlans = [
  { id: 'nut-1', name: 'Definicion 8 semanas', objective: 'Perdida de peso', calories: 2100, meals: 5, description: 'Plan alto en proteina con deficit moderado.' },
  { id: 'nut-2', name: 'Volumen limpio', objective: 'Ganancia muscular', calories: 2850, meals: 6, description: 'Superavit controlado con comidas faciles.' },
]

export const gateways = [
  { id: 'culqi', name: 'Culqi', logoUrl: '', description: 'Pasarela peruana para tarjetas y pagos online.', requiredFields: ['api_key', 'secret_key', 'webhook_secret'], isActive: true, gymsActive: 3 },
  { id: 'stripe', name: 'Stripe', logoUrl: '', description: 'Pagos internacionales y suscripciones.', requiredFields: ['secret_key', 'public_key'], isActive: false, gymsActive: 0 },
  { id: 'izipay', name: 'Izipay', logoUrl: '', description: 'Pagos con tarjeta para Peru.', requiredFields: ['merchant_id', 'api_key'], isActive: true, gymsActive: 1 },
]

export const integrationRequests = [
  { id: 'int-1', gym: 'Pulse Gym Lima', gateway: 'Culqi', requestedAt: '2026-06-04', status: 'pending', notes: 'Ya tenemos cuenta Culqi.' },
  { id: 'int-2', gym: 'Studio Norte', gateway: 'Izipay', requestedAt: '2026-06-01', status: 'active', notes: 'Configurada por soporte.' },
]

export const platformPaymentMethods = [
  { id: 'yape', name: 'Yape', active: true, phone: '+51987088359', qrUrl: '/qr-yape.png', instructions: 'Escanea el codigo QR desde tu app Yape e ingresa el monto exacto.' },
  { id: 'plin', name: 'Plin', active: true, phone: '+51987088359', qrUrl: '/qr-plin.png', instructions: 'Escanea el codigo QR desde Plin y coloca el codigo de referencia.' },
  { id: 'wire', name: 'Transferencia Bancaria', active: false, bank: 'BCP', account: '000-0000000', cci: '00000000000000000000', holder: 'PulseGym' },
]
