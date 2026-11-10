import { Container, Link, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Page introuvable
      </Typography>
      <Link component={RouterLink} to="/">
        Retour à l'accueil
      </Link>
    </Container>
  )
}
