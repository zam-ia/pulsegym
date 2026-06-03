export type Role = 'superadmin' | 'owner' | 'trainer' | 'member'

export type User = {
  id: string
  name: string
  email: string
  password: string
  role: Role
  gymId?: string
}

export const gyms = [
  { id: 'g1', name: 'Pulse Gym Lima', slug: 'pulse-lima', status: 'active' },
]

export const users: User[] = [
  { id: '1', name: 'Super Admin', email: 'admin@pulsegym.test', password: 'password', role: 'superadmin' },
  { id: '2', name: 'Owner Gym1', email: 'owner@gym1.test', password: 'password', role: 'owner', gymId: 'g1' },
  { id: '3', name: 'Trainer One', email: 'trainer@gym1.test', password: 'password', role: 'trainer', gymId: 'g1' },
  { id: '4', name: 'Member One', email: 'member1@gym1.test', password: 'password', role: 'member', gymId: 'g1' }
]

export async function authenticate(email: string, password: string) {
  const u = users.find((x) => x.email === email && x.password === password)
  if (!u) return null
  return { user: { id: u.id, name: u.name, email: u.email, role: u.role, gymId: u.gymId } }
}

export function getDashboardMock(role: Role) {
  if (role === 'superadmin') {
    return {
      gyms: 12,
      users: 345,
      mrr: '$1,234',
    }
  }
  if (role === 'owner') {
    return {
      membersActive: 124,
      membersAtRisk: 8,
      revenueMonth: '$2,340',
    }
  }
  if (role === 'trainer') {
    return {
      assignedMembers: 38,
      sessionsThisWeek: 12,
    }
  }
  return {
    progress: 'Good',
    nextSession: '2026-06-05 18:00',
  }
}
