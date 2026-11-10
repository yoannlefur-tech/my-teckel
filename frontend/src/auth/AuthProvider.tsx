import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import {
  apiFetch,
  clearAccessToken,
  refreshAccessToken,
  setAccessToken,
  setSessionExpiredHandler,
} from '../api/client.ts'
import type { paths } from '../api/schema'
import { AuthContext, type Credentials, type User } from './useAuth.ts'

type LoginResponse =
  paths['/api/auth/login']['post']['responses'][200]['content']['application/json']

async function fetchCurrentUser() {
  const response = await apiFetch('/api/me', {
    headers: { Accept: 'application/ld+json' },
  })
  return response.ok ? ((await response.json()) as User) : null
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  // undefined until the session restoration has finished.
  const [user, setUser] = useState<User | null | undefined>(undefined)

  const endSession = useCallback(() => {
    clearAccessToken()
    queryClient.clear()
    setUser(null)
  }, [queryClient])

  useEffect(() => {
    setSessionExpiredHandler(endSession)
  }, [endSession])

  useEffect(() => {
    let ignore = false
    async function restoreSession() {
      const restored = (await refreshAccessToken())
        ? await fetchCurrentUser().catch(() => null)
        : null
      if (!ignore) {
        setUser(restored)
      }
    }
    restoreSession()
    return () => {
      ignore = true
    }
  }, [])

  async function login(credentials: Credentials) {
    const response = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    if (response.ok) {
      const { token } = (await response.clone().json()) as LoginResponse
      setAccessToken(token)
      setUser(await fetchCurrentUser())
    }
    return response
  }

  async function register(credentials: Credentials) {
    const response = await apiFetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ld+json',
        Accept: 'application/ld+json',
      },
      body: JSON.stringify(credentials),
    })
    // The API does not return a token on registration.
    return response.ok ? login(credentials) : response
  }

  async function logout() {
    await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => null)
    endSession()
  }

  const status =
    user === undefined ? 'loading' : user ? 'authenticated' : 'anonymous'

  return (
    <AuthContext.Provider
      value={{ user: user ?? null, status, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
