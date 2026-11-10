import { Box, CircularProgress } from '@mui/material'
import { Route, Routes } from 'react-router-dom'
import ApiStatusPage from './ApiStatusPage.tsx'
import LoginPage from './auth/LoginPage.tsx'
import RegisterPage from './auth/RegisterPage.tsx'
import { useAuth } from './auth/useAuth.ts'

export default function App() {
  const { status } = useAuth()

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<ApiStatusPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  )
}
