import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
import {
  FinanceSurface,
  MembersSurface,
  OwnerDashboardSurface,
  SettingsSurface,
  TrackingNutritionSurface,
  TrainingSurface,
} from '../components/AdminSurfaces'
import MarketplaceSurface from '../components/MarketplaceSurface'
import KpiCard from '../components/KpiCard'
import { getSession } from '../lib/auth'
import { products as marketplaceProducts, whatsappProductUrl } from '../lib/marketplace'
import type { Role } from '../lib/mockData'
import {
  getDefaultModuleForRole,
  getModuleByPath,
  getModulePath,
  getModuleSlug,
  getModulesForRole,
  getSubmoduleByPath,
  getSubmodulesForRole,
  ModuleDefinition,
  roleLabels,
} from '../lib/pulseData'

const filters = ['Hoy', '7 dias', '30 dias', 'Este mes']

const routeContext = (path: string) => {
  const cleanPath = path.split('?')[0].replace(/^\/+|\/+$/g, '')
  return {
    modulePath: cleanPath || 'dashboard',
    submodulePath: cleanPath || 'dashboard',
  }
}

function StatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase()
  const tone = normalized.includes('vencido') || normalized.includes('riesgo') || normalized.includes('critico')
    ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300'
    : normalized.includes('trial') || normalized.includes('pendiente') || normalized.includes('atencion')
      ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200'
      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{value}</span>
}

