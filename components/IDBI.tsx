import React from 'react'

export function GhostPanel({ title = 'Preparando panel' }: { title?: string }) {
  return (
    <div className="ghost-panel rounded-[28px] border border-black/5 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="h-4 w-36 rounded-full bg-neutral-200 dark:bg-white/10" />
      <div className="mt-4 h-8 w-64 rounded-full bg-neutral-200 dark:bg-white/10" />
      <div className="mt-6 grid gap-3">
        <div className="h-24 rounded-2xl bg-neutral-200 dark:bg-white/10" />
        <div className="h-16 rounded-2xl bg-neutral-200 dark:bg-white/10" />
        <div className="h-16 rounded-2xl bg-neutral-200 dark:bg-white/10" />
      </div>
      <div className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">{title}</div>
    </div>
  )
}

export function ActionPanel({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/35 p-4 backdrop-blur-sm" onClick={onClose}>
      <aside
        className="ml-auto flex h-full w-full max-w-xl animate-slide-in flex-col rounded-[28px] border border-black/10 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-neutral-950"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Accion inmediata</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
          </div>
          <button onClick={onClose} className="rounded-full border border-black/10 px-3 py-1 text-sm dark:border-white/10">
            Cerrar
          </button>
        </div>
        <div className="mt-6 min-h-0 flex-1 overflow-y-auto">{children}</div>
      </aside>
    </div>
  )
}

export function IntentPanel({
  title,
  description,
  children,
  generated = false,
}: {
  title: string
  description?: string
  children: React.ReactNode
  generated?: boolean
}) {
  return (
    <section className={`rounded-[28px] border bg-white/84 p-5 shadow-sm backdrop-blur-xl dark:bg-white/5 ${generated ? 'glow-border ai-surface border-blue-400/30' : 'border-black/5 dark:border-white/10'}`}>
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Panel</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
          {description && <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>}
        </div>
        {generated && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">IDBI</span>}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}
