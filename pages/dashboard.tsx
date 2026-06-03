import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getSession, signOut } from '../lib/auth'
import KpiCard from '../components/KpiCard'
import { getDashboardMock } from '../lib/mockData'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const s = getSession()
    if (!s) {
      router.replace('/login')
      return
    }
    setUser(s)
    setData(getDashboardMock(s.role))
  }, [])

  if (!user) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Dashboard — {user.role}</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm">{user.name}</div>
          <button onClick={signOut} className="text-sm text-red-600">Cerrar sesión</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.keys(data).map((k) => (
          <KpiCard key={k} title={k} value={data[k]} />
        ))}
      </div>
    </div>
  )
}