function Modal({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/45 p-4 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-[20px] border border-white/40 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-neutral-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">Accion</div>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h3>
          </div>
          <button onClick={onClose} className="rounded-full border border-black/10 px-3 py-1 text-sm dark:border-white/10">
            Cerrar
          </button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {['Nombre', 'Responsable', 'Estado', 'Observaciones'].map((field) => (
            <label key={field} className="text-sm font-medium">
              {field}
              <input className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5" placeholder={field} />
            </label>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={onClose} className="gold-button">Guardar</button>
          <button onClick={onClose} className="neutral-button">Cancelar</button>
        </div>
      </div>
    </div>
  )
}

function MiniChart({ title, values = [42, 66, 54, 78, 61, 86, 74] }: { title: string; values?: number[] }) {
  return (
    <div className="premium-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Periodo actual vs anterior</div>
        </div>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600 dark:bg-white/10 dark:text-neutral-300">Live</span>
      </div>
      <div className="mt-5 flex h-32 items-end gap-2">
        {values.map((height, index) => (
          <div
            key={`${title}-${index}`}
            className="flex-1 rounded-t-xl bg-neutral-950 transition hover:bg-accent dark:bg-white dark:hover:bg-accent"
            style={{ height: `${height}%`, opacity: 0.36 + index * 0.08 }}
          />
        ))}
      </div>
    </div>
  )
}

function PriorityList({ items, onOpenModal }: { items: ModuleDefinition['tableRows']; onOpenModal: (title: string) => void }) {
  return (
    <div className="premium-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">Que atender hoy</div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">Maximo 5 prioridades accionables.</div>
        </div>
        <button onClick={() => onOpenModal('Configurar prioridades')} className="neutral-button py-2">Reglas</button>
      </div>
      <div className="mt-5 space-y-3">
        {items.slice(0, 5).map((item) => (
          <button key={`${item.primary}-${item.due}`} onClick={() => onOpenModal(item.primary)} className="flex w-full items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white p-4 text-left transition hover:border-accent hover:bg-accent/5 dark:border-white/10 dark:bg-white/5">
            <div>
              <div className="text-sm font-semibold">{item.primary}</div>
              <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{item.metric} · {item.owner}</div>
            </div>
            <StatusBadge value={item.status} />
          </button>
        ))}
      </div>
    </div>
  )
}

const verificationQueue = [
  {
    id: 'ver_pg_1041',
    date: 'Hoy 09:18',
    gym: 'Iron Club',
    owner: 'Mateo Vargas',
    email: 'mateo@ironclub.test',
    plan: 'Pro',
    amount: 'S/ 149',
    method: 'Yape',
    status: 'Pendiente',
    reference: 'PG-291041',
    screenshot: 'captura-yape-iron-club.png',
  },
  {
    id: 'ver_pg_1042',
    date: 'Hoy 08:44',
    gym: 'Fit Norte',
    owner: 'Lucia Salas',
    email: 'lucia@fitnorte.test',
    plan: 'Starter',
    amount: 'S/ 79',
    method: 'Plin',
    status: 'Aprobada',
    reference: 'PG-291042',
    screenshot: 'captura-plin-fit-norte.png',
  },
  {
    id: 'ver_pg_1043',
    date: 'Ayer 18:10',
    gym: 'Box 360',
    owner: 'Carlos Rivas',
    email: 'carlos@box360.test',
    plan: 'Enterprise',
    amount: 'A medida',
    method: 'WhatsApp',
    status: 'WhatsApp',
    reference: 'PG-291043',
    screenshot: 'pendiente-whatsapp',
  },
]

function PlatformDashboard({ module, onOpenModal }: { module: ModuleDefinition; onOpenModal: (title: string) => void }) {
  return (
    <div className="space-y-6">
      <section className="premium-card overflow-hidden">
        <div className="grid gap-6 p-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-accent">{module.eyebrow}</div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Dashboard Global</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600 dark:text-neutral-300">{module.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button key={filter} className={`rounded-full px-4 py-2 text-xs font-semibold ${filter === 'Este mes' ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950' : 'bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-neutral-300'}`}>
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-[20px] bg-neutral-950 p-5 text-white">
            <div className="text-xs uppercase tracking-[0.18em] text-accent">Decision recomendada</div>
            <div className="mt-3 text-2xl font-semibold">Cobrar vencidos y revisar riesgo</div>
            <p className="mt-3 text-sm leading-6 text-neutral-300">Hay S/ 1,140 vencidos y 318 clientes finales en riesgo agregados. Prioridad: facturacion y gimnasios con health bajo.</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {['Crear gimnasio', 'Registrar pago', 'Ver morosos', 'Exportar'].map((action) => (
                <button key={action} onClick={() => onOpenModal(action)} className="rounded-2xl bg-white/10 px-3 py-3 text-xs font-semibold transition hover:bg-accent hover:text-black">
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {module.kpis.map((kpi) => (
          <KpiCard key={kpi.label} title={kpi.label} value={kpi.value} trend={kpi.trend} tone={kpi.tone} />
        ))}
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 lg:grid-cols-2">
          {module.charts.slice(0, 4).map((chart, index) => (
            <MiniChart key={chart} title={chart} values={[38 + index * 5, 54, 48 + index * 3, 72, 63, 88 - index * 2, 76]} />
          ))}
        </div>
        <PriorityList items={module.tableRows} onOpenModal={onOpenModal} />
      </section>
    </div>
  )
}

function GymDashboard({ module, role, onOpenModal }: { module: ModuleDefinition; role: Role; onOpenModal: (title: string) => void }) {
  const persona = roleLabels[role]
  const hiddenFinance = role === 'supervisor' || role === 'trainer' || role === 'member'
  return (
    <div className="space-y-6">
      <section className="premium-card overflow-hidden">
        <div className="grid gap-6 p-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Panel {persona}</div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Pulse Gym Lima</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600 dark:text-neutral-300">
              Panel del gimnasio con permisos por rol. Solo ves las acciones que corresponden a tu operacion.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button key={filter} className={`rounded-full px-4 py-2 text-xs font-semibold ${filter === 'Hoy' ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950' : 'bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-neutral-300'}`}>
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-[20px] bg-neutral-950 p-5 text-white">
            <div className="text-xs uppercase tracking-[0.18em] text-accent">Atencion del dia</div>
            <div className="mt-3 text-2xl font-semibold">{hiddenFinance ? 'Rutinas y asistencia' : 'Caja y miembros'}</div>
            <p className="mt-3 text-sm leading-6 text-neutral-300">
              {hiddenFinance ? 'Prioridad: asignar rutinas pendientes y contactar ausentes.' : 'Prioridad: cobrar pendientes, registrar nuevos miembros y revisar asistencia.'}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {module.actions.slice(0, 4).map((action) => (
                <button key={action} onClick={() => onOpenModal(action)} className="rounded-2xl bg-white/10 px-3 py-3 text-xs font-semibold transition hover:bg-accent hover:text-black">
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {module.kpis.map((kpi) => (
          <KpiCard key={kpi.label} title={kpi.label} value={kpi.value} trend={kpi.trend} tone={kpi.tone} />
        ))}
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 lg:grid-cols-2">
          {module.charts.map((chart, index) => (
            <MiniChart key={chart} title={chart} values={[44, 62 + index * 3, 58, 74, 66, 82, 79]} />
          ))}
        </div>
        <PriorityList items={module.tableRows} onOpenModal={onOpenModal} />
      </section>
    </div>
  )
}

function VerificationWorkspace({
  module,
  selectedSubmodule,
  onOpenModal,
}: {
  module: ModuleDefinition
  selectedSubmodule: string
  onOpenModal: (title: string) => void
}) {
  const [decisions, setDecisions] = useState<Record<string, string>>({})
  const statusBySubmodule: Record<string, string> = {
    Pendientes: 'Pendiente',
    Aprobadas: 'Aprobada',
    Rechazadas: 'Rechazada',
    WhatsApp: 'WhatsApp',
  }
  const selectedStatus = statusBySubmodule[selectedSubmodule]
  const rows = verificationQueue
    .map((row) => ({ ...row, status: decisions[row.id] || row.status }))
    .filter((row) => !selectedStatus || row.status === selectedStatus || (selectedSubmodule === 'Rechazadas' && row.status === 'Rechazada'))

  const pendingCount = verificationQueue.filter((row) => (decisions[row.id] || row.status) === 'Pendiente').length
  const approvedCount = verificationQueue.filter((row) => (decisions[row.id] || row.status) === 'Aprobada').length
  const rejectedCount = Object.values(decisions).filter((status) => status === 'Rechazada').length

  const mark = (id: string, status: string, title: string) => {
    setDecisions((current) => ({ ...current, [id]: status }))
    onOpenModal(title)
  }

  return (
    <div className="space-y-6">
      <section className="premium-card p-6">
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-accent">{module.eyebrow}</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">Verificaciones de pago</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600 dark:text-neutral-300">{module.description}</p>
            <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
              {getSubmodulesForRole(module).map((submodule) => (
                <a
                  key={submodule}
                  href={getModulePath(module, submodule)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${selectedSubmodule === submodule ? 'bg-accent text-black' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-white/10 dark:text-neutral-300'}`}
                >
                  {submodule}
                </a>
              ))}
            </div>
          </div>
          <div className="rounded-[22px] bg-neutral-950 p-5 text-white">
            <div className="text-xs uppercase tracking-[0.18em] text-accent">Decision rapida</div>
            <div className="mt-3 text-2xl font-semibold">Aprobar solo con captura valida</div>
            <p className="mt-3 text-sm leading-6 text-neutral-300">Al aprobar se crea gimnasio, owner y suscripcion. Al rechazar se solicita nueva captura y se guarda auditoria.</p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                ['Pendientes', pendingCount],
                ['Aprobadas', approvedCount],
                ['Rechazos', rejectedCount],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-white/10 p-3">
                  <div className="text-xl font-semibold">{value}</div>
                  <div className="text-xs text-neutral-300">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {module.kpis.map((kpi) => (
          <KpiCard key={kpi.label} title={kpi.label} value={kpi.value} trend={kpi.trend} tone={kpi.tone} />
        ))}
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="space-y-4">
          <MiniChart title="Verificaciones por dia" values={[28, 42, 34, 58, 49, 72, 66]} />
          <div className="premium-card p-5">
            <div className="text-lg font-semibold">Flujo protegido</div>
            <div className="mt-4 space-y-3">
              {module.highlights.map((item) => (
                <div key={item} className="rounded-2xl bg-neutral-100 p-4 text-sm text-neutral-700 dark:bg-white/10 dark:text-neutral-300">{item}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="premium-card overflow-hidden">
          <div className="flex flex-col justify-between gap-3 border-b border-black/5 p-5 dark:border-white/10 md:flex-row md:items-center">
            <div>
              <div className="text-lg font-semibold">Cola de {selectedSubmodule}</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">Fecha, gimnasio, owner, plan, metodo, captura y decision.</div>
            </div>
            <button onClick={() => onOpenModal('Exportar verificaciones')} className="neutral-button py-2">Exportar</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-neutral-100 text-xs uppercase tracking-[0.12em] text-neutral-500 dark:bg-white/5 dark:text-neutral-400">
                <tr>
                  {['Fecha', 'Gimnasio', 'Dueno', 'Plan', 'Pago', 'Captura', 'Estado', 'Acciones'].map((header) => (
                    <th key={header} className="px-5 py-4 font-semibold">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/10">
                {rows.map((row) => (
                  <tr key={row.id} className="bg-white/70 transition hover:bg-accent/5 dark:bg-transparent">
                    <td className="px-5 py-4 text-neutral-600 dark:text-neutral-300">{row.date}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-neutral-950 dark:text-white">{row.gym}</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">{row.reference}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold">{row.owner}</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">{row.email}</div>
                    </td>
                    <td className="px-5 py-4">{row.plan}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold">{row.amount}</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">{row.method}</div>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => onOpenModal(`Captura ${row.gym}`)} className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold dark:border-white/10">{row.screenshot}</button>
                    </td>
                    <td className="px-5 py-4"><StatusBadge value={row.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => mark(row.id, 'Aprobada', `Aprobar ${row.gym}`)} className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">Aprobar</button>
                        <button onClick={() => mark(row.id, 'Rechazada', `Rechazar ${row.gym}`)} className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">Rechazar</button>
                        <a href={`https://wa.me/51987088359?text=Verificacion%20${encodeURIComponent(row.reference)}`} target="_blank" rel="noreferrer" className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold dark:border-white/10">WhatsApp</a>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">No hay solicitudes en esta vista.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}

function PageExperience({ module, selectedSubmodule, onOpenModal }: { module: ModuleDefinition; selectedSubmodule: string; onOpenModal: (title: string) => void }) {
  const lower = `${module.title} ${selectedSubmodule}`.toLowerCase()

  if (lower.includes('ficha') || lower.includes('detalle')) {
    const tabs = lower.includes('gimnasio')
      ? ['Informacion', 'Suscripcion', 'Metricas', 'Auditoria']
      : lower.includes('comercial')
        ? ['Perfil', 'Membresia', 'Pagos']
        : ['Perfil', 'Pagos', 'Asistencia', 'Rutinas', 'Progreso', 'Notas']
    return (
      <div className="premium-card p-5">
        <div className="text-lg font-semibold">Ficha 360</div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => onOpenModal(`${tab} - ${selectedSubmodule}`)} className="rounded-2xl bg-neutral-100 p-4 text-left text-sm font-semibold text-neutral-700 transition hover:bg-accent/20 dark:bg-white/10 dark:text-neutral-200">
              {tab}
              <span className="mt-1 block text-xs font-normal text-neutral-500 dark:text-neutral-400">Vista modular con datos y acciones propias.</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (lower.includes('nuevo') || lower.includes('crear') || lower.includes('editar')) {
    const fields = lower.includes('plan')
      ? ['Nombre', 'Precio mensual', 'Moneda', 'Limites JSON', 'Features', 'Estado']
      : lower.includes('gimnasio')
        ? ['Nombre gimnasio', 'Slug', 'Owner email', 'Telefono', 'Plan inicial', 'Trial']
        : ['Nombre', 'Email', 'Telefono', 'Membresia inicial', 'Fecha inicio', 'Precio']
    return (
      <div className="premium-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Formulario guiado</div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">Campos principales de esta pagina.</div>
          </div>
          <button onClick={() => onOpenModal(`Guardar ${selectedSubmodule}`)} className="gold-button py-2">Guardar</button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field} className="rounded-2xl border border-black/5 bg-white p-3 text-sm text-neutral-600 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">{field}</div>
              <div className="mt-2 h-2 rounded-full bg-neutral-100 dark:bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (lower.includes('rutina') || lower.includes('ejercicio')) {
    return (
      <div className="premium-card p-5">
        <div className="text-lg font-semibold">{lower.includes('rutina') ? 'Constructor de rutinas' : 'Biblioteca de ejercicios'}</div>
        <div className="mt-4 space-y-3">
          {['Bloque A', 'Bloque B', 'Finisher'].map((block, index) => (
            <div key={block} className="rounded-2xl bg-neutral-100 p-4 dark:bg-white/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{block}</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">{index + 3} ejercicios · series/reps/descanso</div>
                </div>
                <button onClick={() => onOpenModal(block)} className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold dark:border-white/10">Editar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (lower.includes('asistencia') || lower.includes('attendance')) {
    return (
      <div className="premium-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Registro de asistencia</div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">Check-in manual, historial y ocupacion.</div>
          </div>
          <button onClick={() => onOpenModal('Check-in manual')} className="gold-button py-2">Check-in</button>
        </div>
        <div className="mt-5 grid grid-cols-7 gap-2">
          {Array.from({ length: 21 }).map((_, index) => (
            <div key={index} className={`aspect-square rounded-xl ${index % 5 === 0 ? 'bg-red-100 dark:bg-red-500/20' : 'bg-emerald-100 dark:bg-emerald-500/20'}`} />
          ))}
        </div>
      </div>
    )
  }

  if (lower.includes('progreso') || lower.includes('progress')) {
    return (
      <div className="premium-card p-5">
        <div className="text-lg font-semibold">Progreso y mediciones</div>
        <div className="mt-5 flex h-32 items-end gap-2">
          {[78, 76, 75, 73, 72, 71, 70].map((value, index) => (
            <div key={index} className="flex-1 rounded-t-xl bg-neutral-950 transition hover:bg-accent dark:bg-white" style={{ height: `${value}%` }} />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          {['Peso', 'Cintura', 'Fotos'].map((item) => (
            <button key={item} onClick={() => onOpenModal(item)} className="rounded-2xl bg-neutral-100 p-3 font-semibold dark:bg-white/10">{item}</button>
          ))}
        </div>
      </div>
    )
  }

  if (lower.includes('pago') || lower.includes('factura') || lower.includes('ingreso') || lower.includes('caja')) {
    return (
      <div className="premium-card p-5">
        <div className="text-lg font-semibold">Flujo de cobranza</div>
        <div className="mt-4 space-y-3">
          {['Pendiente', 'Comprobante', 'Pagado', 'Auditado'].map((step, index) => (
            <div key={step} className="flex items-center gap-3 rounded-2xl bg-neutral-100 p-4 dark:bg-white/10">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${index < 2 ? 'bg-accent text-black' : 'bg-white text-neutral-500 dark:bg-white/10 dark:text-neutral-300'}`}>{index + 1}</div>
              <div>
                <div className="text-sm font-semibold">{step}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">Estado visible en tabla y reportes.</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (lower.includes('encuesta') || lower.includes('survey')) {
    return (
      <div className="premium-card p-5">
        <div className="text-lg font-semibold">Encuestas post-entrenamiento</div>
        <div className="mt-4 grid gap-3">
          {['Energia', 'Dificultad', 'Satisfaccion'].map((label, index) => (
            <div key={label} className="rounded-2xl bg-neutral-100 p-4 dark:bg-white/10">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>{label}</span>
                <span>{4 + (index % 2)}/5</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white dark:bg-white/10">
                <div className="h-full rounded-full bg-accent" style={{ width: `${78 - index * 8}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (lower.includes('tienda') || lower.includes('marketplace') || lower.includes('producto') || lower.includes('codigo')) {
    return (
      <div className="premium-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Productos con descuento</div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">Catalogo no invasivo con solicitud por WhatsApp.</div>
          </div>
          <a href="/productos" target="_blank" rel="noreferrer" className="neutral-button py-2">Publico</a>
        </div>
        <div className="mt-4 grid gap-3">
          {marketplaceProducts.map((product) => (
            <a key={product.id} href={whatsappProductUrl(product)} target="_blank" rel="noreferrer" className="rounded-2xl border border-black/5 bg-white p-4 transition hover:-translate-y-0.5 hover:border-accent dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{product.name}</div>
                  <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{product.discountCode}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-neutral-400 line-through">S/ {product.basePrice}</div>
                  <div className="text-lg font-semibold text-accent">S/ {product.discountPrice}</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="premium-card p-5">
      <div className="text-lg font-semibold">Reglas y restricciones</div>
      <div className="mt-4 space-y-3">
        {module.highlights.map((item) => (
          <div key={item} className="rounded-2xl bg-neutral-100 p-4 text-sm text-neutral-700 dark:bg-white/10 dark:text-neutral-300">{item}</div>
        ))}
      </div>
    </div>
  )
}

function ModuleWorkspace({
  module,
  selectedSubmodule,
  role,
  onOpenModal,
}: {
  module: ModuleDefinition
  selectedSubmodule: string
  role: Role
  onOpenModal: (title: string) => void
}) {
  const submodules = getSubmodulesForRole(module, role)
  const contextualRows = module.tableRows.filter((item) => item.secondary === selectedSubmodule)
  const rows = contextualRows.length > 0 ? contextualRows : module.tableRows

  return (
    <div className="space-y-6">
      <section className="premium-card p-6">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-accent">{module.eyebrow}</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">{selectedSubmodule}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600 dark:text-neutral-300">{module.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onOpenModal(module.actions[0])} className="gold-button py-2">{module.actions[0]}</button>
            <button onClick={() => onOpenModal('Exportar')} className="neutral-button py-2">Exportar</button>
          </div>
        </div>
        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {submodules.map((submodule) => (
            <a
              key={submodule}
              href={getModulePath(module, submodule)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${selectedSubmodule === submodule ? 'bg-accent text-black' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/15'}`}
            >
              {submodule}
            </a>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {module.kpis.map((kpi) => (
          <KpiCard key={kpi.label} title={kpi.label} value={kpi.value} trend={kpi.trend} tone={kpi.tone} />
        ))}
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <PageExperience module={module} selectedSubmodule={selectedSubmodule} onOpenModal={onOpenModal} />
          <MiniChart title={module.charts[0] || selectedSubmodule} />
        </div>

        <div className="premium-card overflow-hidden">
          <div className="flex flex-col justify-between gap-3 border-b border-black/5 p-5 dark:border-white/10 md:flex-row md:items-center">
            <div>
              <div className="text-lg font-semibold">Datos de {selectedSubmodule}</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">Tabla operativa filtrada por la vista actual.</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button key={filter} className="rounded-full bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-600 dark:bg-white/10 dark:text-neutral-300">{filter}</button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-neutral-100 text-xs uppercase tracking-[0.12em] text-neutral-500 dark:bg-white/5 dark:text-neutral-400">
                <tr>
                  {module.tableHeaders.map((header) => (
                    <th key={header} className="px-5 py-4 font-semibold">{header}</th>
                  ))}
                  <th className="px-5 py-4 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/10">
                {rows.map((row) => (
                  <tr key={`${row.primary}-${row.due}`} className="bg-white/70 transition hover:bg-accent/5 dark:bg-transparent">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-neutral-950 dark:text-white">{row.primary}</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">{row.secondary}</div>
                    </td>
                    <td className="px-5 py-4">{row.secondary}</td>
                    <td className="px-5 py-4"><StatusBadge value={row.status} /></td>
                    <td className="px-5 py-4 text-neutral-600 dark:text-neutral-300">{row.metric}</td>
                    <td className="px-5 py-4 text-neutral-600 dark:text-neutral-300">{row.owner}</td>
                    <td className="px-5 py-4 text-neutral-600 dark:text-neutral-300">{row.due}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => onOpenModal(`Detalle ${row.primary}`)} className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold dark:border-white/10">Abrir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [selectedSubmodule, setSelectedSubmodule] = useState('')
  const [modal, setModal] = useState<string | null>(null)

  useEffect(() => {
    const session = getSession()
    if (!session) {
      router.replace('/login')
      return
    }
    setUser(session)
  }, [router])

  const availableModules = useMemo(() => {
    if (!user) return []
    return getModulesForRole(user.role as Role)
  }, [user])

  const activeModule = useMemo(() => {
    if (!user) return null
    const context = routeContext(router.asPath)
    const moduleFromPath = getModuleByPath(context.modulePath)
    return availableModules.find((module) => module.key === moduleFromPath?.key || module.key === context.modulePath || getModuleSlug(module) === context.modulePath) || getDefaultModuleForRole(user.role as Role)
  }, [availableModules, router.asPath, user])

  useEffect(() => {
    if (!activeModule || !user) {
      return
    }

    const context = routeContext(router.asPath)
    setSelectedSubmodule(getSubmoduleByPath(activeModule, context.submodulePath, user.role as Role))
  }, [activeModule, router.asPath, user])

  if (!user || !activeModule) {
    return null
  }

  const role = user.role as Role
  const requestedContext = routeContext(router.asPath)
  const requestedModule = getModuleByPath(requestedContext.modulePath)
  const forbidden = requestedModule && !availableModules.some((module) => module.key === requestedModule.key)

  if (forbidden) {
    return (
      <section className="premium-card p-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">403</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Acceso restringido</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-300">
          Tu rol no tiene permisos para abrir este modulo. Contacta al administrador de la plataforma si necesitas acceso.
        </p>
        <button onClick={() => router.push(getModulePath(getDefaultModuleForRole(role), getDefaultModuleForRole(role).submodules[0]))} className="mt-6 gold-button">
          Volver a mi panel
        </button>
      </section>
    )
  }

  return (
    <>
      {activeModule.key === 'platform-dashboard' ? (
        <PlatformDashboard module={activeModule} onOpenModal={setModal} />
      ) : activeModule.key === 'gym-dashboard' && role === 'owner' ? (
        <OwnerDashboardSurface />
      ) : activeModule.key === 'platform-verifications' ? (
        <VerificationWorkspace module={activeModule} selectedSubmodule={selectedSubmodule} onOpenModal={setModal} />
      ) : activeModule.key === 'platform-marketplace' ? (
        <MarketplaceSurface />
      ) : activeModule.key === 'members' || activeModule.key === 'supervisor-members' || activeModule.key === 'executive-members' ? (
        <MembersSurface selectedSubmodule={selectedSubmodule} role={role} />
      ) : activeModule.key === 'gym-finance' || activeModule.key === 'executive-finance' ? (
        <FinanceSurface selectedSubmodule={selectedSubmodule} role={role} />
      ) : activeModule.key === 'training' || activeModule.key === 'supervisor-training' ? (
        <TrainingSurface selectedSubmodule={selectedSubmodule} role={role} />
      ) : activeModule.key === 'tracking' || activeModule.key === 'supervisor-tracking' || activeModule.key === 'nutrition' ? (
        <TrackingNutritionSurface selectedSubmodule={selectedSubmodule} moduleKey={activeModule.key} role={role} />
      ) : activeModule.key === 'gym-settings' ? (
        <SettingsSurface selectedSubmodule={selectedSubmodule} />
      ) : activeModule.key === 'platform-settings' ? (
        <SettingsSurface selectedSubmodule={selectedSubmodule} platform />
      ) : activeModule.key === 'gym-dashboard' || activeModule.key === 'supervisor-dashboard' || activeModule.key === 'executive-dashboard' || activeModule.key === 'member-dashboard' ? (
        <GymDashboard module={activeModule} role={role} onOpenModal={setModal} />
      ) : (
        <ModuleWorkspace module={activeModule} selectedSubmodule={selectedSubmodule} role={role} onOpenModal={setModal} />
      )}
      {modal && <Modal title={modal} onClose={() => setModal(null)} />}
    </>
  )
}
