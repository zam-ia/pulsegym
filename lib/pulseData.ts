import type { Role } from './mockData'

export type ModuleKey = string
export type StatusTone = 'good' | 'warning' | 'danger' | 'neutral'

export type Kpi = {
  label: string
  value: string
  trend: string
  tone: StatusTone
}

export type TableRow = {
  primary: string
  secondary: string
  status: string
  metric: string
  owner: string
  due: string
}

export type ModuleDefinition = {
  key: ModuleKey
  title: string
  eyebrow: string
  description: string
  route: string
  icon: string
  roles: Role[]
  submodules: string[]
  roleSubmodules?: Partial<Record<Role, string[]>>
  submoduleRoutes: Record<string, string>
  kpis: Kpi[]
  charts: string[]
  actions: string[]
  modals: string[]
  tableHeaders: string[]
  tableRows: TableRow[]
  highlights: string[]
}

export const roleLabels: Record<Role, string> = {
  superadmin: 'Super Admin',
  owner: 'Admin',
  supervisor: 'Supervisor',
  executive: 'Ejecutivo',
  trainer: 'Entrenador',
  member: 'Miembro',
}

export const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const platformRoles: Role[] = ['superadmin']
const ownerRoles: Role[] = ['owner']
const supervisorRoles: Role[] = ['supervisor']
const executiveRoles: Role[] = ['executive']
const trainerRoles: Role[] = ['trainer']
const memberRoles: Role[] = ['member']

const row = (primary: string, secondary: string, status: string, metric: string, owner: string, due: string): TableRow => ({
  primary,
  secondary,
  status,
  metric,
  owner,
  due,
})

const routes = (base: string, entries: Array<[string, string]>) =>
  Object.fromEntries(entries.map(([label, path]) => [label, path.startsWith('/') ? path : `${base}/${path}`]))

const kpis = (items: Array<[string, string, string, StatusTone]>): Kpi[] =>
  items.map(([label, value, trend, tone]) => ({ label, value, trend, tone }))

const headers = ['Elemento', 'Vista', 'Estado', 'Indicador', 'Responsable', 'Ruta']

