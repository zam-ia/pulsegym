import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { users } from './mockData'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = !!(url && key)

export let supabase: SupabaseClient | null = null

if (isSupabaseConfigured) {
  supabase = createClient(url as string, key as string)
}

// When Supabase isn't configured, use mock functions from mockData.
export async function loginFallback(email: string, password: string) {
  const u = users.find((x) => x.email === email && x.password === password)
  if (!u) return null
  return { user: { id: u.id, email: u.email, name: u.name, role: u.role, gymId: u.gymId } }
}
