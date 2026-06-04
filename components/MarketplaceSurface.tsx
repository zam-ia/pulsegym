import React, { useEffect, useMemo, useState } from 'react'
import type { Product } from '../lib/marketplace'
import { products as fallbackProducts, whatsappProductUrl } from '../lib/marketplace'
import { ActionPanel, IntentPanel } from './IDBI'

const categories = ['Todas', 'Suplementos', 'Proteinas', 'Vitaminas', 'Accesorios', 'Snacks']
const statusFilters = ['Todos', 'Activos', 'Inactivos']
const featuredFilters = ['Todos', 'En oferta', 'No destacados']
const stockFilters = ['Todos', 'Con stock', 'Agotados']

type Draft = Product
type ModalState = { mode: 'create' | 'edit' | 'duplicate' | 'preview'; product: Draft } | null
type KpiTone = 'good' | 'warning' | 'danger' | 'neutral'

const blankProduct: Draft = {
  id: '',
  name: '',
  description: '',
  category: '',
  basePrice: 0,
  discountPrice: 0,
  discountCode: '',
  stock: 0,
  featured: false,
  imageUrl: '',
  active: true,
  requests: 0,
}

function badgeClass(tone: KpiTone) {
  return {
    good: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200',
    danger: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300',
    neutral: 'bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-neutral-300',
  }[tone]
}

function ProductPreviewCard({ product, disabled = false }: { product: Product; disabled?: boolean }) {
  return (
    <div className="rounded-[22px] border border-black/5 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-neutral-950/70">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[18px] bg-neutral-100 dark:bg-white/10">
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <span className="text-xs text-neutral-400">Sin imagen</span>}
        {product.featured && <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-bold text-black">En oferta</span>}
        {product.stock === 0 && <span className="absolute right-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">Agotado</span>}
      </div>
      <div className="mt-4 truncate text-lg font-semibold">{product.name || 'Producto sin nombre'}</div>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-sm text-neutral-400 line-through">S/ {product.basePrice || '0.00'}</span>
        <span className="text-2xl font-semibold text-emerald-600 dark:text-emerald-300">S/ {product.discountPrice || '0.00'}</span>
      </div>
      <div className="mt-2 inline-flex rounded-full bg-neutral-100 px-3 py-1 font-mono text-xs font-semibold text-neutral-600 dark:bg-white/10 dark:text-neutral-300">{product.discountCode || 'CODIGO'}</div>
      <a
        href={disabled || product.stock === 0 ? undefined : whatsappProductUrl(product)}
        target="_blank"
        rel="noreferrer"
        className={`mt-4 flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-semibold ${disabled || product.stock === 0 ? 'bg-neutral-100 text-neutral-400 dark:bg-white/10' : 'bg-accent text-black shadow-gold'}`}
      >
        {product.stock === 0 ? 'Agotado' : 'Solicitar'}
      </a>
    </div>
  )
}

function ProductForm({ draft, setDraft, onSave, onDelete, codeError }: {
  draft: Draft
  setDraft: (next: Draft) => void
  onSave: () => void
  onDelete?: () => void
  codeError?: string
}) {
  const priceError = Number(draft.discountPrice) > Number(draft.basePrice)

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
      <div className="space-y-4">
        <label className="block text-sm font-medium">Nombre del producto<input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5" placeholder="Ej. Whey Protein 2lb" /></label>
        <label className="block text-sm font-medium">Descripcion<textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={3} className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5" /></label>
        <label className="block text-sm font-medium">Categoria<select value={draft.category || ''} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-neutral-950">{categories.filter((item) => item !== 'Todas').map((item) => <option key={item}>{item}</option>)}</select></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium">Precio base<input type="number" value={draft.basePrice} onChange={(e) => setDraft({ ...draft, basePrice: Number(e.target.value) })} className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5" /></label>
          <label className="block text-sm font-medium">Precio descuento<input type="number" value={draft.discountPrice} onChange={(e) => setDraft({ ...draft, discountPrice: Number(e.target.value) })} className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5" /></label>
        </div>
        {priceError && <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-300">El precio con descuento no puede ser mayor al precio base.</div>}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium">Codigo descuento<input value={draft.discountCode} onChange={(e) => setDraft({ ...draft, discountCode: e.target.value.toUpperCase().replace(/\s+/g, '') })} className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 font-mono outline-none dark:border-white/10 dark:bg-white/5" placeholder="PROTEINA20" /></label>
          <label className="block text-sm font-medium">Stock<input type="number" min={0} value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })} className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5" /></label>
        </div>
        {codeError && <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-300">{codeError}</div>}
        <label className="block text-sm font-medium">Imagen del producto<input value={draft.imageUrl} onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })} className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5" placeholder="/product-protein.svg o URL publica" /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center justify-between rounded-2xl bg-neutral-100 p-4 text-sm font-semibold dark:bg-white/10">Activo<input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} className="h-5 w-5 accent-[#007AFF]" /></label>
          <label className="flex items-center justify-between rounded-2xl bg-neutral-100 p-4 text-sm font-semibold dark:bg-white/10">Destacar en ofertas<input type="checkbox" checked={draft.featured} onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} className="h-5 w-5 accent-[#007AFF]" /></label>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={onSave} disabled={priceError} className="rounded-full bg-[#007AFF] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Guardar</button>
          {onDelete && <button onClick={onDelete} className="rounded-full border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 dark:border-red-500/20 dark:text-red-300">Eliminar producto</button>}
        </div>
      </div>
      <div>
        <div className="mb-3 text-sm font-semibold">Vista previa</div>
        <ProductPreviewCard product={draft} disabled />
      </div>
    </div>
  )
}

