import { Alert, Button, Container, Link, Stack, TextField } from '@mui/material'
import { useForm } from 'react-hook-form'
import { Navigate, Link as RouterLink } from 'react-router-dom'
import type { components } from '../api/schema'
import { useAuth, type Credentials } from './useAuth.ts'

type ValidationError = components['schemas']['ConstraintViolation.jsonld']

const REQUIRED = 'Ce champ est requis.'
const INVALID = 'Valeur invalide.'
// The API answers in English: its stable constraint codes carry the meaning.
const VIOLATION_MESSAGES: Record<string, string> = {
  'c1051bb4-d103-4f74-8988-acbcafc7fdc3': REQUIRED,
  'bd79c0ab-ddba-46cc-a703-a7a4b08de310': 'Adresse email invalide.',
  '23bd9dbf-6b9b-41cd-a99e-4844bcf3077f': 'Cet email est déjà utilisé.',
  '9ff3fdc4-b214-49db-8718-39c315e33d45':
    'Le mot de passe doit contenir au moins 10 caractères.',
  'd94b19cc-114f-4f44-9cc4-4138e80a87b9': 'Cette valeur est trop longue.',
}

export default function RegisterPage() {
  const auth = useAuth()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Credentials>()

  if (auth.status === 'authenticated') {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (values: Credentials) => {
    const response = await auth.register(values).catch(() => null)
    if (response?.status === 422) {
      const { violations = [] } = (await response.json()) as ValidationError
      for (const { propertyPath, code } of violations) {
        setError(propertyPath as keyof Credentials, {
          message: VIOLATION_MESSAGES[code ?? ''] ?? INVALID,
        })
      }
    } else if (!response?.ok) {
      setError('root', {
        message: 'Une erreur est survenue, réessayez plus tard',
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
          autoComplete="new-password"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
        />
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          Créer mon compte
        </Button>
        <Link component={RouterLink} to="/login">
          J'ai déjà un compte
        </Link>
      </Stack>
    </Container>
  )
}
