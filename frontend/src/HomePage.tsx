import { AppBar, Button, Toolbar, Typography } from '@mui/material'
import { useAuth } from './auth/useAuth.ts'

export default function HomePage() {
  const { user, logout } = useAuth()

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography sx={{ flexGrow: 1 }}>{user?.email}</Typography>
        <Button color="inherit" onClick={logout}>
          Se déconnecter
        </Button>
      </Toolbar>
    </AppBar>
  )
}
