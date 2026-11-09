import { Alert, CircularProgress, Container } from '@mui/material'
import { useQuery } from '@tanstack/react-query'

async function fetchApiStatus() {
  const response = await fetch('/api', {
    headers: { Accept: 'application/ld+json' },
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return response.status
}

export default function ApiStatusPage() {
  const { isPending, isError } = useQuery({
    queryKey: ['api-status'],
    queryFn: fetchApiStatus,
    retry: false,
  })

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      {isPending && <CircularProgress />}
      {isError && <Alert severity="error">Erreur : API injoignable</Alert>}
      {!isPending && !isError && (
        <Alert severity="success">API joignable</Alert>
      )}
    </Container>
  )
}
