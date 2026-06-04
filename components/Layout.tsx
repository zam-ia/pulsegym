import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import { getSession } from '../lib/auth'
import { getModuleByPath, getModuleSlug } from '../lib/pulseData'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter()
  const isPublic = router.pathname === '/' || router.pathname === '/login' || router.pathname === '/signup' || router.pathname === '/productos' || router.pathname === '/agendar'
  const activePath = router.asPath.split('?')[0].replace(/^\/+|\/+$/g, '')
  const activeDefinition = getModuleByPath(activePath)
  const activeModule = activeDefinition ? getModuleSlug(activeDefinition) : activePath
  const activeSubmodule = activePath
  const [collapsed, setCollapsed] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const savedTheme = localStorage.getItem('pulsegym_theme')
    const nextDark = savedTheme === 'dark'
    setIsDark(nextDark)
    document.documentElement.classList.toggle('dark', nextDark)
    setUser(getSession())
  }, [router.pathname])

  const toggleTheme = () => {
    const nextDark = !isDark
    setIsDark(nextDark)
    localStorage.setItem('pulsegym_theme', nextDark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', nextDark)
  }

  return (
    <div className="min-h-screen bg-app text-neutral-950 dark:bg-neutral-950 dark:text-white">
      <Header isApp={!isPublic} user={user} isDark={isDark} onToggleTheme={toggleTheme} />
      {isPublic ? (
        <main>{children}</main>
      ) : (
        <div className="flex">
          {user && (
            <Sidebar
              role={user.role}
              collapsed={collapsed}
              activeModule={activeModule}
              activeSubmodule={activeSubmodule}
              onToggle={() => setCollapsed((value) => !value)}
              plan={user.gymPlan || 'Global'}
            />
          )}
          <main className="min-w-0 flex-1 p-4 md:p-6 xl:p-8">{children}</main>
          <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
            <a
              href="https://wa.me/51987088359"
              target="_blank"
              rel="noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-950 text-xs font-bold text-white shadow-soft transition hover:-translate-y-0.5 dark:bg-white dark:text-neutral-950"
              aria-label="WhatsApp"
            >
              WA
            </a>
            <button className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-xl font-semibold text-black shadow-gold" aria-label="Crear nuevo">
              +
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Layout
