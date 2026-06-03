import Link from 'next/link'
import React from 'react'

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto py-20 px-4">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl font-extrabold mb-4">Controla tu gimnasio con PulseGym</h1>
          <p className="text-gray-600 mb-6">Gestiona miembros, pagos y rutinas desde un panel premium diseñado para gimnasios.</p>
          <div className="flex gap-3">
            <Link href="/login"><a className="bg-accent text-black px-4 py-2 rounded-md">Iniciar sesión</a></Link>
            <a href="https://wa.me/51987088359" className="px-4 py-2 border rounded-md">Solicitar demo</a>
          </div>
        </div>
        <div className="bg-gray-100 rounded-lg p-6">
          <div className="h-64 flex items-center justify-center text-gray-400">Mockup del dashboard</div>
        </div>
      </section>
    </div>
  )
}
