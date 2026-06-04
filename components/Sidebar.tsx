import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import type { Role } from '../lib/mockData'
import { getModulePath, getModuleSlug, getModulesForRole, getSubmodulesForRole, roleLabels } from '../lib/pulseData'

type SidebarProps = {
  role: Role
  collapsed: boolean
  activeModule?: string
  activeSubmodule?: string
  onToggle: () => void
  plan?: string
}

const iconPaths: Record<string, React.ReactNode> = {
  dashboard: (
    <>
      <rect x="4" y="4" width="6" height="7" rx="2" />
      <rect x="14" y="4" width="6" height="4" rx="2" />
      <rect x="14" y="12" width="6" height="8" rx="2" />
      <rect x="4" y="15" width="6" height="5" rx="2" />
    </>
  ),
  gyms: (
    <>
      <path d="M4 20V9l8-5 8 5v11" />
      <path d="M9 20v-6h6v6" />
      <path d="M8 10h.01M16 10h.01" />
    </>
  ),
  plans: (
    <>
      <rect x="5" y="4" width="14" height="16" rx="3" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),
  billing: (
    <>
      <path d="M4 7h16v10H4z" />
      <path d="M7 10h3M14 14h3" />
      <path d="M4 9h16" />
    </>
  ),
  verification: (
    <>
      <path d="M12 3l7 4v5c0 4.2-2.8 7.1-7 9-4.2-1.9-7-4.8-7-9V7l7-4z" />
      <path d="M8.8 12.1l2.1 2.1 4.5-4.7" />
    </>
  ),
  strategy: (
    <>
      <path d="M4 18c4-6 8-9 16-12" />
      <path d="M6 6h6v6H6zM13 13h5v5h-5z" />
    </>
  ),
  audit: (
    <>
      <path d="M6 4h12v16H6z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M4.8 4.8l2.1 2.1M17.1 17.1l2.1 2.1M3 12h3M18 12h3M4.8 19.2l2.1-2.1M17.1 6.9l2.1-2.1" />
    </>
  ),
  members: (
    <>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M3.5 20c.7-4 3-6 5.5-6s4.8 2 5.5 6M13.5 15.2c2.4.2 4 1.8 4.8 4.8" />
    </>
  ),
  finance: (
    <>
      <path d="M12 3v18" />
      <path d="M17 7.5c-.8-1.4-2.4-2.2-4.5-2.2-2.5 0-4.4 1.2-4.4 3.2 0 4.4 9.3 2.1 9.3 7 0 2.1-2 3.4-4.8 3.4-2.4 0-4.2-.9-5.2-2.5" />
    </>
  ),
  training: (
    <>
      <path d="M5 12h14" />
      <path d="M3 9v6M21 9v6M7 7v10M17 7v10" />
    </>
  ),
  tracking: (
    <>
      <path d="M4 17l5-5 3 3 7-8" />
      <path d="M4 20h16" />
    </>
  ),
  nutrition: (
    <>
      <path d="M12 21c-3-2.4-5-5.2-5-9.3C7 7 10 4 16 4c1.2 5.4-.9 9.5-5.1 11.6" />
      <path d="M12 21c1-5.8 3.8-9.6 8-12" />
    </>
  ),
  reports: (
    <>
      <path d="M5 19V5" />
      <path d="M9 19v-7M13 19V8M17 19v-4" />
      <path d="M4 19h16" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c1-4 3.4-6 7-6s6 2 7 6" />
    </>
  ),
  attendance: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M8 3v4M16 3v4M4 10h16M8.5 15l2 2 5-5" />
    </>
  ),
  surveys: (
    <>
      <path d="M5 5h14v11H8l-3 3V5z" />
      <path d="M9 9h6M9 13h4" />
    </>
  ),
  store: (
    <>
      <path d="M6 9h12l-1 11H7L6 9z" />
      <path d="M9 9a3 3 0 0 1 6 0" />
      <path d="M9 14h6" />
    </>
  ),
}

function LineIcon({ name, active }: { name: string; active?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`h-5 w-5 ${active ? 'stroke-neutral-950' : 'stroke-current'}`}
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconPaths[name] || iconPaths.dashboard}
    </svg>
  )
}

