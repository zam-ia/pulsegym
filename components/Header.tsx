import React from 'react'

export default function Header() {
  return (
    <header className="w-full bg-white dark:bg-gray-800 border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center text-black font-bold">PG</div>
          <div className="text-lg font-semibold">PulseGym</div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-md text-sm">Modo</button>
          <a href="https://wa.me/51987088359" target="_blank" rel="noreferrer" className="bg-accent text-black px-3 py-2 rounded-md">WhatsApp</a>
        </div>
      </div>
    </header>
  )
}
