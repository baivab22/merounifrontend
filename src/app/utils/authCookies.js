// The backend issues the auth cookie on the shared `.merouni.com` domain in
// production, while the sign-in page also writes a host-only copy for the
// current host. Clearing only one of those leaves the other behind, which means
// a "logged out" browser can still be authenticated by the backend (and keep
// receiving member-only files). Always remove every variant we might have set.
export function clearAuthCookie() {
  if (typeof document === 'undefined') return

  const expired = 'expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

  // Host-only cookie written by the sign-in page.
  document.cookie = `token=; ${expired}`
  document.cookie = `token=; ${expired} SameSite=Lax`

  const hostname = window.location.hostname
  if (hostname === 'merouni.com' || hostname.endsWith('.merouni.com')) {
    // Shared cookie set by the backend on login/refresh.
    document.cookie = `token=; ${expired} domain=.merouni.com; SameSite=Lax`
    document.cookie = `token=; ${expired} domain=merouni.com; SameSite=Lax`
  }
}
