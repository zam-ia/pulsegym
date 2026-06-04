import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import type { Role } from '../lib/mockData'

type Suggestion = {
  label: string
  action: string
  route: string
  tone?: string
}

const defaults: Record<string, Suggestion[]> = {
  superadmin: [
    { label: 'Buscar gimnasio', action: 'open_panel', route: '/admin/gyms' },
    { label: 'Ver ingresos mensuales', action: 'open_panel', route: '/admin/billing' },
    { label: 'Nuevo plan', action: 'open_action', route: '/admin/plans' },
    { label: 'Verificar pagos pendientes', action: 'open_panel', route: '/admin/verifications' },
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

export default function UniversalInput({ role }: { role: Role }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const baseSuggestions = useMemo(() => defaults[role] || defaults.owner, [role])

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setLoading(true)
      fetch('/api/search/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, role }),
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data) => setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : baseSuggestions))
        .catch(() => setSuggestions(baseSuggestions))
        .finally(() => setLoading(false))
    }, 300)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [baseSuggestions, query, role])

  const selectSuggestion = (suggestion: Suggestion) => {
    setQuery('')
    setSuggestions([])
    window.dispatchEvent(new CustomEvent('pulsegym:intent-panel', { detail: suggestion }))
    router.push(suggestion.route)
  }

  return (
    <div className="relative hidden w-full max-w-[600px] lg:block">
      <div className="flex items-center rounded-full border border-black/10 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-2xl transition focus-within:border-blue-500/40 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-white/10 dark:bg-white/5">
        <span className="mr-3 h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_18px_rgba(59,130,246,0.7)]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && suggestions[0]) selectSuggestion(suggestions[0])
          }}
          placeholder="Pregunta, busca o ejecuta una accion..."
          className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white"
        />
        <button type="button" className="rounded-full px-2 py-1 text-xs font-semibold text-neutral-400">Voz</button>
      </div>
      {(suggestions.length > 0 || loading) && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 flex flex-wrap gap-2 rounded-[22px] border border-black/5 bg-white/92 p-3 shadow-soft backdrop-blur-2xl dark:border-white/10 dark:bg-neutral-950/92">
          {loading && <span className="ghost-panel rounded-full bg-neutral-100 px-3 py-1.5 text-xs text-neutral-400 dark:bg-white/10">Interpretando...</span>}
          {suggestions.map((suggestion) => (
            <button
              key={`${suggestion.label}-${suggestion.route}`}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectSuggestion(suggestion)}
              className="rounded-full border border-black/5 bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-blue-500/40 hover:bg-blue-50 dark:border-white/10 dark:bg-white/10 dark:text-neutral-200 dark:hover:bg-blue-500/10"
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