export const modules: ModuleDefinition[] = [
  {
    key: 'platform-dashboard',
    title: 'Dashboard Global',
    eyebrow: 'Super Admin',
    description: 'Vision agregada del SaaS: ingresos, MRR, gimnasios activos, miembros finales, riesgo y verificaciones pendientes.',
    route: '/admin/dashboard',
    icon: 'dashboard',
    roles: platformRoles,
    submodules: ['Vista ejecutiva'],
    submoduleRoutes: routes('/admin/dashboard', [['Vista ejecutiva', '/admin/dashboard']]),
    kpis: kpis([
      ['Ingresos actuales', 'S/ 18,940', '+12.4% este mes', 'good'],
      ['MRR', 'S/ 16,280', '42 gimnasios activos', 'good'],
      ['Gimnasios activos', '42', '+6 altas netas', 'good'],
      ['Miembros activos', '9,842', '+620 este mes', 'good'],
      ['Clientes puntuales', '81%', 'asistencia >80%', 'good'],
      ['Clientes en riesgo', '318', 'sin asistencia 30 dias', 'danger'],
    ]),
    charts: ['Ingresos mensuales 12M', 'Gimnasios por plan', 'Riesgo agregado', 'Verificaciones pendientes'],
    actions: ['Exportar PDF', 'Exportar CSV', 'Ver verificaciones', 'Ver morosos'],
    modals: ['Exportar reporte', 'Configurar alerta', 'Comparar periodo'],
    tableHeaders: headers,
    tableRows: [
      row('Iron Club', 'Ultimos registros', 'Pendiente', 'Pro - S/ 149', 'Verificacion', '/admin/verifications'),
      row('Pulse Gym Lima', 'Ultimos registros', 'Activo', 'S/ 42,880', 'Customer Success', '/admin/gyms'),
      row('Titan Fitness', 'Facturacion', 'Vencido', 'S/ 149', 'Cobranza', '/admin/billing'),
      row('Studio Norte', 'Riesgo', 'Atencion', 'Health 58/100', 'Soporte', '/admin/gyms'),
    ],
    highlights: ['Dashboard = ver, entender y decidir', 'La operacion se resuelve en modulos dedicados', 'Cada alerta abre una pagina accionable'],
  },
  {
    key: 'platform-gyms',
    title: 'Gimnasios',
    eyebrow: 'Clientes SaaS',
    description: 'Gestiona gimnasios cliente, detalle 360, suscripcion, metricas y auditoria por tenant.',
    route: '/admin/gyms',
    icon: 'gyms',
    roles: platformRoles,
    submodules: ['Listado', 'Detalle 360', 'Crear gimnasio'],
    submoduleRoutes: routes('/admin/gyms', [
      ['Listado', '/admin/gyms'],
      ['Detalle 360', 'detail'],
      ['Crear gimnasio', 'new'],
    ]),
    kpis: kpis([
      ['Activos', '42', '+6 altas', 'good'],
      ['Trial', '11', '4 vencen pronto', 'warning'],
      ['Suspendidos', '3', 'por deuda', 'danger'],
      ['Health promedio', '78/100', '+5 pts', 'good'],
    ]),
    charts: ['Miembros activos', 'Ingresos mensuales', 'Tasa de asistencia', 'Uso de limites'],
    actions: ['Nuevo gimnasio', 'Cambiar plan', 'Suspender/Reactivar', 'Reset owner'],
    modals: ['Nuevo gimnasio', 'Cambiar plan', 'Suspender gimnasio', 'Restablecer owner'],
    tableHeaders: ['Logo', 'Nombre', 'Estado', 'Plan/Ingresos', 'Responsable', 'Acceso'],
    tableRows: [
      row('Pulse Gym Lima', 'Listado', 'Activo', 'Pro - S/ 42,880', 'Valeria', '/admin/gyms'),
      row('Titan Fitness', 'Detalle 360', 'Suspendido', 'Starter - S/ 149', 'Carlos', '/admin/gyms/detail'),
      row('Iron Club', 'Crear gimnasio', 'Trial', 'Pro - S/ 149', 'Mateo', '/admin/gyms/new'),
    ],
    highlights: ['Detalle con Informacion, Suscripcion, Metricas y Auditoria', 'Crear gimnasio genera owner y trial', 'Suspender no elimina datos'],
  },
  {
    key: 'platform-plans',
    title: 'Planes',
    eyebrow: 'Planes y suscripciones',
    description: 'CRUD de planes, limites, features y suscripciones activas de la plataforma.',
    route: '/admin/plans',
    icon: 'plans',
    roles: platformRoles,
    submodules: ['Planes', 'Crear/Editar plan', 'Suscripciones'],
    submoduleRoutes: {
      Planes: '/admin/plans',
      'Crear/Editar plan': '/admin/plans/editor',
      Suscripciones: '/admin/subscriptions',
    },
    kpis: kpis([
      ['Planes activos', '4', 'Free/Starter/Pro/Enterprise', 'good'],
      ['Suscripciones', '53', '42 activas', 'good'],
      ['Trials', '11', '4 por vencer', 'warning'],
      ['Upsell posible', '8', 'limite alto', 'neutral'],
    ]),
    charts: ['MRR por plan', 'Conversion trial', 'Limites usados', 'Features activas'],
    actions: ['Crear plan', 'Editar limites', 'Forzar renovacion', 'Cancelar suscripcion'],
    modals: ['Crear plan', 'Editar plan', 'Forzar renovacion', 'Cancelar suscripcion'],
    tableHeaders: ['Plan', 'Precio', 'Estado', 'Limites', 'Gimnasios', 'Ruta'],
    tableRows: [
      row('Starter', 'Planes', 'Activo', 'S/ 79 - 200 miembros', '18 gimnasios', '/admin/plans'),
      row('Pro', 'Planes', 'Activo', 'S/ 149 - 500 miembros', '29 gimnasios', '/admin/plans'),
      row('Pulse Gym Lima', 'Suscripciones', 'Activa', 'Pro - prox. cobro 15/06', 'Plataforma', '/admin/subscriptions'),
    ],
    highlights: ['Limites y features se auditan', 'Suscripciones pueden renovarse manualmente', 'Enterprise permite limites personalizados'],
  },
  {
    key: 'platform-billing',
    title: 'Facturacion',
    eyebrow: 'Ingresos plataforma',
    description: 'Facturas SaaS, pagos manuales, estados de cobro, vencidos y reportes contables.',
    route: '/admin/billing',
    icon: 'billing',
    roles: platformRoles,
    submodules: ['Facturas', 'Registrar pago', 'Ingresos'],
    submoduleRoutes: routes('/admin/billing', [
      ['Facturas', '/admin/billing'],
      ['Registrar pago', 'manual-payment'],
      ['Ingresos', 'income'],
    ]),
    kpis: kpis([
      ['Cobrado mes', 'S/ 18,940', '+12.4%', 'good'],
      ['Pendiente', 'S/ 3,480', '18 facturas', 'warning'],
      ['Vencido', 'S/ 1,140', '6 gimnasios', 'danger'],
      ['MRR manual', 'S/ 16,280', 'normalizado', 'good'],
    ]),
    charts: ['Barras mensual', 'Vencidos por plan', 'Pagos por metodo', 'Proyeccion contable'],
    actions: ['Registrar pago manual', 'Enviar recordatorio', 'Adjuntar comprobante', 'Exportar contable'],
    modals: ['Registrar pago manual', 'Enviar recordatorio', 'Adjuntar comprobante', 'Exportar reporte'],
    tableHeaders: ['Factura', 'Gimnasio', 'Estado', 'Monto', 'Responsable', 'Ruta'],
    tableRows: [
      row('INV-1041', 'Facturas', 'Vencido', 'S/ 149', 'Cobranza', '/admin/billing'),
      row('INV-1042', 'Registrar pago', 'Pagado', 'S/ 149', 'Caja', '/admin/billing/manual-payment'),
      row('Ingresos Junio', 'Ingresos', 'Activo', 'S/ 18,940', 'Founder', '/admin/billing/income'),
    ],
    highlights: ['Pago manual actualiza factura', 'Reportes exportables', 'Vencidos impactan estado del gimnasio'],
  },
  {
    key: 'platform-verifications',
    title: 'Verificaciones',
    eyebrow: 'Altas manuales',
    description: 'Revision de comprobantes de nuevos registros. Aprobar crea gimnasio, owner y suscripcion; rechazar conserva motivo y auditoria.',
    route: '/admin/verifications',
    icon: 'verification',
    roles: platformRoles,
    submodules: ['Pendientes', 'Aprobadas', 'Rechazadas'],
    submoduleRoutes: routes('/admin/verifications', [
      ['Pendientes', '/admin/verifications'],
      ['Aprobadas', 'approved'],
      ['Rechazadas', 'rejected'],
    ]),
    kpis: kpis([
      ['Pendientes', '7', '4 con captura', 'warning'],
      ['Aprobadas', '18', 'este mes', 'good'],
      ['Rechazadas', '3', 'datos incompletos', 'danger'],
      ['Tiempo promedio', '22 min', 'SLA manual', 'neutral'],
    ]),
    charts: ['Verificaciones por dia', 'Metodos de pago', 'Planes solicitados', 'Tiempo de aprobacion'],
    actions: ['Aprobar verificacion', 'Rechazar verificacion', 'Ampliar captura', 'Enviar credenciales'],
    modals: ['Aprobar verificacion', 'Rechazar verificacion', 'Ver captura', 'Auditar decision'],
    tableHeaders: ['Solicitud', 'Plan', 'Estado', 'Monto', 'Metodo', 'Ruta'],
    tableRows: [
      row('Iron Club', 'Pendientes', 'Pendiente', 'Pro - S/ 149', 'Yape', '/admin/verifications'),
      row('Fit Norte', 'Aprobadas', 'Aprobada', 'Starter - S/ 79', 'Plin', '/admin/verifications/approved'),
      row('Box 360', 'Rechazadas', 'Rechazada', 'Enterprise', 'WhatsApp', '/admin/verifications/rejected'),
    ],
    highlights: ['Capturas deben vivir en Storage privado', 'Aprobar dispara correo/WhatsApp', 'Cada decision escribe audit_logs'],
  },
  {
    key: 'platform-strategies',
    title: 'Estrategias',
    eyebrow: 'Contenido global',
    description: 'CRUD de articulos Markdown, categorias, etiquetas y vista previa para publicar contenido a gimnasios.',
    route: '/admin/strategies',
    icon: 'strategy',
    roles: platformRoles,
    submodules: ['Articulos', 'Categorias', 'Vista previa'],
    submoduleRoutes: routes('/admin/strategies', [
      ['Articulos', '/admin/strategies'],
      ['Categorias', 'categories'],
      ['Vista previa', 'preview'],
    ]),
    kpis: kpis([
      ['Publicados', '24', '+5 este mes', 'good'],
      ['Borradores', '7', 'por revisar', 'warning'],
      ['Lecturas', '1,284', '+31%', 'good'],
      ['Top categoria', 'Retencion', '42%', 'neutral'],
    ]),
    charts: ['Lecturas', 'Categorias', 'Uso por gimnasio', 'Contenido top'],
    actions: ['Crear articulo', 'Publicar', 'Vista previa', 'Archivar'],
    modals: ['Crear articulo', 'Editar articulo', 'Publicar estrategia', 'Crear categoria'],
    tableHeaders: headers,
    tableRows: [
      row('Recuperar miembros ausentes', 'Articulos', 'Publicado', '342 lecturas', 'CS', '/admin/strategies'),
      row('Cobranza por WhatsApp', 'Vista previa', 'Borrador', 'Revision', 'Founder', '/admin/strategies/preview'),
    ],
    highlights: ['Markdown con preview', 'Etiquetas por objetivo', 'Publicar notifica a admins'],
  },
  {
    key: 'platform-audit',
    title: 'Auditoria',
    eyebrow: 'Trazabilidad',
    description: 'Logs filtrables por fecha, actor, gimnasio, accion, entidad y JSON expandible.',
    route: '/admin/audit',
    icon: 'audit',
    roles: platformRoles,
    submodules: ['Logs', 'Exportaciones'],
    submoduleRoutes: routes('/admin/audit', [
      ['Logs', '/admin/audit'],
      ['Exportaciones', 'exports'],
    ]),
    kpis: kpis([
      ['Eventos mes', '284', '+18%', 'neutral'],
      ['Criticos', '9', 'requieren revision', 'danger'],
      ['Exportaciones', '12', 'CSV/PDF', 'neutral'],
      ['Suplantaciones', '3', 'auditadas', 'warning'],
    ]),
    charts: ['Eventos por tipo', 'Acciones criticas', 'Actividad por usuario', 'Exportaciones'],
    actions: ['Ver detalle JSON', 'Exportar logs', 'Filtrar actor', 'Marcar revisado'],
    modals: ['Detalle auditoria', 'Exportar logs', 'Filtrar auditoria'],
    tableHeaders: ['Fecha', 'Actor', 'Estado', 'Entidad', 'Gimnasio/IP', 'Ruta'],
    tableRows: [
      row('Hoy 10:12', 'Super Admin', 'Critico', 'Cambio de plan', 'Titan Fitness', '/admin/audit'),
      row('Ayer 18:30', 'Sistema', 'Alerta', 'Factura vencida', 'INV-1041', '/admin/audit'),
    ],
    highlights: ['Logs no se eliminan desde UI', 'Detalles JSON expandibles', 'Exportacion auditada'],
  },
  {
    key: 'platform-marketplace',
    title: 'Marketplace',
    eyebrow: 'Productos y descuentos',
    description: 'Administracion de productos, precios con descuento y codigos para venta cruzada por WhatsApp.',
    route: '/admin/marketplace',
    icon: 'store',
    roles: platformRoles,
    submodules: ['Catalogo'],
    submoduleRoutes: routes('/admin/marketplace', [
      ['Catalogo', '/admin/marketplace'],
    ]),
    kpis: kpis([
      ['Productos activos', '3', 'catalogo publico', 'good'],
      ['Productos en oferta', '3', 'destacados', 'warning'],
      ['Productos agotados', '1', 'stock', 'danger'],
      ['Solicitudes totales', '70', 'WhatsApp', 'good'],
    ]),
    charts: ['Solicitudes por producto', 'Productos destacados', 'Stock', 'Cross-selling'],
    actions: ['Nuevo producto', 'Editar producto', 'Duplicar', 'Vista previa'],
    modals: ['Nuevo producto', 'Editar producto', 'Eliminar producto', 'Vista previa'],
    tableHeaders: ['Imagen', 'Producto', 'Estado', 'Precio', 'Codigo', 'Ruta'],
    tableRows: [
      row('Whey Protein Gold', 'Productos', 'Activo', 'S/ 189 -> S/ 149', 'GYM20', '/admin/marketplace'),
      row('Vitamin Pack Energy', 'Catalogo', 'Activo', 'S/ 129 -> S/ 99', 'VITAMIN20', '/admin/marketplace'),
      row('Galletas proteicas', 'Productos', 'Activo', 'S/ 49 -> S/ 35', 'COOKIE15', '/admin/marketplace'),
    ],
    highlights: ['Catalogo unico sin pagina de detalle', 'active controla publicacion', 'featured controla ofertas visibles'],
  },
  {
    key: 'platform-settings',
    title: 'Configuracion',
    eyebrow: 'Plataforma',
    description: 'Marca global, moneda, zona horaria, plantillas de email, WhatsApp API y disparadores automaticos futuros.',
    route: '/admin/settings',
    icon: 'settings',
    roles: platformRoles,
    submodules: ['General', 'Cobros plataforma', 'Integraciones', 'Solicitudes', 'Plantillas', 'WhatsApp'],
    submoduleRoutes: routes('/admin/settings', [
      ['General', '/admin/settings'],
      ['Cobros plataforma', 'platform-payments'],
      ['Integraciones', 'integrations'],
      ['Solicitudes', 'integration-requests'],
      ['Plantillas', 'templates'],
      ['WhatsApp', 'whatsapp'],
    ]),
    kpis: kpis([
      ['Moneda default', 'PEN', 'America/Lima', 'neutral'],
      ['Plantillas', '12', 'email/WhatsApp', 'good'],
      ['Integraciones', '4', '2 activas', 'warning'],
      ['Seguridad', 'Alta', 'logs activos', 'good'],
    ]),
    charts: ['Plantillas', 'Integraciones', 'Disparadores', 'Preferencias'],
    actions: ['Guardar ajustes', 'Crear plantilla', 'Configurar WhatsApp', 'Configurar disparador'],
    modals: ['Guardar ajustes', 'Crear plantilla', 'Configurar WhatsApp', 'Confirmar accion critica'],
    tableHeaders: headers,
    tableRows: [
      row('PulseGym', 'General', 'Activo', 'Marca global', 'Founder', '/admin/settings'),
      row('Yape/Plin', 'Cobros plataforma', 'Activo', '+51987088359', 'Founder', '/admin/settings/platform-payments'),
      row('Culqi', 'Integraciones', 'Activa', '3 gimnasios', 'Tecnico', '/admin/settings/integrations'),
      row('Pulse Gym Lima', 'Solicitudes', 'Pendiente', 'Culqi', 'Super Admin', '/admin/settings/integration-requests'),
    ],
    highlights: ['Secretos nunca se muestran en cliente', 'Plantillas soportan variables', 'Automatizaciones futuras se activan aqui'],
  },

  {
    key: 'gym-dashboard',
    title: 'Dashboard',
    eyebrow: 'Admin gimnasio',
    description: 'Panel operativo del gimnasio: miembros, ingresos, asistencia, pagos pendientes, riesgo y proximos vencimientos.',
    route: '/dashboard',
    icon: 'dashboard',
    roles: ownerRoles,
    submodules: ['Vista general'],
    submoduleRoutes: routes('/dashboard', [['Vista general', '/dashboard']]),
    kpis: kpis([
      ['Miembros activos', '421', '+18 este mes', 'good'],
      ['Ingresos del mes', 'S/ 42,880', '+9.8%', 'good'],
      ['Nuevos miembros', '34', 'mes actual', 'good'],
      ['Asistencia', '76%', '+4 pts', 'good'],
      ['Pagos pendientes', '31', 'S/ 4,820', 'warning'],
      ['Clientes en riesgo', '19', 'sin asistencia', 'danger'],
    ]),
    charts: ['Evolucion membresias', 'Ingresos vs mes anterior', 'Asistencia semanal', 'Proximos vencimientos'],
    actions: ['Nuevo miembro', 'Registrar pago', 'Ver vencimientos', 'Contactar riesgo'],
    modals: ['Nuevo miembro', 'Registrar pago', 'Enviar recordatorio'],
    tableHeaders: headers,
    tableRows: [
      row('Lucia Castro', 'Proximos vencimientos', 'Pendiente', 'Vence en 2 dias', 'Ejecutivo', '/finances/payments'),
      row('Renato Silva', 'Riesgo', 'Atencion', '12 dias ausente', 'Supervisor', '/tracking/progress'),
      row('Caja diaria', 'Finanzas', 'Activo', 'S/ 1,240 hoy', 'Admin', '/finances/income'),
    ],
    highlights: ['Acciones rapidas: miembro y pago', 'Solo Admin ve configuracion completa', 'Riesgo cruza pagos y asistencia'],
  },
  {
    key: 'members',
    title: 'Miembros',
    eyebrow: 'CRM',
    description: 'Lista, ficha 360 y alta de miembros con membresia inicial y primer pago pendiente.',
    route: '/members',
    icon: 'members',
    roles: ownerRoles,
    submodules: ['Lista', 'Ficha miembro', 'Nuevo miembro'],
    submoduleRoutes: routes('/members', [
      ['Lista', '/members'],
      ['Ficha miembro', 'detail'],
      ['Nuevo miembro', 'new'],
    ]),
    kpis: kpis([
      ['Activos', '421', '+18', 'good'],
      ['Pendientes', '14', 'alta incompleta', 'warning'],
      ['Morosos', '31', 'requieren cobro', 'danger'],
      ['Ultima asistencia', '186', 'hoy', 'good'],
    ]),
    charts: ['Membresias por estado', 'Ultima asistencia', 'Renovaciones', 'Riesgo'],
    actions: ['Nuevo miembro', 'Renovar/Cambiar membresia', 'Registrar pago', 'Enviar mensaje'],
    modals: ['Nuevo miembro', 'Editar miembro', 'Registrar pago', 'Asignar rutina'],
    tableHeaders: ['Foto', 'Miembro', 'Estado', 'Membresia', 'Ultima asistencia', 'Ruta'],
    tableRows: [
      row('Renato Silva', 'Lista', 'Activo', 'Pro vence 15/06', 'Ayer', '/members'),
      row('Maria Lopez', 'Ficha miembro', 'Atencion', 'Starter vence hoy', 'Hace 8 dias', '/members/detail'),
      row('Nuevo prospecto', 'Nuevo miembro', 'Pendiente', 'Pago inicial', 'Ejecutivo', '/members/new'),
    ],
    highlights: ['Ficha: Perfil, Pagos, Asistencia, Rutinas, Progreso y Notas', 'Nuevo miembro genera primer pago pendiente', 'Notas internas solo administrativas'],
  },
  {
    key: 'gym-finance',
    title: 'Finanzas',
    eyebrow: 'Ventas y caja',
    description: 'Pagos, ingresos, caja diaria y cobranza por miembro o membresia.',
    route: '/finances',
    icon: 'finance',
    roles: ownerRoles,
    submodules: ['Pagos', 'Ingresos', 'Caja diaria'],
    submoduleRoutes: routes('/finances', [
      ['Pagos', 'payments'],
      ['Ingresos', 'income'],
      ['Caja diaria', 'daily-cash'],
    ]),
    kpis: kpis([
      ['Pagado hoy', 'S/ 1,240', '18 transacciones', 'good'],
      ['Pendiente', 'S/ 4,820', '31 miembros', 'warning'],
      ['Vencido', 'S/ 2,140', '12 miembros', 'danger'],
      ['Ticket promedio', 'S/ 126', '+6%', 'good'],
    ]),
    charts: ['Ingresos del mes', 'Comparativa', 'Membresias', 'Caja diaria'],
    actions: ['Registrar pago manual', 'Marcar pagado', 'Editar pago', 'Exportar reporte'],
    modals: ['Registrar pago', 'Editar pago', 'Marcar pagado', 'Exportar'],
    tableHeaders: ['Transaccion', 'Miembro', 'Estado', 'Monto', 'Metodo', 'Ruta'],
    tableRows: [
      row('PAY-8821', 'Pagos', 'Pagado', 'S/ 149', 'Yape', '/finances/payments'),
      row('PAY-8822', 'Pagos', 'Vencido', 'S/ 119', 'Efectivo', '/finances/payments'),
      row('Ingresos junio', 'Ingresos', 'Activo', 'S/ 42,880', 'Caja', '/finances/income'),
    ],
    highlights: ['Ejecutivo puede registrar pagos', 'Admin ve reportes completos', 'Caja diaria resume ingresos del dia'],
  },
  {
    key: 'training',
    title: 'Entrenamiento',
    eyebrow: 'Rutinas y asistencia',
    description: 'Ejercicios, rutinas, asignaciones y asistencia con check-in manual o QR futuro.',
    route: '/training',
    icon: 'training',
    roles: ownerRoles,
    submodules: ['Ejercicios', 'Rutinas', 'Asignar rutina', 'Asistencias'],
    submoduleRoutes: routes('/training', [
      ['Ejercicios', 'exercises'],
      ['Rutinas', 'routines'],
      ['Asignar rutina', 'routines/assign'],
      ['Asistencias', 'attendance'],
    ]),
    kpis: kpis([
      ['Ejercicios', '248', 'biblioteca', 'good'],
      ['Rutinas activas', '74', '+8', 'good'],
      ['Sin rutina', '12', 'requieren accion', 'warning'],
      ['Check-ins hoy', '186', '76%', 'good'],
    ]),
    charts: ['Ocupacion diaria', 'Rutinas por objetivo', 'Asistencia semanal', 'Miembros sin rutina'],
    actions: ['Crear ejercicio', 'Crear rutina', 'Asignar rutina', 'Registrar check-in'],
    modals: ['Crear ejercicio', 'Crear rutina', 'Asignar rutina', 'Registrar asistencia'],
    tableHeaders: ['Elemento', 'Tipo', 'Estado', 'Detalle', 'Responsable', 'Ruta'],
    tableRows: [
      row('Sentadilla', 'Ejercicios', 'Activo', 'Piernas - Medio', 'Supervisor', '/training/exercises'),
      row('Fuerza 8 semanas', 'Rutinas', 'Activo', '12 ejercicios', 'Entrenador', '/training/routines'),
      row('Renato Silva', 'Asistencias', 'Registrado', 'Check-in 19:42', 'Recepcion', '/training/attendance'),
    ],
    highlights: ['Rutinas se arman desde biblioteca', 'Asistencia alimenta riesgo', 'QR queda como opcion futura'],
  },
  {
    key: 'tracking',
    title: 'Seguimiento',
    eyebrow: 'Clientes',
    description: 'Progreso, mediciones, fotos comparativas y encuestas post-entrenamiento.',
    route: '/tracking',
    icon: 'tracking',
    roles: ownerRoles,
    submodules: ['Progreso', 'Encuestas'],
    submoduleRoutes: routes('/tracking', [
      ['Progreso', 'progress'],
      ['Encuestas', 'surveys'],
    ]),
    kpis: kpis([
      ['Mediciones semana', '68', '+12', 'good'],
      ['Fotos nuevas', '24', 'comparativas', 'neutral'],
      ['Encuestas', '41', '8 bajas', 'warning'],
      ['Satisfaccion', '4.4/5', '+0.2', 'good'],
    ]),
    charts: ['Peso promedio', 'Medidas', 'Satisfaccion por rutina', 'Alertas'],
    actions: ['Registrar medicion', 'Comparar fotos', 'Revisar encuesta', 'Escalar alerta'],
    modals: ['Registrar medicion', 'Subir foto', 'Revisar encuesta', 'Escalar alerta'],
    tableHeaders: ['Miembro', 'Vista', 'Estado', 'Indicador', 'Responsable', 'Ruta'],
    tableRows: [
      row('Renato Silva', 'Progreso', 'Activo', '-2.1 kg', 'Andrea', '/tracking/progress'),
      row('Maria Lopez', 'Encuestas', 'Atencion', 'Dolor rodilla', 'Supervisor', '/tracking/surveys'),
    ],
    highlights: ['Notas viven en ficha del miembro', 'Fotos comparativas por fecha', 'Encuestas agregan satisfaccion por rutina'],
  },
  {
    key: 'nutrition',
    title: 'Nutricion',
    eyebrow: 'Modulo opcional',
    description: 'Planes nutricionales, comidas, recetas y asignacion desde ficha de miembro.',
    route: '/nutrition',
    icon: 'nutrition',
    roles: ownerRoles,
    submodules: ['Planes nutricionales', 'Recetas'],
    submoduleRoutes: routes('/nutrition', [
      ['Planes nutricionales', 'plans'],
      ['Recetas', 'recipes'],
    ]),
    kpis: kpis([
      ['Planes activos', '18', '+3', 'good'],
      ['Asignados', '64', '15%', 'neutral'],
      ['Recetas', '42', 'biblioteca', 'good'],
      ['Pendientes', '7', 'revision', 'warning'],
    ]),
    charts: ['Planes', 'Asignaciones', 'Objetivos', 'Adherencia'],
    actions: ['Crear plan', 'Crear receta', 'Asignar plan', 'Archivar'],
    modals: ['Crear plan nutricional', 'Crear receta', 'Asignar plan', 'Archivar plan'],
    tableHeaders: ['Plan', 'Objetivo', 'Estado', 'Asignados', 'Responsable', 'Ruta'],
    tableRows: [
      row('Definicion 8 semanas', 'Planes nutricionales', 'Activo', '24', 'Admin', '/nutrition/plans'),
      row('Recetas proteicas', 'Recetas', 'Publicado', '42', 'Admin', '/nutrition/recipes'),
    ],
    highlights: ['Modulo opcional por plan', 'Comidas por desayuno/almuerzo/cena/snacks', 'Miembro ve solo plan asignado'],
  },
  {
    key: 'store',
    title: 'Tienda',
    eyebrow: 'Productos recomendados',
    description: 'Ofertas exclusivas para gimnasios registrados con codigos de descuento y solicitud directa por WhatsApp.',
    route: '/store',
    icon: 'store',
    roles: ['owner', 'supervisor', 'executive'],
    submodules: ['Productos recomendados'],
    submoduleRoutes: routes('/store', [['Productos recomendados', '/store']]),
    kpis: kpis([
      ['Productos activos', '3', 'descuentos', 'good'],
      ['Mejor oferta', 'GYM20', 'Whey Protein', 'good'],
      ['Ahorro maximo', 'S/ 40', 'por pedido', 'neutral'],
      ['Canal', 'WhatsApp', 'manual', 'neutral'],
    ]),
    charts: ['Productos', 'Solicitudes', 'Codigos', 'Ofertas'],
    actions: ['Solicitar producto', 'Copiar codigo', 'Ver catalogo', 'Contactar'],
    modals: ['Solicitar producto', 'Ver detalle producto'],
    tableHeaders: ['Producto', 'Vista', 'Estado', 'Precio', 'Codigo', 'Ruta'],
    tableRows: [
      row('Whey Protein Gold', 'Productos recomendados', 'Activo', 'S/ 149', 'GYM20', '/store'),
      row('Vitamin Pack Energy', 'Productos recomendados', 'Activo', 'S/ 99', 'VITAMIN20', '/store'),
      row('Galletas proteicas', 'Productos recomendados', 'Activo', 'S/ 35', 'COOKIE15', '/store'),
    ],
    highlights: ['No invasivo', 'WhatsApp directo', 'Mismo catalogo que /productos'],
  },
  {
    key: 'reports',
    title: 'Reportes',
    eyebrow: 'Analisis',
    description: 'Reportes separados de asistencia, financiero, membresias y progreso con exportacion.',
    route: '/reports',
    icon: 'reports',
    roles: ownerRoles,
    submodules: ['Asistencia', 'Financiero', 'Membresias', 'Progreso'],
    submoduleRoutes: routes('/reports', [
      ['Asistencia', 'attendance'],
      ['Financiero', 'financial'],
      ['Membresias', 'memberships'],
      ['Progreso', 'progress'],
    ]),
    kpis: kpis([
      ['Reportes guardados', '16', 'por rol', 'neutral'],
      ['Exportaciones', '38', 'mes actual', 'good'],
      ['Insights', '7', 'accionables', 'warning'],
      ['Ultimo reporte', 'Hoy', 'xlsx', 'neutral'],
    ]),
    charts: ['Asistencia', 'Finanzas', 'Membresias', 'Progreso'],
    actions: ['Filtrar', 'Exportar CSV', 'Exportar PDF', 'Comparar periodo'],
    modals: ['Filtro reporte', 'Exportar CSV', 'Exportar PDF', 'Comparar periodo'],
    tableHeaders: ['Reporte', 'Vista', 'Estado', 'Formato', 'Responsable', 'Ruta'],
    tableRows: [
      row('Asistencia semanal', 'Asistencia', 'Activo', 'Dashboard', 'Supervisor', '/reports/attendance'),
      row('Ingresos mensual', 'Financiero', 'Activo', 'PDF/XLSX', 'Admin', '/reports/financial'),
      row('Retencion', 'Membresias', 'Programado', 'Semanal', 'Admin', '/reports/memberships'),
    ],
    highlights: ['Cada reporte es una pagina separada', 'Exportacion auditable', 'Comparativas por periodo'],
  },
  {
    key: 'gym-settings',
    title: 'Configuracion',
    eyebrow: 'Gimnasio',
    description: 'Perfil, equipo, preferencias y suscripcion del gimnasio.',
    route: '/settings',
    icon: 'settings',
    roles: ownerRoles,
    submodules: ['Perfil', 'Equipo', 'Metodos de pago', 'Integraciones', 'Preferencias', 'Suscripcion'],
    submoduleRoutes: routes('/settings', [
      ['Perfil', 'profile'],
      ['Equipo', 'team'],
      ['Metodos de pago', 'payment-methods'],
      ['Integraciones', 'integrations'],
      ['Preferencias', 'preferences'],
      ['Suscripcion', 'subscription'],
    ]),
    kpis: kpis([
      ['Usuarios internos', '12', 'roles activos', 'neutral'],
      ['Plan contratado', 'Pro', 'renueva 15/06', 'good'],
      ['Recordatorios', 'Activos', 'email futuro', 'good'],
      ['Permisos', 'Fijos', 'personalizable futuro', 'neutral'],
    ]),
    charts: ['Equipo', 'Preferencias', 'Notificaciones', 'Suscripcion'],
    actions: ['Editar perfil', 'Invitar usuario', 'Guardar preferencias', 'Contactar upgrade'],
    modals: ['Editar perfil', 'Invitar usuario', 'Guardar preferencias', 'Ver suscripcion'],
    tableHeaders: ['Configuracion', 'Vista', 'Estado', 'Detalle', 'Responsable', 'Ruta'],
    tableRows: [
      row('Logo y datos', 'Perfil', 'Activo', 'Pulse Gym Lima', 'Admin', '/settings/profile'),
      row('Andrea Vega', 'Equipo', 'Supervisor', 'Entrenamiento', 'Admin', '/settings/team'),
      row('Yape', 'Metodos de pago', 'Activo', '+51987088359', 'Admin', '/settings/payment-methods'),
      row('Culqi', 'Integraciones', 'Pendiente', 'Solicitud enviada', 'Admin', '/settings/integrations'),
      row('Plan Pro', 'Suscripcion', 'Solo lectura', 'S/ 149', 'Plataforma', '/settings/subscription'),
    ],
    highlights: ['Admin no cambia plan SaaS directamente', 'Equipo maneja supervisor/ejecutivo/entrenador', 'Upgrade via soporte WhatsApp'],
  },
]

