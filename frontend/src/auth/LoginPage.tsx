import { Alert, Button, Container, Link, Stack, TextField } from '@mui/material'
import { useForm } from 'react-hook-form'
import { Navigate, Link as RouterLink } from 'react-router-dom'
import { useAuth, type Credentials } from './useAuth.ts'

const REQUIRED = 'Ce champ est requis.'
const ERROR_MESSAGES: Record<number, string> = {
  401: 'Identifiants invalides',
  429: 'Trop de tentatives, réessayez plus tard',
}

export default function LoginPage() {
  const { status, login } = useAuth()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Credentials>()

  if (status === 'authenticated') {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (values: Credentials) => {
    const response = await login(values).catch(() => null)
    if (!response?.ok) {
      setError('root', {
        message:
          ERROR_MESSAGES[response?.status ?? 0] ??
          'Une erreur est survenue, réessayez plus tard',
      })
    }
  }

  const { ref: emailRef, ...email } = register('email', { required: REQUIRED })
  const { ref: passwordRef, ...password } = register('password', {
    required: REQUIRED,
  })

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Stack component="form" spacing={2} noValidate onSubmit={handleSubmit(onSubmit)}>
        {errors.root && <Alert severity="error">{errors.root.message}</Alert>}
        <TextField
          {...email}
          inputRef={emailRef}
          label="Email"
          type="email"
          autoComplete="email"
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
        />
        <TextField
          {...password}
          inputRef={passwordRef}
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
        />
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          Se connecter
        </Button>
        <Link component={RouterLink} to="/register">
          Créer un compte
        </Link>
      </Stack>
    </Container>
  )
}
