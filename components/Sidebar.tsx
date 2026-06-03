import Link from 'next/link'
import React from 'react'

export default function Sidebar() {
  return (
    <aside className="w-64 hidden md:block bg-white dark:bg-gray-800 border-r">
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <Link href="/">
              <a className="text-sm font-medium">Landing</a>
            </Link>
          </li>
          <li>
            <Link href="/dashboard">
              <a className="text-sm font-medium">Dashboard</a>
            </Link>
          </li>
          <li>
            <Link href="/login">
              <a className="text-sm font-medium">Login</a>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  )
}