export default function Sidebar({ role, collapsed, activeModule, activeSubmodule, onToggle, plan = 'Pro' }: SidebarProps) {
  const modules = getModulesForRole(role)
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!activeModule) {
      return
    }

    setExpandedModules((current) => ({
      ...current,
      [activeModule]: current[activeModule] ?? true,
    }))
  }, [activeModule])

  const toggleModule = (moduleSlug: string) => {
    setExpandedModules((current) => ({
      ...current,
      [moduleSlug]: !(current[moduleSlug] ?? false),
    }))
  }

  return (
    <aside className={`${collapsed ? 'w-[72px]' : 'w-[280px]'} relative hidden shrink-0 border-r border-black/5 bg-[#f5f5f7]/85 backdrop-blur-2xl transition-[width] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)] dark:border-white/10 dark:bg-[#1c1c1e]/86 md:block`}>
      <button
        type="button"
        onClick={onToggle}
        className="absolute -right-3 top-5 z-50 flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-white text-[11px] font-semibold text-neutral-700 shadow-sm transition hover:border-[#007AFF] hover:text-[#007AFF] dark:border-white/10 dark:bg-[#2c2c2e] dark:text-neutral-200"
        aria-label={collapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
        title={collapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
      >
        {collapsed ? '>' : '<'}
      </button>

      <nav className="sticky top-[65px] flex h-[calc(100vh-65px)] flex-col overflow-y-auto p-3">
        <div className="flex items-center gap-3 rounded-[20px] px-2 py-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-xs font-semibold text-white shadow-sm dark:bg-white dark:text-neutral-950">
            PG
          </div>
          <div className={`min-w-0 transition duration-200 ${collapsed ? 'pointer-events-none w-0 opacity-0' : 'opacity-100'}`}>
            <div className="truncate text-sm font-semibold tracking-tight text-neutral-950 dark:text-white">PulseGym OS</div>
            <div className="truncate text-xs text-neutral-500 dark:text-neutral-400">{roleLabels[role]}</div>
          </div>
        </div>

        <div className={`mt-4 flex items-center gap-3 rounded-2xl border border-black/5 bg-white/72 px-3 py-3 text-sm text-neutral-500 shadow-sm transition dark:border-white/10 dark:bg-white/5 ${collapsed ? 'justify-center' : ''}`}>
          <LineIcon name="surveys" />
          <span className={`transition duration-200 ${collapsed ? 'hidden opacity-0' : 'opacity-100'}`}>Buscar</span>
        </div>

        <ul className="mt-4 space-y-1.5">
          {modules.map((module) => {
            const moduleSlug = getModuleSlug(module)
            const active = activeModule === module.key || activeModule === moduleSlug
            const submodules = getSubmodulesForRole(module, role)
            const expandable = !collapsed && submodules.length > 1
            const expanded = expandable && (expandedModules[moduleSlug] ?? active)
            const firstPath = getModulePath(module, submodules[0])

            return (
              <li key={module.key}>
                <div
                  className={`group flex items-center gap-2 rounded-2xl px-2 py-2 text-sm font-medium transition duration-200 ${
                    active
                      ? 'bg-white text-neutral-950 shadow-sm dark:bg-white dark:text-neutral-950'
                      : 'text-neutral-600 hover:bg-white/70 hover:text-neutral-950 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white'
                  }`}
                >
                  <Link href={firstPath} className={`flex min-w-0 flex-1 items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${active ? 'bg-accent text-neutral-950' : 'bg-white/70 text-neutral-500 dark:bg-white/8 dark:text-neutral-300'}`}>
                      <LineIcon name={module.icon} active={active} />
                    </span>
                    <span className={`truncate transition duration-200 ${collapsed ? 'hidden opacity-0' : 'opacity-100'}`}>{module.title}</span>
                  </Link>
                  {expandable && (
                    <button
                      type="button"
                      onClick={() => toggleModule(moduleSlug)}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition ${
                        active ? 'bg-neutral-100 text-neutral-700' : 'bg-white/60 text-neutral-500 hover:bg-accent hover:text-black dark:bg-white/8'
                      }`}
                      aria-label={expanded ? `Contraer ${module.title}` : `Desplegar ${module.title}`}
                      aria-expanded={expanded}
                    >
                      {expanded ? '-' : '+'}
                    </button>
                  )}
                </div>

                {expanded && (
                  <div className="ml-7 mt-1.5 space-y-1 border-l border-black/10 pl-3 opacity-100 transition duration-[280ms] dark:border-white/10">
                    {submodules.map((submodule) => {
                      const targetPath = getModulePath(module, submodule)
                      const targetSlug = targetPath.replace(/^\/+|\/+$/g, '')
                      const submoduleActive = active && activeSubmodule === targetSlug

                      return (
                        <Link
                          key={`${module.key}-${submodule}`}
                          href={targetPath}
                          className={`block rounded-xl px-3 py-2 text-xs font-medium transition ${
                            submoduleActive
                              ? 'bg-accent text-black shadow-sm'
                              : 'text-neutral-500 hover:bg-white hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white'
                          }`}
                        >
                          {submodule}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        <div className={`mt-auto rounded-[20px] border border-black/5 bg-white/72 p-3 text-sm text-neutral-600 shadow-sm transition dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? (
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-xs font-semibold text-emerald-700">OK</div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-neutral-950 dark:text-white">{plan}</div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">Activo</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10">
                <div className="h-full w-[84%] rounded-full bg-accent" />
              </div>
              <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Uso miembros 421/500</div>
            </>
          )}
        </div>
      </nav>
    </aside>
  )
}
