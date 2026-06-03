import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { authenticate } from '../lib/mockData'
import { setSession } from '../lib/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await authenticate(email, password)
    if (!res) {
      setError('Credenciales inválidas (prueba con admin@pulsegym.test / password)')
      return
    }
    setSession(res.user)
    // redirect by role
    const role = res.user.role
    if (role === 'superadmin') router.push('/dashboard')
    else if (role === 'owner') router.push('/dashboard')
    else if (role === 'trainer') router.push('/dashboard')
    else router.push('/dashboard')
  }

  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-white rounded-md shadow">
      <h2 className="text-xl font-semibold mb-4">Iniciar sesión</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="text-sm">Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div>
          <button className="bg-accent text-black px-4 py-2 rounded">Entrar</button>
        </div>
      </form>
      <div className="text-xs text-gray-500 mt-4">Usuarios de prueba: admin@pulsegym.test / password</div>
    </div>
  )
}
