import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import type { Product } from '../lib/marketplace'
import { products as fallbackProducts, whatsappProductUrl } from '../lib/marketplace'

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/82 p-5 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[22px] bg-[#f5f5f7] dark:bg-white/10">
        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        {product.featured && <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-bold text-black">En oferta</span>}
        {product.stock === 0 && <span className="absolute right-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">Agotado</span>}
      </div>
      <div className="mt-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{product.name}</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{product.description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-bold text-black">{product.discountCode}</span>
      </div>
      <div className="mt-5 flex items-end gap-3">
        <span className="text-sm text-neutral-400 line-through">S/ {product.basePrice}</span>
        <span className="text-3xl font-semibold text-emerald-600 dark:text-emerald-300">S/ {product.discountPrice}</span>
      </div>
      <div className={`mt-3 text-sm font-semibold ${product.stock === 0 ? 'text-red-500' : 'text-neutral-500 dark:text-neutral-400'}`}>
        {product.stock === 0 ? 'Agotado' : `Stock: ${product.stock} unidades`}
      </div>
      <a href={product.stock === 0 ? undefined : whatsappProductUrl(product)} target="_blank" rel="noreferrer" className={`mt-5 w-full ${product.stock === 0 ? 'neutral-button pointer-events-none opacity-60' : 'gold-button'}`}>
        {product.stock === 0 ? 'No disponible' : 'Solicitar con descuento'}
      </a>
    </div>
  )
}

export default function Productos() {
  const [items, setItems] = useState<Product[]>(fallbackProducts)

  useEffect(() => {
    fetch('/api/products?active=true&featured=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.products)) {
          setItems(data.products)
        }
      })
      .catch(() => undefined)
  }, [])

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 py-8 text-neutral-950 dark:bg-neutral-950 dark:text-white">
      <div className="mx-auto max-w-6xl">
        <nav className="flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold">PulseGym</Link>
          <div className="flex gap-2">
            <Link href="/signup?plan=pro" className="neutral-button py-2">Activar gimnasio</Link>
            <Link href="/login" className="gold-button py-2">Entrar</Link>
          </div>
        </nav>

        <section className="py-14">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Ofertas PulseGym</div>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight md:text-7xl">Productos con descuento para gimnasios.</h1>
            <p className="mt-5 text-lg leading-8 text-neutral-600 dark:text-neutral-300">
              Suplementos, snacks y productos fitness para venta cruzada. Los codigos son una forma simple de pedirlos por WhatsApp y cerrar manualmente.
            </p>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      </div>
    </main>
  )
}
