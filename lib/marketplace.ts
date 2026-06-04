export type Product = {
  id: string
  name: string
  description: string
  category?: string
  basePrice: number
  discountPrice: number
  discountCode: string
  stock: number
  featured: boolean
  imageUrl: string
  active: boolean
  requests?: number
}

export const products: Product[] = [
  {
    id: 'whey-protein-gold',
    name: 'Whey Protein Gold',
    description: 'Proteina para gimnasios que quieren ofrecer un extra premium a sus miembros.',
    category: 'Proteinas',
    basePrice: 189,
    discountPrice: 149,
    discountCode: 'GYM20',
    stock: 18,
    featured: true,
    imageUrl: '/product-protein.svg',
    active: true,
    requests: 42,
  },
  {
    id: 'vitamin-pack',
    name: 'Vitamin Pack Energy',
    description: 'Pack de vitaminas para rutinas intensas y recuperacion diaria.',
    category: 'Vitaminas',
    basePrice: 129,
    discountPrice: 99,
    discountCode: 'VITAMIN20',
    stock: 9,
    featured: true,
    imageUrl: '/product-vitamin.svg',
    active: true,
    requests: 17,
  },
  {
    id: 'protein-cookies',
    name: 'Galletas proteicas',
    description: 'Snack alto en proteina para venta cruzada en recepcion.',
    category: 'Snacks',
    basePrice: 49,
    discountPrice: 35,
    discountCode: 'COOKIE15',
    stock: 0,
    featured: true,
    imageUrl: '/product-cookie.svg',
    active: true,
    requests: 11,
  },
  {
    id: 'training-straps',
    name: 'Straps de entrenamiento',
    description: 'Accesorio para rutinas de fuerza y agarre pesado.',
    category: 'Accesorios',
    basePrice: 69,
    discountPrice: 55,
    discountCode: 'STRAPS10',
    stock: 14,
    featured: false,
    imageUrl: '/product-vitamin.svg',
    active: true,
    requests: 0,
  },
]

export const whatsappProductUrl = (product: Pick<Product, 'name' | 'discountCode'>) => {
  const text = encodeURIComponent(`Hola! Quiero el producto ${product.name} con el codigo de descuento ${product.discountCode}.`)
  return `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_ADMIN_NUMBER || '51987088359'}?text=${text}`
}