const addRoleModule = (module: ModuleDefinition) => modules.push(module)

addRoleModule({
  key: 'supervisor-dashboard',
  title: 'Dashboard Op.',
  eyebrow: 'Supervisor',
  description: 'Asistencia del dia, rutinas pendientes, encuestas por revisar y miembros con inasistencia.',
  route: '/supervisor/dashboard',
  icon: 'dashboard',
  roles: supervisorRoles,
  submodules: ['Vista operativa'],
  submoduleRoutes: routes('/supervisor/dashboard', [['Vista operativa', '/supervisor/dashboard']]),
  kpis: kpis([
    ['Asistencia hoy', '186', 'check-ins', 'good'],
    ['Tasa semanal', '76%', '+4 pts', 'good'],
    ['Sin rutina', '12', 'requieren accion', 'warning'],
    ['Encuestas', '8', 'pendientes', 'warning'],
  ]),
  charts: ['Asistencia semanal', 'Sin rutina', 'Encuestas', 'Inasistencia'],
  actions: ['Registrar asistencia', 'Asignar rutina', 'Revisar encuesta', 'Contactar miembro'],
  modals: ['Registrar asistencia', 'Asignar rutina', 'Revisar encuesta'],
  tableHeaders: headers,
  tableRows: [
    row('Renato Silva', 'Inasistencia', 'Atencion', '8 dias sin asistir', 'Supervisor', '/supervisor/members'),
    row('Fuerza 8 semanas', 'Rutinas', 'Pendiente', 'Asignar a 4 miembros', 'Entrenador', '/supervisor/routines'),
  ],
  highlights: ['No ve finanzas', 'Puede operar entrenamiento y asistencia', 'Miembros en lectura limitada'],
})

