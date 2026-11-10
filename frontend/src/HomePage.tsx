import { Typography } from '@mui/material'
import { useAuth } from './auth/useAuth.ts'

export default function HomePage() {
  const { user } = useAuth()

  return <Typography>{user?.email}</Typography>
}
