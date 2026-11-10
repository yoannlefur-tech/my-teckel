import { createContext, useContext } from 'react'
import type { components, paths } from '../api/schema'

export type User = components['schemas']['User.jsonld-user.read']
export type Credentials =
  paths['/api/auth/login']['post']['requestBody']['content']['application/json']

type Auth = {
  user: User | null
  status: 'loading' | 'authenticated' | 'anonymous'
  login: (credentials: Credentials) => Promise<Response>
  register: (credentials: Credentials) => Promise<Response>
  logout: () => Promise<void>
}

export const AuthContext = createContext<Auth | null>(null)

export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return auth
}