addRoleModule({
  key: 'supervisor-members',
  title: 'Miembros',
  eyebrow: 'Vista limitada',
  description: 'Lista y ficha de miembro sin pagos ni notas internas.',
  route: '/supervisor/members',
  icon: 'members',
  roles: supervisorRoles,
  submodules: ['Lista', 'Ficha limitada'],
  submoduleRoutes: routes('/supervisor/members', [
    ['Lista', '/supervisor/members'],
    ['Ficha limitada', 'detail'],
  ]),
  kpis: kpis([
    ['Activos visibles', '421', 'solo lectura', 'good'],
    ['Sin rutina', '12', 'pendiente', 'warning'],
    ['Ausentes', '19', '>7 dias', 'danger'],
    ['Progreso reciente', '68', 'mediciones', 'good'],
  ]),
  charts: ['Asistencia', 'Rutinas', 'Progreso', 'Ausentes'],
  actions: ['Ver ficha', 'Asignar rutina', 'Registrar progreso', 'Reportar alerta'],
  modals: ['Ver ficha', 'Asignar rutina', 'Registrar progreso'],
  tableHeaders: ['Miembro', 'Vista', 'Estado', 'Indicador', 'Responsable', 'Ruta'],
  tableRows: [
    row('Renato Silva', 'Lista', 'Activo', 'Rutina asignada', 'Marco', '/supervisor/members'),
    row('Maria Lopez', 'Ficha limitada', 'Atencion', 'Dolor rodilla', 'Andrea', '/supervisor/members/detail'),
  ],
  highlights: ['Perfil solo lectura', 'Sin pagos', 'Sin notas internas'],
})

