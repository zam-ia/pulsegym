import React from 'react'
import type { StatusTone } from '../lib/pulseData'

const toneClasses: Record<StatusTone, string> = {
  good: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-300',
  warning: 'text-amber-700 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-200',
  danger: 'text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-300',
  neutral: 'text-neutral-600 bg-neutral-100 dark:bg-white/10 dark:text-neutral-300',
}

export default function KpiCard({
  title,
  value,
  trend,
  tone = 'neutral',
}: {
  title: string
  value: string | number
  trend?: string
  tone?: StatusTone
}) {
  return (
    <div className="kpi-card group">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 dark:text-white">{value}</div>
        </div>
        <div className="h-10 w-10 rounded-2xl border border-black/5 bg-accent/15 dark:border-white/10" />
      </div>
      {trend && <div className={`mt-5 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>{trend}</div>}
    </div>
  )
}
