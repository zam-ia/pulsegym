import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
import { products as featuredProducts, whatsappProductUrl } from '../lib/marketplace'
import { landingPlans } from '../lib/pulseData'

type Step = 1 | 2 | 3 | 4
type PayApp = 'Yape' | 'Plin'

type Plan = {
  id: string
  name: string
  price: string
  limit: string
  trainers: string
  recommended?: boolean
  features: string[]
}

const initialForm = {
  gymName: '',
  ownerName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
}

const asNumber = (price: string) => Number(price.replace(/[^0-9.]/g, '')) || 0

export default function Signup() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [plans, setPlans] = useState<Plan[]>(landingPlans.map((plan) => ({
    id: plan.name.toLowerCase(),
    name: plan.name,
    price: plan.price,
    limit: plan.limit,
    trainers: plan.trainers,
    recommended: plan.recommended,
    features: plan.features,
  })))
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [payApp, setPayApp] = useState<PayApp>('Yape')
  const [form, setForm] = useState(initialForm)
  const [proofName, setProofName] = useState('')
  const [proofPreview, setProofPreview] = useState('')
  const [confirmedPayment, setConfirmedPayment] = useState(false)
  const [status, setStatus] = useState<{ type: 'ok' | 'error'; message: string; reference?: string; whatsappUrl?: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (typeof router.query.plan === 'string') {
      setSelectedPlan(router.query.plan.toLowerCase())
    }
  }, [router.query.plan])

  useEffect(() => {
    fetch('/api/plans/public')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.plans)) {
          setPlans(data.plans)
        }
      })
      .catch(() => undefined)
  }, [])

  const plan = useMemo(() => plans.find((item) => item.id === selectedPlan) || plans[0], [plans, selectedPlan])
  const amount = asNumber(plan?.price || 'S/ 149')
  const referenceConcept = `PULSE-${form.email || 'tu-email'}`
  const canContinueData = form.gymName && form.ownerName && form.email && form.phone && form.password.length >= 8 && form.password === form.confirmPassword

  function selectProof(file?: File) {
    if (!file) {
      return
    }
    if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'El comprobante debe ser PNG/JPG y pesar maximo 5 MB.' })
      return
    }
    setProofName(file.name)
    setProofPreview(URL.createObjectURL(file))
    setStatus(null)
  }

  async function submitProof(e: React.FormEvent) {
    e.preventDefault()
    if (!confirmedPayment || !proofName) {
      setStatus({ type: 'error', message: 'Confirma el pago y sube una captura antes de finalizar.' })
      return
    }

    setSubmitting(true)
    setStatus(null)

    try {
      const res = await fetch('/api/register/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          plan: plan?.name,
          amount,
          paymentMethod: payApp,
          screenshotName: proofName,
          concept: referenceConcept,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'register_failed')
      }
      setStatus({
        type: 'ok',
        message: data.verification.message,
        reference: data.verification.reference,
        whatsappUrl: data.verification.whatsappUrl,
      })
      setStep(4)
    } catch {
      setStatus({ type: 'error', message: 'No se pudo registrar la solicitud. Revisa los campos requeridos.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f2f2f7_0%,#e5e5ea_100%)] px-4 py-8 text-neutral-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(255,170,1,0.18),transparent_26%),radial-gradient(circle_at_86%_0%,rgba(0,122,255,0.12),transparent_24%)]" />
      <div className="relative mx-auto max-w-6xl">
        <nav className="flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold">PulseGym</Link>
          <div className="flex gap-2">
            <Link href="/agendar" className="neutral-button py-2">Agendar demo</Link>
            <Link href="/login" className="gold-button py-2">Ya tengo cuenta</Link>
          </div>
        </nav>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="rounded-[28px] border border-white/70 bg-white/76 p-6 shadow-soft backdrop-blur-2xl md:p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Registro publico</div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Activa tu gimnasio sin pasarela externa.</h1>
            <p className="mt-4 text-sm leading-6 text-neutral-600">
              Elige plan, registra tus datos y paga con Yape/Plin. El Super Admin valida tu comprobante y activa tu cuenta.
            </p>
            <div className="mt-8 space-y-3">
              {[
                [1, 'Plan'],
                [2, 'Datos'],
                [3, 'Pago o demo'],
                [4, 'Confirmacion'],
              ].map(([number, label]) => (
                <div key={label} className={`flex items-center gap-3 rounded-2xl p-3 ${step === number ? 'bg-neutral-950 text-white' : 'bg-white/70 text-neutral-600'}`}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-black">{number}</span>
                  <span className="text-sm font-semibold">{label}</span>
                </div>
              ))}
            </div>
          </aside>

          <section className="rounded-[28px] border border-white/70 bg-white/82 p-6 shadow-soft backdrop-blur-2xl md:p-8">
            {step === 1 && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Paso 1</div>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Selecciona tu plan</h2>
                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  {plans.filter((item) => item.name !== 'Starter').map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedPlan(item.id)}
                      className={`rounded-[22px] border p-5 text-left transition hover:-translate-y-0.5 ${selectedPlan === item.id ? 'border-accent bg-accent/10 ring-2 ring-accent/30' : 'border-black/5 bg-white'}`}
                    >
                      {item.recommended && <span className="mb-4 inline-flex rounded-full bg-accent px-3 py-1 text-xs font-bold text-black">Popular</span>}
                      <div className="text-xl font-semibold">{item.name}</div>
                      <div className="mt-3 text-3xl font-semibold">{item.price}</div>
                      <div className="mt-2 text-sm text-neutral-500">{item.limit}</div>
                      <div className="mt-1 text-sm text-neutral-500">{item.trainers}</div>
                    </button>
                  ))}
                </div>
                <button onClick={() => setStep(2)} className="mt-6 gold-button">Continuar</button>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Paso 2</div>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Datos del dueno y gimnasio</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    ['gymName', 'Nombre del gimnasio'],
                    ['ownerName', 'Nombre completo del dueno'],
                    ['email', 'Email de acceso'],
                    ['phone', 'Telefono / WhatsApp'],
                    ['password', 'Contrasena'],
                    ['confirmPassword', 'Confirmar contrasena'],
                  ].map(([key, label]) => (
                    <label key={key} className="text-sm font-medium">
                      {label}
                      <input
                        type={key.includes('password') || key.includes('Password') ? 'password' : 'text'}
                        value={form[key as keyof typeof form]}
                        onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))}
                        className="mt-2 w-full rounded-[18px] border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/10"
                        required
                      />
                    </label>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button onClick={() => setStep(1)} className="neutral-button">Volver</button>
                  <button disabled={!canContinueData} onClick={() => setStep(3)} className="gold-button disabled:opacity-50">Continuar</button>
                </div>
                {form.password && form.password.length < 8 && <p className="mt-3 text-sm text-red-600">La contrasena debe tener minimo 8 caracteres.</p>}
                {form.confirmPassword && form.password !== form.confirmPassword && <p className="mt-3 text-sm text-red-600">Las contrasenas no coinciden.</p>}
              </div>
            )}

            {step === 3 && (
              <form onSubmit={submitProof}>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Paso 3</div>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Paga ahora o agenda una demo</h2>
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[24px] border border-accent bg-accent/10 p-5">
                    <div className="text-lg font-semibold">Pagar ahora con Yape/Plin</div>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">Completa tu pago con QR y sube la captura para validacion manual.</p>
                    <div className="mt-4 rounded-[20px] bg-white p-4">
                      <div className="flex gap-2">
                        {(['Yape', 'Plin'] as PayApp[]).map((app) => (
                          <button key={app} type="button" onClick={() => setPayApp(app)} className={`rounded-full px-4 py-2 text-xs font-semibold ${payApp === app ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-600'}`}>{app}</button>
                        ))}
                      </div>
                      <div className="mt-4 grid items-center gap-4 sm:grid-cols-[160px_1fr]">
                        <img src={payApp === 'Yape' ? '/qr-yape.png' : '/qr-plin.png'} alt={`QR ${payApp}`} className="h-40 w-40 rounded-[18px] border border-black/10 bg-white object-cover" />
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Monto exacto</div>
                          <div className="mt-1 text-4xl font-semibold text-accent">S/ {amount}</div>
                          <div className="mt-3 text-sm text-neutral-600">Concepto sugerido: <span className="font-semibold">{referenceConcept}</span></div>
                        </div>
                      </div>
                      <ol className="mt-4 space-y-2 text-sm text-neutral-600">
                        <li>1. Abre tu app {payApp} en tu celular.</li>
                        <li>2. Escanea este codigo QR.</li>
                        <li>3. Ingresa el monto exacto.</li>
                        <li>4. En concepto escribe {referenceConcept}.</li>
                      </ol>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-black/5 bg-white p-5">
                    <div className="text-lg font-semibold">Agendar una reunion</div>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">Si prefieres cerrar la venta conmigo, agenda una demo y te contacto por WhatsApp.</p>
                    <Link href={`/agendar?plan=${selectedPlan}`} className="mt-5 neutral-button">Agendar demo</Link>
                  </div>
                </div>

                <div className="mt-6 rounded-[24px] bg-neutral-50 p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium">
                      Email
                      <input value={form.email} readOnly className="mt-2 w-full rounded-[18px] border border-black/10 bg-white px-4 py-3 text-neutral-500 outline-none" />
                    </label>
                    <label className="text-sm font-medium">
                      Telefono
                      <input value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} className="mt-2 w-full rounded-[18px] border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#007AFF]" />
                    </label>
                  </div>
                  <label className="mt-4 block text-sm font-medium">
                    Subir comprobante PNG/JPG max. 5 MB
                    <input type="file" accept="image/png,image/jpeg" onChange={(e) => selectProof(e.target.files?.[0])} className="mt-2 w-full rounded-[18px] border border-dashed border-black/15 bg-white px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-neutral-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white" />
                  </label>
                  {proofPreview && <img src={proofPreview} alt="Preview comprobante" className="mt-4 max-h-56 rounded-[18px] border border-black/10 object-contain" />}
                  <label className="mt-4 flex items-center gap-2 text-sm text-neutral-600">
                    <input type="checkbox" checked={confirmedPayment} onChange={(e) => setConfirmedPayment(e.target.checked)} className="h-4 w-4 accent-[#007AFF]" />
                    Confirmo que he realizado el pago por el monto indicado.
                  </label>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" onClick={() => setStep(2)} className="neutral-button">Volver</button>
                  <button disabled={submitting} className="gold-button disabled:opacity-50">{submitting ? 'Enviando...' : 'Enviar comprobante y finalizar registro'}</button>
                </div>
              </form>
            )}

            {step === 4 && (
              <div>
                <div className="rounded-[24px] bg-emerald-50 p-6 text-emerald-800">
                  <div className="text-2xl font-semibold">Comprobante enviado</div>
                  <p className="mt-2 text-sm leading-6">Revisaremos tu pago en breve. Recibiras tus accesos por correo y WhatsApp cuando sea aprobado.</p>
                  {status?.reference && <div className="mt-4 rounded-2xl bg-white p-4 text-sm font-semibold">Tu codigo de referencia: {status.reference}</div>}
                  {status?.whatsappUrl && <a href={status.whatsappUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex font-semibold">Enviar aviso manual por WhatsApp</a>}
                </div>

                <div className="mt-6">
                  <div className="text-lg font-semibold">Ofertas recomendadas mientras activamos tu cuenta</div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {featuredProducts.slice(0, 3).map((product) => (
                      <a key={product.id} href={whatsappProductUrl(product)} target="_blank" rel="noreferrer" className="rounded-[20px] border border-black/5 bg-white p-4 transition hover:-translate-y-0.5">
                        <div className="text-sm font-semibold">{product.name}</div>
                        <div className="mt-1 text-xs text-neutral-500">Codigo {product.discountCode}</div>
                        <div className="mt-3 text-lg font-semibold text-accent">S/ {product.discountPrice}</div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {status?.type === 'error' && (
              <div className="mt-6 rounded-[18px] bg-red-50 p-4 text-sm text-red-700">
                {status.message}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  )
}