addRoleModule({
  key: 'supervisor-training',
  title: 'Entrenamiento',
  eyebrow: 'Operacion',
  description: 'Ejercicios, rutinas y asistencias para el jefe de entrenadores.',
  route: '/supervisor/exercises',
  icon: 'training',
  roles: supervisorRoles,
  submodules: ['Ejercicios', 'Rutinas', 'Asistencias'],
  submoduleRoutes: {
    Ejercicios: '/supervisor/exercises',
    Rutinas: '/supervisor/routines',
    Asistencias: '/supervisor/attendance',
  },
  kpis: kpis([
    ['Ejercicios', '248', 'CRUD activo', 'good'],
    ['Rutinas', '74', 'asignables', 'good'],
    ['Asistencias hoy', '186', 'registro activo', 'good'],
    ['Alertas', '12', 'sin rutina', 'warning'],
  ]),
  charts: ['Rutinas', 'Asistencia', 'Objetivos', 'Alertas'],
  actions: ['Crear ejercicio', 'Crear rutina', 'Registrar asistencia', 'Asignar'],
  modals: ['Crear ejercicio', 'Crear rutina', 'Registrar asistencia'],
  tableHeaders: headers,
  tableRows: [
    row('Sentadilla', 'Ejercicios', 'Activo', 'Piernas', 'Supervisor', '/supervisor/exercises'),
    row('Fuerza 8 semanas', 'Rutinas', 'Activo', '12 ejercicios', 'Supervisor', '/supervisor/routines'),
    row('Check-in manual', 'Asistencias', 'Activo', '186 hoy', 'Recepcion', '/supervisor/attendance'),
  ],
  highlights: ['Eliminar ejercicios puede restringirse a Admin', 'Asistencia exportable', 'Rutinas asignables'],
})

