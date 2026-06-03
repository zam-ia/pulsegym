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
  localStorage.removeItem('pulsegym_session')
  window.location.href = '/login'
}
