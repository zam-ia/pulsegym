import { isSupabaseConfigured, supabase } from './supabaseClient'
import type { Role } from './mockData'

const allowedRoles: Role[] = ['superadmin', 'owner', 'supervisor', 'executive', 'trainer', 'member']

function normalizeRole(value: unknown): Role {
  return allowedRoles.includes(value as Role) ? value as Role : 'member'
}

export async function authenticate(email: string, password: string) {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false as const, reason: 'supabase_not_configured' as const }
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) {
    return { ok: false as const, reason: 'invalid_credentials' as const }
  }

  let profile: any = null

  const byAuth = await supabase
    .from('profiles')
    .select('id, full_name, email, role, status')
    .eq('auth_id', data.user.id)
    .maybeSingle()

  if (!byAuth.error && byAuth.data) {
    profile = byAuth.data
  } else {
    const byEmail = await supabase
      .from('profiles')
      .select('id, full_name, email, role, status')
      .eq('email', data.user.email || email)
      .maybeSingle()

    if (!byEmail.error && byEmail.data) {
      profile = byEmail.data
    }
  }

  const metadata = data.user.user_metadata || {}
  const profileStatus = profile?.status || metadata.status || 'active'
  if (profileStatus !== 'active') {
    return { ok: false as const, reason: 'user_suspended' as const }
  }

  const role = normalizeRole(profile?.role || metadata.role)
  let gym: any = null

  if (profile?.id && role !== 'superadmin') {
    const gymRole = await supabase
      .from('gym_user_roles')
      .select('gym_id, role, status, gyms(id, name, status, plans(name))')
      .eq('user_id', profile.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()

    if (!gymRole.error && gymRole.data) {
      const row: any = gymRole.data
      gym = Array.isArray(row.gyms) ? row.gyms[0] : row.gyms
      if (gym?.status === 'suspended') {
        return { ok: false as const, reason: 'gym_suspended' as const }
      }
    }
  }

  return {
    ok: true as const,
    user: {
      id: profile?.id || data.user.id,
      authId: data.user.id,
      name: profile?.full_name || metadata.full_name || metadata.name || data.user.email || email,
      email: profile?.email || data.user.email || email,
      role,
      gymId: gym?.id,
      gymName: gym?.name,
      gymPlan: gym?.plans?.name,
    },
  }
}

export function setSession(user: any) {
  if (typeof window === 'undefined') return
  localStorage.setItem('pulsegym_session', JSON.stringify(user))
}

export function getSession() {
  if (typeof window === 'undefined') return null
  const s = localStorage.getItem('pulsegym_session')
  return s ? JSON.parse(s) : null
}

export function signOut() {
  if (typeof window === 'undefined') return
  if (supabase) {
    supabase.auth.signOut()
  }
  localStorage.removeItem('pulsegym_session')
  window.location.href = '/login'
}
