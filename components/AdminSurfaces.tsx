import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
import {
  dashboardData,
  exercises,
  gateways,
  gymPaymentMethods,
  gymPlans,
  integrationRequests,
  members,
  nutritionPlans,
  payments,
  platformPaymentMethods,
  progressSummary,
  routines,
  surveys,
} from '../lib/gymData'
import type { ModuleDefinition } from '../lib/pulseData'

type ModalState = { title: string; kind?: string; payload?: any } | null

const formatMoney = (value: number) => `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'good' | 'warning' | 'danger' | 'neutral' | 'blue' }) {
  const classes = {
    good: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200',
    danger: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300',
    neutral: 'bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-neutral-300',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
  }
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes[tone]}`}>{children}</span>
}

function Avatar({ value, size = 'h-10 w-10' }: { value: string; size?: string }) {
  const initials = value.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  return <div className={`${size} flex shrink-0 items-center justify-center rounded-full bg-neutral-950 text-xs font-semibold text-white shadow-sm dark:bg-white dark:text-neutral-950`}>{initials}</div>
}

function AppleCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-black/5 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-[#1c1c1e] ${className}`}>{children}</div>
}

function Sheet({ modal, onClose }: { modal: ModalState; onClose: () => void }) {
  if (!modal) return null

  const memberFields = ['Nombre completo', 'Email', 'Telefono', 'Fecha nacimiento', 'Direccion']
  const membershipFields = ['Plan', 'Fecha inicio', 'Fecha fin', 'Precio', 'Descuento', 'Metodo de pago']
  const genericFields = modal.kind === 'payment'
    ? ['Miembro', 'Monto', 'Metodo de pago', 'Fecha del pago', 'Notas', 'Comprobante']
    : modal.kind === 'exercise'
      ? ['Nombre', 'Descripcion', 'Grupo muscular', 'Musculos secundarios', 'Nivel', 'Video URL', 'Imagen']
      : modal.kind === 'gateway'
        ? ['Nombre pasarela', 'Logo', 'Descripcion', 'Required fields JSON', 'Activa']
        : [...memberFields, ...membershipFields]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/45 p-4 backdrop-blur-md">
      <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[20px] border border-white/40 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-[#1c1c1e]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Sheet</div>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">{modal.title}</h3>
          </div>
          <button onClick={onClose} className="rounded-full border border-black/10 px-3 py-1 text-sm dark:border-white/10">Cerrar</button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {genericFields.map((field) => (
            <label key={field} className={`text-sm font-medium ${field === 'Notas' || field === 'Direccion' || field.includes('JSON') ? 'sm:col-span-2' : ''}`}>
              {field}
              {field === 'Notas' || field === 'Direccion' || field.includes('JSON') ? (
                <textarea rows={3} className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#007AFF] dark:border-white/10 dark:bg-white/5" />
              ) : field.includes('Fecha') ? (
                <input type="date" className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#007AFF] dark:border-white/10 dark:bg-white/5" />
              ) : field.includes('Comprobante') || field.includes('Imagen') || field.includes('Logo') ? (
                <input type="file" className="mt-2 w-full rounded-2xl border border-dashed border-black/15 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5" />
              ) : (
                <input className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#007AFF] dark:border-white/10 dark:bg-white/5" />
              )}
            </label>
          ))}
        </div>
        {modal.kind === 'member' && (
          <div className="mt-5 rounded-2xl bg-neutral-100 p-4 text-sm text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
            Al guardar se crearia miembro, membresia inicial y pago pendiente o pagado con `POST /api/gym/members`.
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={onClose} className="inline-flex items-center justify-center rounded-full bg-[#007AFF] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(0,122,255,0.22)]">Guardar</button>
          <button onClick={onClose} className="neutral-button">Cancelar</button>
        </div>
      </div>
    </div>
  )
}

function SmallChart({ type = 'bar', values, labels, color = '#007AFF' }: { type?: 'bar' | 'line'; values: number[]; labels?: string[]; color?: string }) {
  const max = Math.max(...values, 1)
  if (type === 'line') {
    const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${100 - (value / max) * 88}`).join(' ')
    return (
      <div className="mt-5">
        <svg viewBox="0 0 100 100" className="h-44 w-full overflow-visible">
          <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {values.map((value, index) => (
            <circle key={index} cx={(index / Math.max(values.length - 1, 1)) * 100} cy={100 - (value / max) * 88} r="2.5" fill={color}>
              <title>{labels?.[index] || index}: {value}</title>
            </circle>
          ))}
        </svg>
        {labels && <div className="mt-2 grid grid-cols-6 gap-1 text-[10px] text-neutral-400">{labels.slice(-6).map((label) => <span key={label}>{label}</span>)}</div>}
      </div>
    )
  }
  return (
    <div className="mt-5 flex h-44 items-end gap-2">
      {values.map((value, index) => (
        <button key={index} className="group flex flex-1 flex-col items-center justify-end gap-2" title={`${labels?.[index] || index}: ${value}`}>
          <span className="w-full rounded-t-xl transition group-hover:brightness-110" style={{ height: `${Math.max((value / max) * 100, 4)}%`, background: color, opacity: 0.42 + index * 0.035 }} />
          {labels && <span className="text-[10px] text-neutral-400">{labels[index]}</span>}
        </button>
      ))}
    </div>
  )
}

function Toolbar({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
      {action && <button onClick={onAction} className="inline-flex items-center justify-center rounded-full bg-[#007AFF] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(0,122,255,0.22)]">{action}</button>}
    </div>
  )
}

function MemberPaymentForms({ setModal }: { setModal: (modal: ModalState) => void }) {
  return (
    <div className="grid gap-3">
      <button onClick={() => setModal({ title: 'Nuevo miembro', kind: 'member' })} className="flex w-full items-center justify-between rounded-2xl border border-black/5 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-[#007AFF] dark:border-white/10 dark:bg-white/5">
        <div>
          <div className="text-lg font-semibold">Nuevo miembro</div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">Crea perfil, membresia inicial y primer pago.</div>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Crear</span>
      </button>
      <button onClick={() => setModal({ title: 'Registrar pago', kind: 'payment' })} className="flex w-full items-center justify-between rounded-2xl border border-black/5 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-emerald-500 dark:border-white/10 dark:bg-white/5">
        <div>
          <div className="text-lg font-semibold">Registrar pago</div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">Busca miembro, metodo, monto y comprobante.</div>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Cobrar</span>
      </button>
    </div>
  )
}

export function OwnerDashboardSurface() {
  const router = useRouter()
  const [data, setData] = useState(dashboardData)
  const [period, setPeriod] = useState<'12M' | '6M'>('12M')
  const [weekOffset, setWeekOffset] = useState(0)
  const [modal, setModal] = useState<ModalState>(null)

  useEffect(() => {
    fetch('/api/gym/dashboard').then((res) => res.json()).then(setData).catch(() => undefined)
  }, [])

  const membership = period === '6M' ? data.membershipEvolution.slice(-6) : data.membershipEvolution
  const income = period === '6M' ? data.incomeComparison.slice(-6) : data.incomeComparison

  const kpiCards = [
    { title: 'Miembros activos', value: data.kpis.membersActive.value, trend: data.kpis.membersActive.trend, color: '#007AFF', route: '/members?status=active' },
    { title: 'Ingresos del mes', value: formatMoney(data.kpis.incomeThisMonth.value), trend: data.kpis.incomeThisMonth.trend, color: '#34C759', route: '/finances/income' },
    { title: 'Nuevos miembros', value: data.kpis.newMembersThisMonth.value, trend: data.kpis.newMembersThisMonth.trend, color: '#FF9500', route: '/members?filter=new&month=current' },
    { title: 'Tasa de asistencia', value: `${data.kpis.attendanceRate.value}%`, trend: data.kpis.attendanceRate.trend, color: '#AF52DE', route: '/reports/attendance' },
    { title: 'Pagos pendientes', value: data.kpis.pendingPayments.count, subtitle: formatMoney(data.kpis.pendingPayments.amount), color: '#FF3B30', route: '/finances/payments?status=pending' },
    { title: 'Clientes en riesgo', value: data.kpis.atRiskClients.value, color: '#FF3B30', modal: 'Clientes en riesgo' },
  ]

  return (
    <div className="space-y-6">
      {data.kpis.pendingPayments.count > 5 && (
        <AppleCard className="flex flex-col justify-between gap-3 bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-100 md:flex-row md:items-center">
          <div className="text-sm font-semibold">Tienes {data.kpis.pendingPayments.count} pagos pendientes que requieren atencion.</div>
          <button onClick={() => router.push('/finances/payments?status=pending')} className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-amber-700">Ir a pagos</button>
        </AppleCard>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kpiCards.map((card) => (
          <button key={card.title} onClick={() => card.route ? router.push(card.route) : setModal({ title: card.modal || card.title })} className="rounded-2xl border border-black/5 bg-white p-5 text-left shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-[#1c1c1e]">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-white" style={{ background: card.color }}>●</div>
              {card.trend !== undefined && <Badge tone={card.trend >= 0 ? 'good' : 'danger'}>{card.trend >= 0 ? '+' : ''}{card.trend}% vs mes anterior</Badge>}
            </div>
            <div className="mt-5 text-3xl font-semibold tracking-tight">{card.value}</div>
            {card.subtitle && <div className="mt-1 text-sm font-semibold text-red-500">{card.subtitle}</div>}
            <div className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{card.title}</div>
          </button>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <AppleCard>
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Evolucion de membresias</div>
            <div className="rounded-full bg-neutral-100 p-1 dark:bg-white/10">
              {['12M', '6M'].map((item) => <button key={item} onClick={() => setPeriod(item as any)} className={`rounded-full px-3 py-1 text-xs font-semibold ${period === item ? 'bg-white shadow-sm dark:bg-neutral-950' : 'text-neutral-500'}`}>{item}</button>)}
            </div>
          </div>
          <SmallChart type="line" color="#007AFF" values={membership.map((item: any) => item.count)} labels={membership.map((item: any) => item.month)} />
        </AppleCard>

        <AppleCard>
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Ingresos mensuales</div>
            <button onClick={() => setModal({ title: 'Exportar grafico ingresos' })} className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold dark:bg-white/10">Descargar</button>
          </div>
          <SmallChart color="#34C759" values={income.map((item: any) => item.income)} labels={income.map((item: any) => item.month.slice(5))} />
        </AppleCard>
      </section>

      <AppleCard>
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <div className="text-lg font-semibold">Asistencia semanal</div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">Semana del 26 may al 1 jun · offset {weekOffset}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setWeekOffset((value) => value - 1)} className="neutral-button py-2">Anterior</button>
            <button onClick={() => setWeekOffset((value) => value + 1)} className="neutral-button py-2">Siguiente</button>
          </div>
        </div>
        <SmallChart color="#AF52DE" values={data.weeklyAttendance.map((item: any) => item.count)} labels={data.weeklyAttendance.map((item: any) => item.day)} />
      </AppleCard>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AppleCard>
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Proximos vencimientos</div>
            <button onClick={() => router.push('/members?filter=expiring')} className="text-sm font-semibold text-[#007AFF]">Ver todos</button>
          </div>
          <div className="mt-5 space-y-3">
            {data.nextExpirations.slice(0, 5).map((item: any) => (
              <div key={item.memberId} className="flex items-center justify-between gap-3 rounded-2xl bg-neutral-100 p-3 dark:bg-white/10">
                <div className="flex items-center gap-3">
                  <Avatar value={item.name} />
                  <div>
                    <div className="text-sm font-semibold">{item.name}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">{item.plan} · vence {item.endDate}</div>
                  </div>
                </div>
                <button onClick={() => setModal({ title: `Renovar membresia - ${item.name}`, kind: 'payment', payload: item })} className="rounded-full border border-[#007AFF]/30 px-3 py-1 text-xs font-semibold text-[#007AFF]">Renovar</button>
              </div>
            ))}
          </div>
        </AppleCard>
        <AppleCard>
          <div className="text-lg font-semibold">Acciones rapidas</div>
          <div className="mt-5"><MemberPaymentForms setModal={setModal} /></div>
        </AppleCard>
      </section>
      <Sheet modal={modal} onClose={() => setModal(null)} />
    </div>
  )
}

function MemberTable({ limited = false, setModal }: { limited?: boolean; setModal: (modal: ModalState) => void }) {
  const router = useRouter()
  return (
    <AppleCard className="overflow-hidden p-0">
      <div className="border-b border-black/5 p-5 dark:border-white/10">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_160px_120px]">
          <input placeholder="Buscar por nombre o email..." className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5" />
          <select className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5"><option>Todos</option><option>Activo</option><option>Pendiente</option><option>Vencido</option></select>
          <select className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5">{gymPlans.map((plan) => <option key={plan.id}>{plan.name}</option>)}</select>
          <button className="neutral-button">Ordenar</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-separate border-spacing-y-2 p-3 text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-neutral-400">
            <tr>{['Foto', 'Nombre', 'Telefono', 'Membresia', 'Vencimiento', 'Ultima asistencia', 'Acciones'].map((header) => <th key={header} className="px-3 py-2">{header}</th>)}</tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} onClick={() => router.push(limited ? `/supervisor/members/${member.id}` : `/members/${member.id}`)} className="cursor-pointer bg-white transition hover:bg-neutral-100 dark:bg-white/5 dark:hover:bg-white/10">
                <td className="rounded-l-2xl px-3 py-3"><Avatar value={member.name} /></td>
                <td className="px-3 py-3"><div className="font-semibold">{member.name}</div><div className="text-xs text-neutral-500">{member.email}</div></td>
                <td className="px-3 py-3">{member.phone}</td>
                <td className="px-3 py-3"><div>{member.plan}</div><Badge tone={member.status === 'active' ? 'good' : member.status === 'pending' ? 'warning' : 'danger'}>{member.status}</Badge></td>
                <td className={`px-3 py-3 ${member.status === 'overdue' ? 'text-red-500' : ''}`}>{member.endDate}</td>
                <td className="px-3 py-3">{member.lastAttendance}</td>
                <td className="rounded-r-2xl px-3 py-3">
                  <button onClick={(event) => { event.stopPropagation(); setModal({ title: `Acciones ${member.name}`, kind: limited ? 'profile' : 'payment' }) }} className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold dark:border-white/10">•••</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppleCard>
  )
}

export function MembersSurface({ selectedSubmodule, role }: { selectedSubmodule: string; role: string }) {
  const [modal, setModal] = useState<ModalState>(null)
  const limited = role === 'supervisor'
  const isDetail = selectedSubmodule.includes('Ficha') || selectedSubmodule.includes('limitada')
  const isNew = selectedSubmodule.includes('Nuevo')

  if (isNew) {
    return (
      <div className="space-y-6">
        <Toolbar title="Nuevo miembro" action="Guardar miembro" onAction={() => setModal({ title: 'Crear miembro y membresia inicial', kind: 'member' })} />
        <AppleCard>
          <div className="grid gap-4 md:grid-cols-2">
            {['Nombre completo', 'Email', 'Telefono', 'Fecha nacimiento', 'Direccion', 'Plan', 'Fecha inicio', 'Fecha fin', 'Precio', 'Metodo de pago'].map((field) => (
              <label key={field} className="text-sm font-medium">{field}<input className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5" /></label>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-neutral-100 p-4 text-sm text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
            Esta pagina prepara el alta completa: perfil, membresia inicial y primer pago pendiente mediante `POST /api/gym/members`.
          </div>
        </AppleCard>
        <Sheet modal={modal} onClose={() => setModal(null)} />
      </div>
    )
  }

  if (isDetail) {
    const tabs = limited ? ['Perfil', 'Rutinas', 'Asistencia', 'Progreso'] : ['Perfil', 'Pagos', 'Asistencia', 'Rutinas', 'Progreso', 'Notas']
    return (
      <div className="space-y-6">
        <AppleCard className="sticky top-[82px] z-20">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <Avatar value="Renato Silva" size="h-24 w-24" />
              <div>
                <button className="mb-2 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold dark:bg-white/10">Volver</button>
                <h1 className="text-3xl font-semibold">Renato Silva</h1>
                <Badge tone="good">Membresia activa</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {!limited && <button onClick={() => setModal({ title: 'Editar miembro', kind: 'member' })} className="neutral-button">Editar</button>}
              {!limited && <button onClick={() => setModal({ title: 'Desactivar miembro' })} className="neutral-button">Desactivar</button>}
            </div>
          </div>
          <div className="mt-5 flex gap-2 overflow-x-auto">{tabs.map((tab) => <button key={tab} onClick={() => setModal({ title: `Tab ${tab}` })} className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-semibold dark:bg-white/10">{tab}</button>)}</div>
        </AppleCard>
        <section className="grid gap-6 lg:grid-cols-2">
          <AppleCard><div className="text-lg font-semibold">Datos personales</div><div className="mt-4 grid gap-3">{['Nombre', 'Email', 'Telefono', 'Fecha nacimiento', 'Direccion'].map((item) => <div key={item} className="rounded-2xl bg-neutral-100 p-4 dark:bg-white/10">{item}</div>)}</div></AppleCard>
          <AppleCard><div className="text-lg font-semibold">Membresia actual</div><div className="mt-5 h-2 rounded-full bg-neutral-100 dark:bg-white/10"><div className="h-full w-[30%] rounded-full bg-[#007AFF]" /></div><button onClick={() => setModal({ title: 'Renovar / Cambiar membresia', kind: 'payment' })} className="mt-5 gold-button">Renovar / Cambiar</button></AppleCard>
          <AppleCard><div className="text-lg font-semibold">Pagos</div><SmallChart values={[120, 149, 0, 149]} color="#34C759" /></AppleCard>
          <AppleCard><div className="text-lg font-semibold">Progreso</div><SmallChart type="line" values={[82, 80, 79, 78.4]} color="#007AFF" /></AppleCard>
        </section>
        <Sheet modal={modal} onClose={() => setModal(null)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Toolbar title="Miembros" action={limited ? undefined : 'Nuevo miembro'} onAction={() => setModal({ title: 'Nuevo miembro', kind: 'member' })} />
      <MemberTable limited={limited} setModal={setModal} />
      <Sheet modal={modal} onClose={() => setModal(null)} />
    </div>
  )
}

export function FinanceSurface({ selectedSubmodule, role }: { selectedSubmodule: string; role: string }) {
  const [modal, setModal] = useState<ModalState>(null)
  const isIncome = selectedSubmodule.includes('Ingresos')
  const isCash = selectedSubmodule.includes('Caja')

  if (isIncome) {
    return (
      <div className="space-y-6">
        <Toolbar title="Ingresos" action={role === 'executive' ? undefined : 'Exportar reporte'} onAction={() => setModal({ title: 'Exportar reporte ingresos' })} />
        <div className="flex gap-2 overflow-x-auto">{['Mes', 'Trimestre', 'Ano'].map((item) => <button key={item} className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-semibold dark:bg-white/10">{item}</button>)}</div>
        <section className="grid gap-4 md:grid-cols-3">
          <AppleCard><div className="text-sm text-neutral-500">Ingresos del periodo</div><div className="mt-2 text-3xl font-semibold">S/ 12,450.00</div><Badge tone="good">+8% vs mes pasado</Badge></AppleCard>
          <AppleCard><div className="text-sm text-neutral-500">Membresias activas</div><div className="mt-2 text-3xl font-semibold">95</div><Badge tone="good">renovaciones + nuevas</Badge></AppleCard>
          <AppleCard><div className="text-sm text-neutral-500">Ticket promedio</div><div className="mt-2 text-3xl font-semibold">S/ 131.05</div><Badge tone="neutral">estable</Badge></AppleCard>
        </section>
        <section className="grid gap-6 xl:grid-cols-[1fr_0.65fr]"><AppleCard><div className="text-lg font-semibold">Ingresos por membresia</div><SmallChart values={[8000, 4450, 1800]} color="#34C759" labels={['Pro', 'Basico', 'Otros']} /></AppleCard><AppleCard><div className="text-lg font-semibold">Distribucion</div><SmallChart values={[64, 36]} color="#007AFF" labels={['Pro', 'Basico']} /></AppleCard></section>
        <AppleCard><div className="text-lg font-semibold">Detalle por membresia</div><div className="mt-4 space-y-2">{['Pro · 50 pagos · S/ 8,000 · 64%', 'Basico · 45 pagos · S/ 4,450 · 36%'].map((item) => <div key={item} className="rounded-2xl bg-neutral-100 p-4 dark:bg-white/10">{item}</div>)}</div></AppleCard>
        <Sheet modal={modal} onClose={() => setModal(null)} />
      </div>
    )
  }

  if (isCash) {
    return (
      <div className="space-y-6">
        <Toolbar title="Caja diaria" action="Agregar movimiento" onAction={() => setModal({ title: 'Agregar ingreso/gasto' })} />
        <section className="grid gap-4 md:grid-cols-4">{['Saldo inicial S/ 500', 'Ingresos S/ 1,240', 'Egresos S/ 320', 'Saldo final S/ 1,420'].map((item) => <AppleCard key={item}><div className="text-lg font-semibold">{item}</div></AppleCard>)}</section>
        <AppleCard><div className="text-lg font-semibold">Movimientos del dia</div><div className="mt-4 space-y-2">{['Ingreso · Mensualidad · S/ 149 · 09:20', 'Gasto · Limpieza · S/ 80 · 11:10'].map((item) => <div key={item} className="rounded-2xl bg-neutral-100 p-4 dark:bg-white/10">{item}</div>)}</div><button onClick={() => setModal({ title: 'Cerrar caja' })} className="mt-5 neutral-button">Cerrar caja</button></AppleCard>
        <Sheet modal={modal} onClose={() => setModal(null)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Toolbar title="Pagos" action="Registrar pago" onAction={() => setModal({ title: 'Registrar pago', kind: 'payment' })} />
      <AppleCard>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_2fr_auto]">
          <input type="date" className="rounded-2xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5" />
          <input type="date" className="rounded-2xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5" />
          <input placeholder="Filtrar por miembro..." className="rounded-2xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5" />
          <button className="neutral-button">Exportar</button>
        </div>
        <div className="mt-4 flex gap-2">{['Todos', 'Pagado', 'Pendiente', 'Vencido'].map((item) => <button key={item} className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-semibold dark:bg-white/10">{item}</button>)}</div>
      </AppleCard>
      <section className="grid gap-4 md:grid-cols-3"><AppleCard><div>Total pagado</div><div className="text-2xl font-semibold text-emerald-600">S/ 1,240.00</div></AppleCard><AppleCard><div>Pendiente</div><div className="text-2xl font-semibold text-red-500">S/ 498.00</div></AppleCard><AppleCard><div>Transacciones</div><div className="text-2xl font-semibold">18</div></AppleCard></section>
      <AppleCard className="overflow-x-auto">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-neutral-400"><tr>{['Miembro', 'Monto', 'Metodo', 'Fecha', 'Estado', 'Acciones'].map((h) => <th key={h} className="px-3 py-3">{h}</th>)}</tr></thead>
          <tbody>{payments.map((payment) => <tr key={payment.id} className="border-t border-black/5 dark:border-white/10"><td className="px-3 py-4">{payment.member}</td><td className="px-3 py-4 font-semibold">{formatMoney(payment.amount)}</td><td className="px-3 py-4">{payment.method}</td><td className="px-3 py-4">{payment.date}</td><td className="px-3 py-4"><Badge tone={payment.status === 'paid' ? 'good' : payment.status === 'pending' ? 'warning' : 'danger'}>{payment.status}</Badge></td><td className="px-3 py-4"><button onClick={() => setModal({ title: `Editar pago ${payment.id}`, kind: 'payment' })} className="neutral-button py-2">•••</button></td></tr>)}</tbody>
        </table>
      </AppleCard>
      <Sheet modal={modal} onClose={() => setModal(null)} />
    </div>
  )
}

export function TrainingSurface({ selectedSubmodule, role }: { selectedSubmodule: string; role: string }) {
  const [modal, setModal] = useState<ModalState>(null)
  const canDelete = role === 'owner'
  const isRoutines = selectedSubmodule.includes('Rutinas') && !selectedSubmodule.includes('Asignar')
  const isAssign = selectedSubmodule.includes('Asignar')
  const isAttendance = selectedSubmodule.includes('Asistencias')

  if (isAttendance) {
    return (
      <div className="space-y-6">
        <Toolbar title="Asistencias" action="Registro manual" onAction={() => setModal({ title: 'Registro manual de asistencia' })} />
        <div className="flex gap-2">{['Registro', 'Historial', 'Reporte'].map((item) => <button key={item} className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-semibold dark:bg-white/10">{item}</button>)}</div>
        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]"><AppleCard><div className="text-lg font-semibold">Check-in rapido</div><input placeholder="Buscar miembro..." className="mt-4 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5" /><button onClick={() => setModal({ title: 'Check-in confirmado' })} className="mt-4 w-full rounded-2xl bg-emerald-600 px-5 py-4 font-semibold text-white">Check-in ahora</button></AppleCard><AppleCard><div className="text-lg font-semibold">Reporte de ocupacion</div><SmallChart values={[25, 31, 28, 34, 37, 22, 12]} labels={['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']} color="#AF52DE" /></AppleCard></section>
        <Sheet modal={modal} onClose={() => setModal(null)} />
      </div>
    )
  }

  if (isAssign) {
    return (
      <div className="space-y-6">
        <Toolbar title="Asignar rutinas" action="Asignar" onAction={() => setModal({ title: 'Asignar rutina a miembros' })} />
        <section className="grid gap-6 xl:grid-cols-3">
          <AppleCard><div className="text-lg font-semibold">Seleccionar rutina</div>{routines.map((routine) => <div key={routine.id} className="mt-3 rounded-2xl bg-neutral-100 p-4 dark:bg-white/10">{routine.name}</div>)}</AppleCard>
          <AppleCard><div className="text-lg font-semibold">Seleccionar miembros</div>{members.slice(0, 4).map((member) => <label key={member.id} className="mt-3 flex gap-2 rounded-2xl bg-neutral-100 p-4 dark:bg-white/10"><input type="checkbox" />{member.name}</label>)}</AppleCard>
          <AppleCard><div className="text-lg font-semibold">Configuracion</div><input type="date" className="mt-4 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5" /><textarea placeholder="Notas generales" className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5" /></AppleCard>
        </section>
        <Sheet modal={modal} onClose={() => setModal(null)} />
      </div>
    )
  }

  if (isRoutines) {
    return (
      <div className="space-y-6">
        <Toolbar title="Rutinas" action="Nueva rutina" onAction={() => setModal({ title: 'Builder de rutina', kind: 'routine' })} />
        <AppleCard><div className="flex gap-2 overflow-x-auto">{['Hipertrofia', 'Fuerza', 'Resistencia', 'Definicion', 'Rehabilitacion'].map((item) => <button key={item} className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-semibold dark:bg-white/10">{item}</button>)}</div></AppleCard>
        <section className="grid gap-4 md:grid-cols-2">{routines.map((routine) => <AppleCard key={routine.id}><div className="flex justify-between"><div><div className="text-2xl font-semibold">{routine.name}</div><div className="mt-2 flex gap-2"><Badge tone="blue">{routine.objective}</Badge><Badge>{routine.level}</Badge></div></div><button onClick={() => setModal({ title: `Opciones ${routine.name}` })} className="neutral-button py-2">•••</button></div><p className="mt-4 text-sm text-neutral-500">Rutina estructurada con ejercicios, series, repeticiones y descanso.</p><ul className="mt-4 space-y-2 text-sm">{routine.exercises.slice(0, 4).map((item) => <li key={item}>• {item}</li>)}</ul><div className="mt-5 text-xs text-neutral-500">{routine.exercises.length} ejercicios · {routine.duration} min</div></AppleCard>)}</section>
        <Sheet modal={modal} onClose={() => setModal(null)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Toolbar title="Ejercicios" action="Nuevo ejercicio" onAction={() => setModal({ title: 'Nuevo ejercicio', kind: 'exercise' })} />
      <AppleCard><div className="grid gap-3 md:grid-cols-[1fr_auto]"><input placeholder="Buscar ejercicio..." className="rounded-2xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5" /><div className="flex gap-2"><button className="neutral-button">Grid</button><button className="neutral-button">Tabla</button></div></div><div className="mt-4 flex gap-2 overflow-x-auto">{['Todos', 'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Cardio'].map((item) => <button key={item} className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-semibold dark:bg-white/10">{item}</button>)}</div></AppleCard>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{exercises.map((exercise) => <AppleCard key={exercise.id}><img src={exercise.image} alt={exercise.name} className="aspect-video w-full rounded-2xl object-cover" /><div className="mt-4 text-xl font-semibold">{exercise.name}</div><div className="mt-2 flex gap-2"><Badge tone="blue">{exercise.group}</Badge><Badge>{exercise.level}</Badge></div><div className="mt-5 flex gap-2"><button onClick={() => setModal({ title: `Editar ${exercise.name}`, kind: 'exercise' })} className="neutral-button py-2">Editar</button>{canDelete && <button onClick={() => setModal({ title: `Eliminar ${exercise.name}` })} className="neutral-button py-2">Eliminar</button>}</div></AppleCard>)}</section>
      <Sheet modal={modal} onClose={() => setModal(null)} />
    </div>
  )
}

export function TrackingNutritionSurface({ selectedSubmodule, moduleKey, role }: { selectedSubmodule: string; moduleKey: string; role: string }) {
  const [modal, setModal] = useState<ModalState>(null)
  const isNutrition = moduleKey === 'nutrition'
  const isSurveys = selectedSubmodule.includes('Encuestas')
  const isRecipes = selectedSubmodule.includes('Recetas')

  if (isNutrition) {
    return (
      <div className="space-y-6">
        <Toolbar title={isRecipes ? 'Recetas' : 'Planes Nutricionales'} action={isRecipes ? 'Nueva receta' : 'Nuevo plan'} onAction={() => setModal({ title: isRecipes ? 'Nueva receta' : 'Nuevo plan nutricional' })} />
        <section className="grid gap-4 md:grid-cols-2">{(isRecipes ? [{ id: 'rec-1', name: 'Bowl proteico', objective: 'Proteica', calories: 480, meals: 1, description: 'Desayuno rapido con macros claros.' }] : nutritionPlans).map((plan) => <AppleCard key={plan.id}><div className="flex justify-between gap-3"><div><div className="text-2xl font-semibold">{plan.name}</div><Badge tone="good">{plan.objective}</Badge></div><button onClick={() => setModal({ title: `Editar ${plan.name}` })} className="neutral-button py-2">•••</button></div><div className="mt-5 text-3xl font-semibold">{plan.calories} kcal</div><div className="mt-2 text-sm text-neutral-500">{plan.meals} comidas · {plan.description}</div><div className="mt-4 space-y-2">{['Desayuno', 'Almuerzo', 'Cena', 'Snacks'].map((meal) => <div key={meal} className="rounded-2xl bg-neutral-100 p-3 text-sm dark:bg-white/10">{meal} · alimentos y macros</div>)}</div></AppleCard>)}</section>
        <Sheet modal={modal} onClose={() => setModal(null)} />
      </div>
    )
  }

  if (isSurveys) {
    return (
      <div className="space-y-6">
        <Toolbar title="Encuestas" action="Exportar CSV" onAction={() => setModal({ title: 'Exportar encuestas' })} />
        <div className="flex gap-2">{['Respuestas', 'Estadisticas'].map((item) => <button key={item} className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-semibold dark:bg-white/10">{item}</button>)}</div>
        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"><AppleCard><div className="text-lg font-semibold">Respuestas</div>{surveys.map((survey) => <div key={survey.id} className="mt-3 rounded-2xl bg-neutral-100 p-4 dark:bg-white/10"><div className="font-semibold">{survey.member} · {survey.routine}</div><div className="text-sm text-neutral-500">Energia {survey.energy}/5 · Dificultad {survey.difficulty}/5 · Satisfaccion {survey.satisfaction}/5</div><p className="mt-2 text-sm">{survey.comments}</p></div>)}</AppleCard><AppleCard><div className="text-lg font-semibold">Satisfaccion por rutina</div><SmallChart values={[4.6, 3.8, 4.2]} labels={['Fuerza', 'Full', 'Core']} color="#FF9500" /></AppleCard></section>
        <Sheet modal={modal} onClose={() => setModal(null)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Toolbar title="Progreso" action="Registrar medicion" onAction={() => setModal({ title: 'Registrar medicion' })} />
      <AppleCard><input placeholder="Buscar miembro..." className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5" /></AppleCard>
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"><AppleCard><div className="text-lg font-semibold">Ultimas mediciones</div>{progressSummary.map((item) => <div key={item.memberId} className="mt-3 flex items-center justify-between rounded-2xl bg-neutral-100 p-4 dark:bg-white/10"><div className="flex items-center gap-3"><Avatar value={item.name} /><div><div className="font-semibold">{item.name}</div><div className="text-xs text-neutral-500">{item.lastMeasurement}</div></div></div><div className="text-right"><div className="font-semibold">{item.weight.toFixed(1)} kg</div><Badge tone={item.change <= 0 ? 'good' : 'warning'}>{item.change} kg</Badge></div></div>)}</AppleCard><AppleCard><div className="text-lg font-semibold">Evolucion de peso</div><SmallChart type="line" values={[82, 81, 80, 79, 78.4]} color="#007AFF" /><div className="mt-4 grid grid-cols-2 gap-3">{['Fotos comparativas', 'Tabla de medidas', 'Exportar CSV', 'Lightbox'].map((item) => <button key={item} className="rounded-2xl bg-neutral-100 p-3 text-sm font-semibold dark:bg-white/10">{item}</button>)}</div></AppleCard></section>
      <Sheet modal={modal} onClose={() => setModal(null)} />
    </div>
  )
}

export function SettingsSurface({ selectedSubmodule, platform = false }: { selectedSubmodule: string; platform?: boolean }) {
  const [modal, setModal] = useState<ModalState>(null)
  const isPayments = selectedSubmodule.includes('Cobros') || selectedSubmodule.includes('Metodos')
  const isIntegrations = selectedSubmodule.includes('Integraciones')
  const isRequests = selectedSubmodule.includes('Solicitudes')

  if (isPayments) {
    const methods = platform ? platformPaymentMethods : gymPaymentMethods
    return (
      <div className="grid gap-6 xl:grid-cols-[240px_1fr]">
        <AppleCard className="h-max">{(platform ? ['General', 'Cobros plataforma', 'Integraciones', 'Solicitudes', 'Plantillas', 'WhatsApp'] : ['Perfil', 'Equipo', 'Metodos de pago', 'Integraciones', 'Preferencias', 'Suscripcion']).map((item) => <div key={item} className={`rounded-2xl p-3 text-sm font-semibold ${item === selectedSubmodule ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950' : 'text-neutral-500'}`}>{item}</div>)}</AppleCard>
        <div className="space-y-6">
          <Toolbar title={platform ? 'Cobros de la plataforma' : 'Metodos de pago'} action="Guardar cambios" onAction={() => setModal({ title: 'Guardar metodos de pago' })} />
          <section className="grid gap-4 md:grid-cols-2">{methods.map((method: any) => <AppleCard key={method.id}><div className="flex items-start justify-between"><div><div className="text-xl font-semibold">{method.name || method.label}</div><div className="mt-2 text-sm text-neutral-500">{method.instructions || method.config?.phone || method.type}</div></div><Badge tone={method.active ? 'good' : 'neutral'}>{method.active ? 'Activo' : 'Inactivo'}</Badge></div>{method.qrUrl || method.config?.qrUrl ? <img src={method.qrUrl || method.config.qrUrl} alt={method.name || method.label} className="mt-4 h-28 w-28 rounded-2xl border border-black/10 object-cover" /> : null}<button onClick={() => setModal({ title: `Editar ${method.name || method.label}` })} className="mt-5 neutral-button">Editar</button></AppleCard>)}</section>
        </div>
        <Sheet modal={modal} onClose={() => setModal(null)} />
      </div>
    )
  }

  if (isIntegrations || isRequests) {
    return (
      <div className="grid gap-6 xl:grid-cols-[240px_1fr]">
        <AppleCard className="h-max">{(platform ? ['General', 'Cobros plataforma', 'Integraciones', 'Solicitudes', 'Plantillas', 'WhatsApp'] : ['Perfil', 'Equipo', 'Metodos de pago', 'Integraciones', 'Preferencias', 'Suscripcion']).map((item) => <div key={item} className={`rounded-2xl p-3 text-sm font-semibold ${item === selectedSubmodule ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950' : 'text-neutral-500'}`}>{item}</div>)}</AppleCard>
        <div className="space-y-6">
          <Toolbar title={platform ? (isRequests ? 'Solicitudes de integracion' : 'Pasarelas soportadas') : 'Integraciones'} action={platform ? 'Nueva pasarela' : 'Solicitar activacion'} onAction={() => setModal({ title: platform ? 'Nueva pasarela' : 'Solicitar activacion', kind: 'gateway' })} />
          <section className="grid gap-4 md:grid-cols-2">{(isRequests ? integrationRequests : gateways).map((item: any) => <AppleCard key={item.id}><div className="flex justify-between gap-3"><div><div className="text-xl font-semibold">{item.name || item.gateway}</div><div className="mt-2 text-sm text-neutral-500">{item.description || item.gym}</div></div><Badge tone={item.status === 'pending' ? 'warning' : item.status === 'active' || item.isActive ? 'good' : 'danger'}>{item.status || (item.isActive ? 'Activa' : 'Inactiva')}</Badge></div><div className="mt-4 text-sm text-neutral-500">{item.requiredFields?.join(', ') || item.notes}</div><button onClick={() => setModal({ title: platform ? `Configurar ${item.name || item.gateway}` : `Solicitar ${item.name}`, kind: 'gateway' })} className="mt-5 neutral-button">{platform ? 'Configurar y activar' : 'Solicitar activacion'}</button></AppleCard>)}</section>
        </div>
        <Sheet modal={modal} onClose={() => setModal(null)} />
      </div>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[240px_1fr]">
      <AppleCard className="h-max">{(platform ? ['General', 'Cobros plataforma', 'Integraciones', 'Solicitudes', 'Plantillas', 'WhatsApp'] : ['Perfil', 'Equipo', 'Metodos de pago', 'Integraciones', 'Preferencias', 'Suscripcion']).map((item) => <div key={item} className={`rounded-2xl p-3 text-sm font-semibold ${item === selectedSubmodule ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950' : 'text-neutral-500'}`}>{item}</div>)}</AppleCard>
      <AppleCard>
        <Toolbar title={selectedSubmodule} action="Guardar ajustes" onAction={() => setModal({ title: `Guardar ${selectedSubmodule}` })} />
        <div className="mt-6 grid gap-4 md:grid-cols-2">{['Nombre', 'Moneda', 'Zona horaria', 'Plantilla', 'Notificaciones', 'Estado'].map((field) => <label key={field} className="text-sm font-medium">{field}<input className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5" /></label>)}</div>
      </AppleCard>
      <Sheet modal={modal} onClose={() => setModal(null)} />
    </div>
  )
}