addRoleModule({
  key: 'supervisor-tracking',
  title: 'Seguimiento',
  eyebrow: 'Progreso',
  description: 'Progreso y encuestas sin acceso financiero.',
  route: '/supervisor/progress',
  icon: 'tracking',
  roles: supervisorRoles,
  submodules: ['Progreso', 'Encuestas'],
  submoduleRoutes: {
    Progreso: '/supervisor/progress',
    Encuestas: '/supervisor/surveys',
  },
  kpis: kpis([
    ['Mediciones', '68', 'semana', 'good'],
    ['Encuestas', '41', 'respondidas', 'neutral'],
    ['Satisfaccion', '4.4/5', '+0.2', 'good'],
    ['Alertas', '8', 'revisar', 'warning'],
  ]),
  charts: ['Peso', 'Medidas', 'Encuestas', 'Satisfaccion'],
  actions: ['Registrar medicion', 'Subir foto', 'Revisar encuesta', 'Reportar alerta'],
  modals: ['Registrar medicion', 'Subir foto', 'Revisar encuesta'],
  tableHeaders: headers,
  tableRows: [
    row('Renato Silva', 'Progreso', 'Activo', '-2.1 kg', 'Andrea', '/supervisor/progress'),
    row('Encuesta post rutina', 'Encuestas', 'Atencion', 'Dificultad alta', 'Supervisor', '/supervisor/surveys'),
  ],
  highlights: ['Puede registrar mediciones', 'Encuestas solo lectura', 'Sin finanzas'],
})

addRoleModule({
  key: 'supervisor-reports',
  title: 'Reportes',
  eyebrow: 'Limitados',
  description: 'Reportes de asistencia y progreso, sin reportes financieros.',
  route: '/supervisor/reports',
  icon: 'reports',
  roles: supervisorRoles,
  submodules: ['Asistencia', 'Progreso'],
  submoduleRoutes: routes('/supervisor/reports', [
    ['Asistencia', 'attendance'],
    ['Progreso', 'progress'],
  ]),
  kpis: kpis([
    ['Asistencia', '76%', 'semana', 'good'],
    ['Progreso', '68', 'mediciones', 'good'],
    ['Exportaciones', '12', 'mes', 'neutral'],
    ['Alertas', '8', 'pendientes', 'warning'],
  ]),
  charts: ['Asistencia', 'Progreso', 'Frecuencia', 'Ausentes'],
  actions: ['Filtrar', 'Exportar', 'Comparar', 'Guardar vista'],
  modals: ['Filtrar reporte', 'Exportar reporte'],
  tableHeaders: headers,
  tableRows: [
    row('Asistencia semanal', 'Asistencia', 'Activo', 'CSV/PDF', 'Supervisor', '/supervisor/reports/attendance'),
    row('Progreso general', 'Progreso', 'Activo', 'Dashboard', 'Supervisor', '/supervisor/reports/progress'),
  ],
  highlights: ['Sin financiero', 'Exportable', 'Orientado a operacion'],
})

