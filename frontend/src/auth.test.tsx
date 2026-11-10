import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest'
import {
  apiFetch,
  clearAccessToken,
  setAccessToken,
  setSessionExpiredHandler,
} from './api/client.ts'

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  clearAccessToken()
  setSessionExpiredHandler(() => {})
})
afterAll(() => server.close())

test('refreshes once on a 401 and replays each request once', async () => {
  let refreshes = 0
  let calls = 0
  server.use(
    http.post('/api/auth/refresh', () => {
      refreshes += 1
      return HttpResponse.json({ token: 'fresh' })
    }),
    http.get('/api/me', ({ request }) => {
      calls += 1
      return request.headers.get('Authorization') === 'Bearer fresh'
        ? HttpResponse.json({ email: 'rex@example.com' })
        : new HttpResponse(null, { status: 401 })
    }),
  )
  setAccessToken('expired')

  const responses = await Promise.all([
    apiFetch('/api/me'),
    apiFetch('/api/me'),
  ])

  expect(responses.map((response) => response.status)).toEqual([200, 200])
  expect(refreshes).toBe(1)
  expect(calls).toBe(4)
})

test('clears the session without looping when the refresh fails', async () => {
  let refreshes = 0
  let calls = 0
  const authorizations: (string | null)[] = []
  server.use(
    http.post('/api/auth/refresh', () => {
      refreshes += 1
      return new HttpResponse(null, { status: 401 })
    }),
    http.get('/api/me', ({ request }) => {
      calls += 1
      authorizations.push(request.headers.get('Authorization'))
      return new HttpResponse(null, { status: 401 })
    }),
  )
  const sessionExpired = vi.fn()
  setSessionExpiredHandler(sessionExpired)
  setAccessToken('expired')

  const response = await apiFetch('/api/me')

  expect(response.status).toBe(401)
  expect(refreshes).toBe(1)
  expect(calls).toBe(1)
  expect(sessionExpired).toHaveBeenCalledOnce()

  await apiFetch('/api/me')
  expect(authorizations[1]).toBeNull()
})
