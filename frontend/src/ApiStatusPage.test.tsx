import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import ApiStatusPage from './ApiStatusPage.tsx'

test('shows that the API is reachable', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }))
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  render(
    <QueryClientProvider client={client}>
      <ApiStatusPage />
    </QueryClientProvider>,
  )

  expect(await screen.findByText('API joignable')).toBeInTheDocument()
})
