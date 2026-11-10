import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter } from 'react-router-dom'
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest'
import {
  apiFetch,
  clearAccessToken,
  setAccessToken,
  setSessionExpiredHandler,
} from './api/client.ts'
import App from './App.tsx'
import AuthProvider from './auth/AuthProvider.tsx'

const server = setupServer()
const noSession = http.post('/api/auth/refresh', () =>
  new HttpResponse(null, { status: 401 }),
)

function renderApp(path: string, client = new QueryClient()) {
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

async function submitForm(buttonName: string) {
  fireEvent.change(await screen.findByLabelText('Email'), {
    target: { value: 'rex@example.com' },
  })
  fireEvent.change(screen.getByLabelText('Mot de passe'), {
    target: { value: 'long-enough-password' },
  })
  fireEvent.click(screen.getByRole('button', { name: buttonName }))
}

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

test('shows the login error matching the API status', async () => {
  const statuses = [401, 429]
  server.use(
    noSession,
    http.post('/api/auth/login', () =>
      new HttpResponse(null, { status: statuses.shift() }),
    ),
  )
  renderApp('/login')

  await submitForm('Se connecter')
  expect(await screen.findByText('Identifiants invalides')).toBeInTheDocument()

  await submitForm('Se connecter')
  expect(
    await screen.findByText('Trop de tentatives, réessayez plus tard'),
  ).toBeInTheDocument()
})

test('shows a registration violation in French under its field', async () => {
  server.use(
    noSession,
    http.post('/api/auth/register', () =>
      HttpResponse.json(
        {
          violations: [
            {
              propertyPath: 'email',
              message: 'This value is already used.',
              code: '23bd9dbf-6b9b-41cd-a99e-4844bcf3077f',
            },
          ],
        },
        { status: 422 },
      ),
    ),
  )
  renderApp('/register')

  await submitForm('Créer mon compte')

  await screen.findByText('Cet email est déjà utilisé.')
  expect(screen.getByLabelText('Email')).toHaveAccessibleDescription(
    'Cet email est déjà utilisé.',
  )
})