export default function MarketplaceSurface() {
  const [items, setItems] = useState<Product[]>(fallbackProducts)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todas')
  const [status, setStatus] = useState('Activos')
  const [featured, setFeatured] = useState('Todos')
  const [stock, setStock] = useState('Todos')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<ModalState>(null)
  const [codeError, setCodeError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams({ search: query, category, status, featured, stock })
    fetch(`/api/admin/marketplace?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data.products) ? data.products : fallbackProducts))
      .catch(() => setItems(fallbackProducts))
  }, [category, featured, query, status, stock])

  const kpis = useMemo<Array<[string, number, string, KpiTone]>>(() => [
    ['Productos activos', items.filter((item) => item.active).length, 'checkmark.circle', 'good' as const],
    ['Productos en oferta', items.filter((item) => item.featured).length, 'star.fill', 'warning' as const],
    ['Productos agotados', items.filter((item) => item.stock === 0).length, 'xmark.circle', 'danger' as const],
    ['Solicitudes totales', items.reduce((sum, item) => sum + Number(item.requests || 0), 0), 'message.fill', 'neutral' as const],
  ], [items])

  const paginated = items.slice((page - 1) * 12, page * 12)
  const totalPages = Math.max(Math.ceil(items.length / 12), 1)

  const openCreate = () => setModal({ mode: 'create', product: { ...blankProduct, id: `product-${Date.now()}`, imageUrl: '/product-protein.svg' } })
  const openEdit = (product: Product) => setModal({ mode: 'edit', product: { ...product } })
  const openDuplicate = (product: Product) => setModal({ mode: 'duplicate', product: { ...product, id: `product-${Date.now()}`, name: `(copia) ${product.name}`, discountCode: '' } })
  const openPreview = (product: Product) => setModal({ mode: 'preview', product })

  const saveProduct = async () => {
    if (!modal) return
    setCodeError('')
    const draft = modal.product
    const check = await fetch(`/api/admin/marketplace/check-code?code=${encodeURIComponent(draft.discountCode)}&exclude_id=${modal.mode === 'edit' ? draft.id : ''}`).then((res) => res.json()).catch(() => ({ available: true }))
    if (!check.available) {
      setCodeError('Este codigo ya esta en uso')
      return
    }

    const method = modal.mode === 'edit' ? 'PUT' : 'POST'
    const url = modal.mode === 'edit' ? `/api/admin/marketplace/${draft.id}` : '/api/admin/marketplace'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) }).catch(() => undefined)
    setItems((current) => {
      if (modal.mode === 'edit') return current.map((item) => item.id === draft.id ? draft : item)
      return [draft, ...current]
    })
    setModal(null)
  }

  const deleteProduct = async () => {
    if (!modal) return
    await fetch(`/api/admin/marketplace/${modal.product.id}`, { method: 'DELETE' }).catch(() => undefined)
    setItems((current) => current.filter((item) => item.id !== modal.product.id))
    setModal(null)
  }

  const toggleActive = (product: Product) => {
    const next = { ...product, active: !product.active }
    setItems((current) => current.map((item) => item.id === product.id ? next : item))
    fetch(`/api/admin/marketplace/${product.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }).catch(() => undefined)
  }

  return (
    <div className="space-y-6">
      <IntentPanel title="Marketplace" description="Catalogo simple para controlar ofertas visibles en login, landing y paneles." generated>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="text-sm text-neutral-500 dark:text-neutral-400">Gestiona productos destacados sin submodulos ni paginas de detalle.</div>
          <button onClick={openCreate} className="rounded-full bg-[#007AFF] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(0,122,255,0.22)]">Nuevo producto</button>
        </div>
      </IntentPanel>

      <section className="grid gap-4 md:grid-cols-4">
        {kpis.map(([label, value, icon, tone]) => (
          <div key={String(label)} className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(tone)}`}>{icon}</span>
              <span className="text-2xl font-semibold">{value}</span>
            </div>
            <div className="mt-3 text-sm font-semibold text-neutral-600 dark:text-neutral-300">{label}</div>
          </div>
        ))}
      </section>

      <section className="rounded-[24px] border border-black/5 bg-white/84 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="grid gap-3 lg:grid-cols-[1fr_190px]">
          <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="Buscar producto..." className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-neutral-950" />
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }} className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-neutral-950">{categories.map((item) => <option key={item}>{item}</option>)}</select>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[statusFilters, featuredFilters, stockFilters].map((group, index) => group.map((item) => {
            const current = index === 0 ? status : index === 1 ? featured : stock
            const setter = index === 0 ? setStatus : index === 1 ? setFeatured : setStock
            return <button key={`${index}-${item}`} onClick={() => { setter(item); setPage(1) }} className={`rounded-full px-3 py-2 text-xs font-semibold ${current === item ? 'bg-accent text-black' : 'bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-neutral-300'}`}>{item}</button>
          }))}
        </div>
      </section>

      {items.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-black/10 bg-white/70 p-10 text-center dark:border-white/10 dark:bg-white/5">
          <div className="text-4xl font-semibold">Bag</div>
          <div className="mt-3 text-xl font-semibold">Aun no has creado ningun producto.</div>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Crea el primero para que aparezca en las ofertas.</p>
          <button onClick={openCreate} className="mt-5 gold-button">Nuevo producto</button>
        </div>
      ) : paginated.length === 0 ? (
        <div className="rounded-[28px] bg-white/80 p-10 text-center text-sm text-neutral-500 dark:bg-white/5">No se encontraron productos. Intenta con otros filtros.</div>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {paginated.map((product) => (
            <article key={product.id} onClick={() => openEdit(product)} className="group cursor-pointer rounded-[24px] border border-black/5 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-accent dark:border-white/10 dark:bg-white/5">
              <ProductPreviewCard product={product} disabled />
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className={`text-sm font-semibold ${product.stock === 0 ? 'text-red-500' : 'text-neutral-500 dark:text-neutral-400'}`}>{product.stock === 0 ? 'Agotado' : `Stock: ${product.stock} unidades`}</div>
                <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
                  <button onClick={() => openEdit(product)} className="rounded-full bg-neutral-100 px-3 py-2 text-xs font-semibold dark:bg-white/10">Editar</button>
                  <button onClick={() => openDuplicate(product)} className="rounded-full bg-neutral-100 px-3 py-2 text-xs font-semibold dark:bg-white/10">Duplicar</button>
                  <button onClick={() => openPreview(product)} className="rounded-full bg-neutral-100 px-3 py-2 text-xs font-semibold dark:bg-white/10">Vista</button>
                  <button onClick={() => toggleActive(product)} className="rounded-full bg-neutral-100 px-3 py-2 text-xs font-semibold dark:bg-white/10">{product.active ? 'Desactivar' : 'Activar'}</button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <div className="flex items-center justify-between gap-3">
        <button disabled={page <= 1} onClick={() => setPage((value) => Math.max(value - 1, 1))} className="neutral-button py-2 disabled:opacity-50">Anterior</button>
        <div className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Pagina {page} de {totalPages}</div>
        <button disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(value + 1, totalPages))} className="neutral-button py-2 disabled:opacity-50">Siguiente</button>
      </div>

      <ActionPanel open={!!modal} title={modal?.mode === 'preview' ? 'Vista previa' : modal?.mode === 'edit' ? 'Editar producto' : 'Nuevo producto'} onClose={() => setModal(null)}>
        {modal?.mode === 'preview' ? (
          <div className="mx-auto max-w-sm"><ProductPreviewCard product={modal.product} /></div>
        ) : modal ? (
          <ProductForm draft={modal.product} setDraft={(product) => setModal({ ...modal, product })} onSave={saveProduct} onDelete={modal.mode === 'edit' ? deleteProduct : undefined} codeError={codeError} />
        ) : null}
      </ActionPanel>
    </div>
  )
}
