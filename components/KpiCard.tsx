import React from 'react'

export default function KpiCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="kpi-card">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-2">{value}</div>
    </div>
  )
}
