import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { authenticate, setSession } from '../lib/auth'
import type { Product } from '../lib/marketplace'
import { whatsappProductUrl } from '../lib/marketplace'
import { getDefaultModuleForRole, getModulePath } from '../lib/pulseData'

function Alert({ title, message, onClose }: { title: string; message: string; onClose: () => void }) {
  return (
    <div className="fixed left-1/2 top-5 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-[18px] border border-red-200 bg-white/90 p-4 shadow-soft backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-red-600">{title}</div>
          <div className="mt-1 text-sm text-neutral-600">{message}</div>
        </div>
        <button onClick={onClose} className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold">Cerrar</button>
      </div>
    </div>
  )
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(null)
  const [offers, setOffers] = useState<Product[]>([])
  const router = useRouter()

  useEffect(() => {
    fetch('/api/products?active=true&featured=true&limit=4')
      .then((res) => res.json())
      .then((data) => setOffers(Array.isArray(data.products) ? data.products : []))
      .catch(() => setOffers([]))
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    const res = await authenticate(email, password)
    if (!res.ok) {
      const copy = {
        invalid_credentials: ['Credenciales incorrectas', 'Revisa tu email y contrasena o solicita recuperacion de acceso.'],
        user_suspended: ['Usuario suspendido', 'Tu usuario esta bloqueado. Contacta al administrador del gimnasio.'],
        gym_suspended: ['Gimnasio suspendido', 'El gimnasio asociado esta suspendido por estado comercial o deuda.'],
        supabase_not_configured: ['Supabase no configurado', 'Falta configurar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.'],
      } as const
      const [title, message] = copy[res.reason]
      setAlert({ title, message })
      return
    }

    if (remember) {
      localStorage.setItem('pulsegym_remember', 'true')
    }

    setSession(res.user)
    const defaultModule = getDefaultModuleForRole(res.user.role)
    router.push(getModulePath(defaultModule, defaultModule.submodules[0]))
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f2f2f7_0%,#e5e5ea_100%)] px-4 py-8 text-neutral-950 dark:bg-[linear-gradient(135deg,#050505_0%,#171717_100%)] dark:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(0,122,255,0.16),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(255,170,1,0.2),transparent_26%)] dark:bg-[radial-gradient(circle_at_18%_10%,rgba(0,122,255,0.12),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(255,170,1,0.12),transparent_26%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center gap-10">
        <section className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-6 inline-flex rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 dark:text-white">
            Volver a PulseGym
          </Link>

          <div className="rounded-[28px] border border-white/70 bg-white/82 p-6 shadow-soft backdrop-blur-2xl dark:border-white/10 dark:bg-neutral-950/76 md:p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Login</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Entrar a PulseGym</h2>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Usa el email y contrasena de tu cuenta creada en Supabase.</p>

            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <label className="block text-sm font-medium">
                Email
                <div className="mt-2 flex items-center gap-3 rounded-[18px] border border-black/10 bg-white px-4 py-3 transition focus-within:border-[#007AFF] focus-within:ring-4 focus-within:ring-[#007AFF]/10 dark:border-white/10 dark:bg-white/5">
                  <span className="text-neutral-400">@</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent outline-none"
                    autoComplete="email"
                  />
                </div>
              </label>

              <label className="block text-sm font-medium">
                Contrasena
                <div className="mt-2 flex items-center gap-3 rounded-[18px] border border-black/10 bg-white px-4 py-3 transition focus-within:border-[#007AFF] focus-within:ring-4 focus-within:ring-[#007AFF]/10 dark:border-white/10 dark:bg-white/5">
                  <span className="text-neutral-400">#</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent outline-none"
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} className="text-xs font-semibold text-[#007AFF]">
                    {showPassword ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-[#007AFF]" />
                  Recordar sesion
                </label>
                <button
                  type="button"
                  onClick={() => setAlert({ title: 'Recuperacion de contrasena', message: 'En produccion se enviara magic link o codigo temporal por email/WhatsApp.' })}
                  className="text-sm font-semibold text-[#007AFF]"
                >
                  Recuperar contrasena
                </button>
              </div>

              <button className="inline-flex w-full items-center justify-center rounded-full bg-[#007AFF] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(0,122,255,0.28)] transition hover:-translate-y-0.5">
                Entrar
              </button>

              <div className="rounded-[18px] bg-neutral-100 p-4 text-sm text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
                Todavia no tienes cuenta?
                <Link href="/signup?plan=pro" className="ml-2 font-semibold text-[#007AFF]">Crear cuenta y verificar pago</Link>
              </div>
            </form>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/60 bg-white/64 p-5 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Marketplace</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Ofertas especiales para gimnasios</h2>
            </div>
            <Link href="/productos" className="text-sm font-semibold text-[#007AFF]">Ver todas las ofertas</Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {offers.map((product) => (
              <a
                key={product.id}
                href={product.stock === 0 ? undefined : whatsappProductUrl(product)}
                target="_blank"
                rel="noreferrer"
                className="group rounded-[22px] border border-black/5 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-accent dark:border-white/10 dark:bg-neutral-950/70"
              >
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-[18px] bg-neutral-100 dark:bg-white/10">
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <span className="text-xs text-neutral-400">Sin imagen</span>}
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="truncate text-sm font-semibold">{product.name}</div>
                  {product.stock === 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">Agotado</span>}
                </div>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-xs text-neutral-400 line-through">S/ {product.basePrice}</span>
                  <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-300">S/ {product.discountPrice}</span>
                </div>
                <div className="mt-2 inline-flex rounded-full bg-neutral-100 px-3 py-1 font-mono text-[11px] font-semibold text-neutral-600 dark:bg-white/10 dark:text-neutral-300">{product.discountCode}</div>
              </a>
            ))}
          </div>
        </section>
      </div>
      {alert && <Alert title={alert.title} message={alert.message} onClose={() => setAlert(null)} />}
    </main>
  )
}