addRoleModule({
  key: 'executive-dashboard',
  title: 'Dashboard Comercial',
  eyebrow: 'Ejecutivo',
  description: 'Ingresos, nuevos miembros, membresias por vencer, pagos pendientes y conversion.',
  route: '/ejecutivo/dashboard',
  icon: 'dashboard',
  roles: executiveRoles,
  submodules: ['Vista comercial'],
  submoduleRoutes: routes('/ejecutivo/dashboard', [['Vista comercial', '/ejecutivo/dashboard']]),
  kpis: kpis([
    ['Ingresos mes', 'S/ 42,880', '+9.8%', 'good'],
    ['Nuevos miembros', '34', 'mes actual', 'good'],
    ['Por vencer', '27', 'proximos 7 dias', 'warning'],
    ['Pagos pendientes', '31', 'S/ 4,820', 'danger'],
  ]),
  charts: ['Ingresos diarios', 'Conversion', 'Proximos cobros', 'Membresias'],
  actions: ['Nuevo miembro', 'Registrar pago', 'Ver proximos cobros', 'Exportar financiero'],
  modals: ['Nuevo miembro', 'Registrar pago', 'Exportar'],
  tableHeaders: headers,
  tableRows: [
    row('Lucia Castro', 'Proximos cobros', 'Pendiente', 'S/ 149', 'Ejecutivo', '/ejecutivo/payments'),
    row('Nuevo lead', 'Miembros', 'Pendiente', 'Alta con membresia', 'Ejecutivo', '/ejecutivo/members/new'),
  ],
  highlights: ['No ve rutinas ni progreso', 'Puede crear miembros y cobrar', 'Reportes financieros unicamente'],
})

addRoleModule({
  key: 'executive-members',
  title: 'Miembros',
  eyebrow: 'Ventas',
  description: 'CRM comercial con alta de miembro, membresia y pagos.',
  route: '/ejecutivo/members',
  icon: 'members',
  roles: executiveRoles,
  submodules: ['Lista', 'Nuevo miembro', 'Ficha comercial'],
  submoduleRoutes: routes('/ejecutivo/members', [
    ['Lista', '/ejecutivo/members'],
    ['Nuevo miembro', 'new'],
    ['Ficha comercial', 'detail'],
  ]),
  kpis: kpis([
    ['Activos', '421', 'visibles', 'good'],
    ['Nuevos', '34', 'mes', 'good'],
    ['Por vencer', '27', '7 dias', 'warning'],
    ['Morosos', '31', 'cobranza', 'danger'],
  ]),
  charts: ['Altas', 'Membresias', 'Cobranza', 'Conversion'],
  actions: ['Nuevo miembro', 'Renovar membresia', 'Registrar pago', 'Enviar mensaje'],
  modals: ['Nuevo miembro', 'Renovar membresia', 'Registrar pago'],
  tableHeaders: headers,
  tableRows: [
    row('Renato Silva', 'Lista', 'Activo', 'Pro vence 15/06', 'Ejecutivo', '/ejecutivo/members'),
    row('Nuevo socio', 'Nuevo miembro', 'Pendiente', 'Primer pago', 'Ejecutivo', '/ejecutivo/members/new'),
  ],
  highlights: ['Puede editar datos basicos', 'No desactiva miembros', 'Sin rutinas/progreso/notas'],
})

addRoleModule({
  key: 'executive-finance',
  title: 'Finanzas',
  eyebrow: 'Cobranza',
  description: 'Pagos e ingresos operativos para ventas y administracion.',
  route: '/ejecutivo/payments',
  icon: 'finance',
  roles: executiveRoles,
  submodules: ['Pagos', 'Ingresos'],
  submoduleRoutes: {
    Pagos: '/ejecutivo/payments',
    Ingresos: '/ejecutivo/income',
  },
  kpis: kpis([
    ['Pagado hoy', 'S/ 1,240', '18 pagos', 'good'],
    ['Pendiente', 'S/ 4,820', '31 pagos', 'warning'],
    ['Vencido', 'S/ 2,140', '12 pagos', 'danger'],
    ['Conversion', '28%', '+3 pts', 'good'],
  ]),
  charts: ['Ingresos diarios', 'Cobranza', 'Membresias', 'Pendientes'],
  actions: ['Registrar pago', 'Marcar pagado', 'Editar pago', 'Exportar'],
  modals: ['Registrar pago', 'Marcar pagado', 'Editar pago'],
  tableHeaders: headers,
  tableRows: [
    row('PAY-8821', 'Pagos', 'Pagado', 'S/ 149', 'Yape', '/ejecutivo/payments'),
    row('Ingresos junio', 'Ingresos', 'Activo', 'S/ 42,880', 'Ejecutivo', '/ejecutivo/income'),
  ],
  highlights: ['Sin reportes avanzados de asistencia', 'Puede registrar pago manual', 'Caja visible por permiso'],
})

addRoleModule({
  key: 'executive-reports',
  title: 'Reportes',
  eyebrow: 'Financieros',
  description: 'Reportes de ingresos, membresias y cobranza.',
  route: '/ejecutivo/reports',
  icon: 'reports',
  roles: executiveRoles,
  submodules: ['Ingresos', 'Membresias', 'Cobranza'],
  submoduleRoutes: routes('/ejecutivo/reports', [
    ['Ingresos', 'income'],
    ['Membresias', 'memberships'],
    ['Cobranza', 'collections'],
  ]),
  kpis: kpis([
    ['Ingresos', 'S/ 42,880', 'mes', 'good'],
    ['Membresias', '421', 'activas', 'good'],
    ['Cobranza', '31', 'pendientes', 'warning'],
    ['Exportaciones', '9', 'mes', 'neutral'],
  ]),
  charts: ['Ingresos', 'Membresias', 'Cobranza', 'Comparativo'],
  actions: ['Filtrar', 'Exportar CSV', 'Exportar PDF', 'Comparar'],
  modals: ['Filtrar reporte', 'Exportar reporte'],
  tableHeaders: headers,
  tableRows: [
    row('Ingresos mensual', 'Ingresos', 'Activo', 'PDF/XLSX', 'Ejecutivo', '/ejecutivo/reports/income'),
    row('Cobranza', 'Cobranza', 'Atencion', '31 pendientes', 'Ejecutivo', '/ejecutivo/reports/collections'),
  ],
  highlights: ['Solo financiero', 'Sin rutinas', 'Exportable'],
})

