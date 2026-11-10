import type { paths } from './schema'

type TokenResponse =
  paths['/api/auth/refresh']['post']['responses'][200]['content']['application/json']

let accessToken: string | null = null
let sessionVersion = 0
let refreshing: Promise<boolean> | null = null
let onSessionExpired = () => {}

export function setAccessToken(token: string) {
  accessToken = token
}

export function clearAccessToken() {
  accessToken = null
  sessionVersion += 1
}

export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler
}

async function requestAccessToken() {
  const startedDuring = sessionVersion
  try {
    const response = await fetch('/api/auth/refresh', { method: 'POST' })
    if (!response.ok) {
      return false
    }
    const { token } = (await response.json()) as TokenResponse
    // A logout during the request must not bring the token back.
    if (startedDuring !== sessionVersion) {
      return false
    }
    accessToken = token
    return true
  } catch {
    return false
  }
}

export function refreshAccessToken() {
  refreshing ??= requestAccessToken().finally(() => {
    refreshing = null
  })
  return refreshing
}

function send(path: string, init: RequestInit) {
  const headers = new Headers(init.headers)
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return fetch(path, { ...init, headers })
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const response = await send(path, init)
  if (response.status !== 401 || path.startsWith('/api/auth/')) {
    return response
  }
  if (await refreshAccessToken()) {
    return send(path, init)
  }
  clearAccessToken()
  onSessionExpired()
  return response
}
