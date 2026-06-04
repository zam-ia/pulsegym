import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'
import type { Role } from '../lib/mockData'
import { roleLabels } from '../lib/pulseData'
import { signOut } from '../lib/auth'
import UniversalInput from './UniversalInput'

type HeaderProps = {
  isApp?: boolean
  user?: { id?: string; name: string; role: Role; gymPlan?: string } | null
  isDark?: boolean
  onToggleTheme?: () => void
}

type NotificationItem = {
  id: string
  type: string
  title: string
  body?: string
  created_at: string
  read_at?: string | null
}

function notificationTone(type: string) {
  if (type.includes('payment') || type.includes('overdue')) return 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300'
  if (type.includes('risk') || type.includes('trial')) return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200'
  return 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
}

export default function Header({ isApp = false, user, isDark, onToggleTheme }: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const unreadCount = useMemo(() => notifications.filter((item) => !item.read_at).length, [notifications])

  useEffect(() => {
    if (!isApp || !user) return

    const controller = new AbortController()
    const query = user.id ? `?userId=${encodeURIComponent(user.id)}` : ''
    fetch(`/api/notifications${query}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setNotifications(Array.isArray(data.notifications) ? data.notifications : []))
      .catch(() => setNotifications([]))

    return () => controller.abort()
  }, [isApp, user])

  const markAllRead = async () => {
    setNotifications((items) => items.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() })))
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_all_read', userId: user?.id || null }),
    }).catch(() => undefined)
  }

  const markOneRead = async (id: string) => {
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, read_at: item.read_at || new Date().toISOString() } : item))
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => undefined)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/5 bg-white/[0.78] backdrop-blur-xl dark:border-white/10 dark:bg-neutral-950/[0.76]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-sm font-black text-black shadow-gold">PG</div>
            <div>
              <div className="text-base font-semibold tracking-tight text-neutral-950 dark:text-white">PulseGym</div>
              <div className="hidden text-xs text-neutral-500 dark:text-neutral-400 sm:block">SaaS premium fitness</div>
            </div>
          </Link>
          {isApp && (
            user && ['superadmin', 'owner', 'supervisor', 'executive'].includes(user.role)
              ? <UniversalInput role={user.role} />
              : (
                <div className="hidden min-w-[280px] items-center rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm text-neutral-500 shadow-sm dark:border-white/10 dark:bg-white/5 md:flex">
                  <span className="mr-2 text-neutral-400">Buscar</span>
                  rutinas, progreso, agenda...
                </div>
              )
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleTheme}
            className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition hover:border-accent dark:border-white/10 dark:bg-white/5 dark:text-neutral-200"
            aria-label="Cambiar modo claro u oscuro"
          >
            {isDark ? 'Claro' : 'Oscuro'}
          </button>
          {isApp && (
            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              className="relative rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition hover:border-accent dark:border-white/10 dark:bg-white/5 dark:text-neutral-200"
            >
              Alertas
              {unreadCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-black">
                  {unreadCount}
                </span>
              )}
            </button>
          )}
          <a
            href="https://wa.me/51987088359"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-black shadow-gold transition hover:-translate-y-0.5"
          >
            WhatsApp
          </a>
          {user && (
            <details className="group relative hidden lg:block">
              <summary className="flex cursor-pointer list-none items-center gap-3 rounded-full border border-black/10 bg-white px-2 py-1 dark:border-white/10 dark:bg-white/5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-950 text-xs font-bold text-white dark:bg-white dark:text-neutral-950">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="pr-2">
                  <div className="text-xs font-semibold text-neutral-950 dark:text-white">{user.name}</div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">{roleLabels[user.role]} · {user.gymPlan || 'Global'}</div>
                </div>
              </summary>
              <div className="absolute right-0 mt-3 w-56 rounded-3xl border border-black/10 bg-white p-2 text-sm shadow-soft dark:border-white/10 dark:bg-neutral-950">
                {['Mi perfil', 'Configuracion', 'Centro de ayuda', 'Soporte'].map((item) => (
                  <button
                    key={item}
                    className="block w-full rounded-2xl px-4 py-3 text-left text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-white/10"
                  >
                    {item}
                  </button>
                ))}
                <button
                  onClick={signOut}
                  className="block w-full rounded-2xl px-4 py-3 text-left font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
                >
                  Cerrar sesion
                </button>
              </div>
            </details>
          )}
        </div>
      </div>
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/35 p-4 backdrop-blur-sm" onClick={() => setNotificationsOpen(false)}>
          <aside
            className="ml-auto flex h-full w-full max-w-md flex-col rounded-[28px] border border-black/10 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-neutral-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Centro</div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white">Notificaciones</h2>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{unreadCount} pendientes por revisar.</p>
              </div>
              <button
                type="button"
                onClick={() => setNotificationsOpen(false)}
                className="rounded-full border border-black/10 px-3 py-1 text-sm text-neutral-700 dark:border-white/10 dark:text-neutral-200"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-5 flex gap-2">
              <button type="button" onClick={markAllRead} className="gold-button py-2 text-xs">Marcar todo leido</button>
              <Link href="/notifications" className="neutral-button py-2 text-xs" onClick={() => setNotificationsOpen(false)}>Ver historial</Link>
            </div>

            <div className="mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <div className="rounded-2xl bg-neutral-100 p-5 text-sm text-neutral-500 dark:bg-white/10 dark:text-neutral-300">
                  No hay notificaciones por ahora.
                </div>
              ) : notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => markOneRead(item.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${item.read_at ? 'border-black/5 bg-neutral-50 dark:border-white/10 dark:bg-white/5' : 'border-accent/40 bg-accent/10 dark:border-accent/50 dark:bg-accent/10'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${notificationTone(item.type)}`}>{item.type.replace(/_/g, ' ')}</span>
                    {!item.read_at && <span className="mt-1 h-2 w-2 rounded-full bg-accent" />}
                  </div>
                  <div className="mt-3 text-sm font-semibold text-neutral-950 dark:text-white">{item.title}</div>
                  {item.body && <div className="mt-1 text-sm leading-5 text-neutral-500 dark:text-neutral-400">{item.body}</div>}
                  <div className="mt-3 text-xs text-neutral-400">{new Date(item.created_at).toLocaleString('es-PE')}</div>
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}
    </header>
  )
}
