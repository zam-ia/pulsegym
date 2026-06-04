import Link from 'next/link'
import React, { useState } from 'react'
import { landingPlans } from '../lib/pulseData'

const initialForm = {
  ownerName: '',
  email: '',
  phone: '',
  desiredPlan: 'Pro',
  message: '',
}

export default function Agendar() {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState<{ message: string; whatsappUrl?: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setStatus(null)

    try {
      const res = await fetch('/api/contact-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'contact_failed')
      }
      setStatus({ message: 'Solicitud registrada. Te contactaremos por WhatsApp para coordinar la demo.', whatsappUrl: data.request.whatsappUrl })
    } catch {
      setStatus({ message: 'No se pudo registrar la solicitud. Revisa los campos requeridos.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f2f2f7_0%,#e5e5ea_100%)] px-4 py-8 text-neutral-950">
      <div className="mx-auto max-w-5xl">
        <nav className="flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold">PulseGym</Link>
          <Link href="/signup?plan=pro" className="neutral-button py-2">Prefiero pagar ahora</Link>
        </nav>

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <section className="rounded-[28px] border border-white/70 bg-white/76 p-8 shadow-soft backdrop-blur-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Demo personalizada</div>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight">Agenda una reunion para cerrar tu activacion.</h1>
            <p className="mt-4 text-sm leading-6 text-neutral-600">
              Si prefieres conversar antes de pagar, deja tus datos. Se guarda como `contact_requests` y se notifica por WhatsApp con enlace manual.
            </p>
            <div className="mt-8 rounded-[22px] bg-neutral-950 p-5 text-white">
              <div className="text-sm font-semibold">Calendly futuro</div>
              <p className="mt-2 text-sm leading-6 text-neutral-300">Cuando tengas tu enlace, este espacio puede reemplazarse por el iframe de Calendly sin cambiar el resto del flujo.</p>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/70 bg-white/82 p-8 shadow-soft backdrop-blur-2xl">
            <form onSubmit={submit} className="space-y-5">
              {[
                ['ownerName', 'Nombre completo'],
                ['email', 'Email'],
                ['phone', 'Telefono / WhatsApp'],
              ].map(([key, label]) => (
                <label key={key} className="block text-sm font-medium">
                  {label}
                  <input
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))}
                    className="mt-2 w-full rounded-[18px] border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/10"
                    required
                  />
                </label>
              ))}

              <label className="block text-sm font-medium">
                Plan de interes
                <select
                  value={form.desiredPlan}
                  onChange={(e) => setForm((current) => ({ ...current, desiredPlan: e.target.value }))}
                  className="mt-2 w-full rounded-[18px] border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/10"
                >
                  {landingPlans.map((plan) => (
                    <option key={plan.name} value={plan.name}>{plan.name}</option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium">
                Mensaje opcional
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((current) => ({ ...current, message: e.target.value }))}
                  rows={4}
                  className="mt-2 w-full rounded-[18px] border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/10"
                />
              </label>

              <button disabled={submitting} className="inline-flex w-full items-center justify-center rounded-full bg-[#007AFF] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(0,122,255,0.28)] transition hover:-translate-y-0.5 disabled:opacity-60">
                {submitting ? 'Enviando...' : 'Agendar demo'}
              </button>

              {status && (
                <div className="rounded-[18px] bg-emerald-50 p-4 text-sm text-emerald-800">
                  <div>{status.message}</div>
                  {status.whatsappUrl && <a href={status.whatsappUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex font-semibold">Enviar aviso por WhatsApp</a>}
                </div>
              )}
            </form>
          </section>
        </div>
      </div>
    </main>
  )
}
