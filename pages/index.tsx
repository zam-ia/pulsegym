import Link from 'next/link'
import React from 'react'
import { landingPlans } from '../lib/pulseData'

const benefits = [
  {
    title: 'Control total',
    copy: 'Miembros, planes, vencimientos, asistencia y alertas en un mismo panel.',
    metric: '360',
  },
  {
    title: 'Seguimiento de clientes',
    copy: 'Detecta ausencias, riesgo de abandono y rutinas pendientes antes de perder ingresos.',
    metric: '24h',
  },
  {
    title: 'Reportes inteligentes',
    copy: 'MRR, cobranza, asistencia y crecimiento listos para decidir sin Excel.',
    metric: 'Live',
  },
  {
    title: 'Soporte WhatsApp',
    copy: 'Flujos de venta, cobranza y activacion pensados para gimnasios reales.',
    metric: 'WA',
  },
]

const testimonials = [
  ['Pulse Gym Lima', 'Reducimos pagos vencidos y el equipo sabe que atender cada dia.'],
  ['Titan Fitness', 'El dashboard ejecutivo nos ordeno caja, miembros y rutinas sin cambiar todo el proceso.'],
  ['Studio Norte', 'La vista por rol hizo mas facil delegar operaciones sin perder control.'],
]

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/50 bg-white/78 p-3 shadow-soft backdrop-blur-2xl">
      <div className="rounded-[22px] bg-neutral-950 p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">PulseGym Command</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">Que atender hoy</div>
          </div>
          <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold">MRR S/ 16,280</div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {[
            ['421', 'Miembros activos'],
            ['S/ 42,880', 'Ingresos mes'],
            ['31', 'Morosos'],
            ['19', 'En riesgo'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-[18px] bg-white/8 p-4">
              <div className="text-2xl font-semibold">{value}</div>
              <div className="mt-1 text-xs text-neutral-300">{label}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[18px] bg-white p-5 text-neutral-950">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Evolucion de ingresos</div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">+12.4%</div>
            </div>
            <div className="mt-6 flex h-40 items-end gap-2">
              {[38, 58, 51, 72, 64, 86, 78, 92].map((height, index) => (
                <div key={index} className="flex-1 rounded-t-xl bg-neutral-950 transition hover:bg-accent" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {[
              ['Cobrar Titan Fitness', 'S/ 149 vencido'],
              ['Contactar ausentes', '19 miembros en riesgo'],
              ['Aprobar registro', 'Iron Club mando captura'],
            ].map(([title, detail]) => (
              <div key={title} className="rounded-[18px] bg-white/10 p-4">
                <div className="text-sm font-semibold">{title}</div>
                <div className="mt-1 text-xs text-neutral-300">{detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f5f7] text-neutral-950">
      <nav className="sticky top-0 z-40 border-b border-white/50 bg-white/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">PulseGym</Link>
          <div className="hidden items-center gap-6 text-sm font-medium text-neutral-600 md:flex">
            <a href="#beneficios">Beneficios</a>
            <a href="#vsl">Demo</a>
            <a href="#planes">Planes</a>
            <Link href="/productos">Productos</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="neutral-button py-2">Entrar</Link>
            <Link href="/signup?plan=pro" className="gold-button py-2">Comenzar</Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden px-4 pb-16 pt-10 md:pb-20 md:pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,170,1,0.18),transparent_28%),linear-gradient(135deg,#f5f5f7_0%,#e5e5ea_100%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-10 lg:grid-cols-[0.86fr_1.14fr]">
            <div>
              <div className="inline-flex rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-semibold text-neutral-700 shadow-sm backdrop-blur-2xl">
                Modo noche/dia · Rutinas · Pagos · Comunidad
              </div>
              <h1 className="mt-7 text-5xl font-semibold tracking-tight md:text-7xl">
                El software que tu gimnasio necesita para crecer sin caos
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
                Controla clientes, cobros, rutinas, asistencia, riesgo de abandono y reportes desde una experiencia premium pensada para duenos de gimnasio.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup?plan=pro" className="gold-button">Comenzar ahora</Link>
                <Link href="/agendar" className="neutral-button">Agendar demo</Link>
                <a href="https://wa.me/51987088359?text=Hola%20PulseGym,%20quiero%20una%20demo" target="_blank" rel="noreferrer" className="neutral-button">
                  Hablar por WhatsApp
                </a>
              </div>
              <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
                {['MRR claro', 'Pagos manuales', 'Roles reales'].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/60 bg-white/65 p-3 text-center text-xs font-semibold text-neutral-600 backdrop-blur-xl">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <ProductPreview />
          </div>
        </div>
      </section>

      <section id="beneficios" className="mx-auto max-w-6xl px-4 py-16">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Beneficios</div>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Menos navegacion. Mas decisiones claras.</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="rounded-[24px] border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur-2xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-950 text-xs font-bold text-white">{benefit.metric}</div>
              <h3 className="mt-6 text-xl font-semibold">{benefit.title}</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{benefit.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="vsl" className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative min-h-[360px] overflow-hidden rounded-[28px] bg-neutral-950 p-6 text-white shadow-soft">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,170,1,0.28),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent)]" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">VSL Demo</div>
                <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight">Mira como una operacion desordenada se convierte en panel de decisiones.</h2>
              </div>
              <button className="mt-12 flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/12 text-2xl backdrop-blur-xl transition hover:bg-accent hover:text-black" aria-label="Reproducir demo">
                ▶
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {testimonials.map(([gym, quote]) => (
              <div key={gym} className="rounded-[24px] border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur-2xl">
                <div className="text-sm font-semibold">{gym}</div>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="planes" className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Planes</div>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">Elige plan y activa tu verificacion manual.</h2>
          </div>
          <Link href="/signup" className="neutral-button">Registrarme</Link>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {landingPlans.map((plan) => {
            const planId = plan.name.toLowerCase()
            return (
              <div key={plan.name} className={`rounded-[24px] border bg-white/86 p-6 shadow-sm backdrop-blur-2xl ${plan.recommended ? 'border-accent ring-2 ring-accent/40' : 'border-white/60'}`}>
                {plan.recommended && <div className="mb-4 inline-flex rounded-full bg-accent px-3 py-1 text-xs font-bold text-black">Mas popular</div>}
                <div className="text-xl font-semibold">{plan.name}</div>
                <div className="mt-4 text-3xl font-semibold">{plan.price}</div>
                <div className="mt-2 text-sm text-neutral-500">{plan.limit}</div>
                <div className="mt-1 text-sm text-neutral-500">{plan.trainers}</div>
                <ul className="mt-6 space-y-3 text-sm text-neutral-700">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`/signup?plan=${planId}`} className="mt-6 w-full gold-button">
                  Elegir plan
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      <footer className="border-t border-black/5 bg-white/70 px-4 py-8 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 text-sm text-neutral-500 md:flex-row md:items-center">
          <div>PulseGym SaaS · Lima, Peru</div>
          <div className="flex gap-4">
            <Link href="/login">Login</Link>
            <Link href="/signup">Registro</Link>
            <Link href="/productos">Productos</Link>
            <Link href="/agendar">Agendar demo</Link>
            <a href="https://wa.me/51987088359" target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
        </div>
      </footer>

      <a
        href="https://wa.me/51987088359?text=Hola%20PulseGym,%20quiero%20activar%20mi%20gimnasio"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-sm font-bold text-white shadow-soft"
        aria-label="WhatsApp"
      >
        WA
      </a>
    </main>
  )
}