;[
  ['member-dashboard', 'Mi Dashboard', '/member/dashboard', 'dashboard', 'Resumen personal, membresia, proxima rutina, ultima asistencia y encuesta pendiente.'],
  ['member-profile', 'Mi Perfil', '/member/profile', 'profile', 'Datos personales, membresia, renovacion y preferencias de notificacion.'],
  ['member-progress', 'Mi Progreso', '/member/progress', 'tracking', 'Graficos de peso, medidas, fotos comparativas y mediciones.'],
  ['member-routines', 'Mis Rutinas', '/member/routines', 'training', 'Rutina actual, detalle de ejercicios, historial e iniciar entrenamiento.'],
  ['member-nutrition', 'Mi Nutricion', '/member/nutrition', 'nutrition', 'Plan nutricional asignado, comidas del dia y progreso nutricional.'],
  ['member-attendance', 'Mis Asistencias', '/member/attendance', 'attendance', 'Calendario, racha, estadisticas y check-in autonomo si esta habilitado.'],
  ['member-surveys', 'Encuestas', '/member/surveys', 'surveys', 'Encuesta post-entrenamiento pendiente e historial de respuestas.'],
].forEach(([key, title, route, icon, description]) => {
  addRoleModule({
    key,
    title,
    eyebrow: 'Miembro',
    description,
    route,
    icon,
    roles: memberRoles,
    submodules: ['Vista principal'],
    submoduleRoutes: routes(route, [['Vista principal', route]]),
    kpis: kpis([
      ['Membresia', '18 dias', 'restantes', 'good'],
      ['Racha', '6 dias', '+2', 'good'],
      ['Peso actual', '78.4 kg', '-2.1 kg', 'good'],
      ['Encuesta', '1', 'pendiente', 'warning'],
    ]),
    charts: ['Peso 30 dias', 'Asistencia', 'Rutina', 'Progreso'],
    actions: ['Ver detalle', 'Registrar avance', 'Iniciar entrenamiento', 'Contactar gimnasio'],
    modals: ['Ver detalle', 'Registrar avance', 'Encuesta'],
    tableHeaders: headers,
    tableRows: [
      row('Rutina fuerza', title, 'Activo', 'Hoy 7:00 pm', 'Entrenador', route),
      row('Peso', title, 'Progreso', '78.4 kg', 'Miembro', route),
    ],
    highlights: ['Experiencia mobile-first', 'Solo ve su informacion', 'Notificaciones futuras por WhatsApp/email'],
  })
})

;[
  ['trainer-dashboard', 'Dashboard', '/trainer/dashboard', 'dashboard', 'Miembros asignados, rutinas activas, alertas y progreso destacado.'],
  ['trainer-members', 'Mis miembros', '/trainer/members', 'members', 'Lista de miembros asignados, ficha tecnica, notas y alertas al admin.'],
  ['trainer-routines', 'Rutinas', '/trainer/routines', 'training', 'Rutinas creadas, asignadas, plantillas y ejecucion del miembro.'],
  ['trainer-progress', 'Progreso', '/trainer/progress', 'tracking', 'Registro de peso, medidas, fotos y observaciones tecnicas.'],
  ['trainer-profile', 'Perfil', '/trainer/profile', 'profile', 'Datos del entrenador, permisos visibles y preferencias personales.'],
].forEach(([key, title, route, icon, description]) => {
  addRoleModule({
    key,
    title,
    eyebrow: 'Entrenador',
    description,
    route,
    icon,
    roles: trainerRoles,
    submodules: ['Vista principal'],
    submoduleRoutes: routes(route, [['Vista principal', route]]),
    kpis: kpis([
      ['Asignados', '38', 'miembros', 'good'],
      ['Rutinas activas', '24', '+4', 'good'],
      ['En riesgo', '7', 'contactar', 'warning'],
      ['Progreso nuevo', '14', 'registros', 'neutral'],
    ]),
    charts: ['Asistencia miembros', 'Rutinas', 'Progreso', 'Alertas'],
    actions: ['Ver ficha', 'Asignar rutina', 'Registrar progreso', 'Reportar alerta'],
    modals: ['Ver ficha', 'Asignar rutina', 'Registrar progreso', 'Reportar alerta'],
    tableHeaders: headers,
    tableRows: [
      row('Renato Silva', title, 'Activo', 'Rutina fuerza', 'Entrenador', route),
      row('Maria Lopez', title, 'Atencion', 'Encuesta baja', 'Entrenador', route),
    ],
    highlights: ['Sin finanzas', 'Solo miembros asignados', 'Alertas escalan al Admin'],
  })
})

const roleOrder: Partial<Record<Role, string[]>> = {
  superadmin: ['platform-dashboard', 'platform-gyms', 'platform-plans', 'platform-billing', 'platform-verifications', 'platform-marketplace', 'platform-strategies', 'platform-audit', 'platform-settings'],
  owner: ['gym-dashboard', 'members', 'gym-finance', 'training', 'tracking', 'nutrition', 'store', 'reports', 'gym-settings'],
  supervisor: ['supervisor-dashboard', 'supervisor-members', 'supervisor-training', 'supervisor-tracking', 'supervisor-reports', 'store'],
  executive: ['executive-dashboard', 'executive-members', 'executive-finance', 'executive-reports', 'store'],
  trainer: ['trainer-dashboard', 'trainer-members', 'trainer-routines', 'trainer-progress', 'trainer-profile'],
  member: ['member-dashboard', 'member-profile', 'member-progress', 'member-routines', 'member-nutrition', 'member-attendance', 'member-surveys'],
}

export const getModulesForRole = (role: Role) => {
  const available = modules.filter((item) => item.roles.includes(role))
  const order = roleOrder[role] || []
  return available.sort((a, b) => {
    const aIndex = order.indexOf(a.key)
    const bIndex = order.indexOf(b.key)
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
  })
}

export const getDefaultModuleForRole = (role: Role): ModuleDefinition => {
  return getModulesForRole(role)[0] || modules[0]
}

export const getSubmodulesForRole = (module: ModuleDefinition, role?: Role) => {
  if (!role) {
    return module.submodules
  }

  return module.roleSubmodules?.[role] || module.submodules
}

export const getModulePath = (module: ModuleDefinition, submodule?: string) => {
  if (!submodule) {
    return module.route
  }

  return module.submoduleRoutes[submodule] || module.route
}

export const getModuleSlug = (module: ModuleDefinition) => module.route.replace(/^\//, '')

export const getSubmoduleSlug = (submodule: string) => slugify(submodule)

const normalizePath = (path?: string) => (path || '').split('?')[0].replace(/^\/+|\/+$/g, '')

export const getModuleByPath = (pathSegment?: string) => {
  const path = normalizePath(pathSegment)
  if (!path) {
    return modules[0]
  }

  const exact = modules.find((item) => {
    const modulePath = normalizePath(item.route)
    const submodulePaths = Object.values(item.submoduleRoutes).map(normalizePath)
    return item.key === path || modulePath === path || submodulePaths.includes(path)
  })

  if (exact) {
    return exact
  }

  return modules.find((item) => {
    const modulePath = normalizePath(item.route)
    return path.startsWith(`${modulePath}/`)
  })
}

export const getSubmoduleByPath = (module: ModuleDefinition, pathSegment?: string, role?: Role) => {
  const submodules = getSubmodulesForRole(module, role)
  const path = normalizePath(pathSegment)

  if (!path) {
    return submodules[0] || module.submodules[0]
  }

  return submodules.find((item) => {
    const route = normalizePath(module.submoduleRoutes[item])
    return route === path || path.startsWith(`${route}/`) || getSubmoduleSlug(item) === path
  }) || submodules[0] || module.submodules[0]
}

export const landingPlans = [
  {
    name: 'Free',
    price: 'S/ 0',
    limit: 'Hasta 40 miembros',
    trainers: '1 entrenador',
    features: ['Miembros base', 'Pagos manuales', 'Asistencia simple'],
  },
  {
    name: 'Starter',
    price: 'S/ 79',
    limit: 'Hasta 200 miembros',
    trainers: '3 entrenadores',
    features: ['Rutinas', 'Vencimientos', 'Recordatorios WhatsApp'],
  },
  {
    name: 'Pro',
    price: 'S/ 149',
    limit: 'Hasta 500 miembros',
    trainers: '10 entrenadores',
    recommended: true,
    features: ['Riesgo de abandono', 'Reportes avanzados', 'Estrategias'],
  },
  {
    name: 'Enterprise',
    price: 'A medida',
    limit: 'Miembros ilimitados',
    trainers: 'Equipo completo',
    features: ['Sedes multiples', 'Limites personalizados', 'Soporte prioritario'],
  },
]
