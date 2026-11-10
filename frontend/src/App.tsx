import { Box, CircularProgress } from '@mui/material'
import { Route, Routes } from 'react-router-dom'
import ApiStatusPage from './ApiStatusPage.tsx'
import LoginPage from './auth/LoginPage.tsx'
import ProtectedRoute from './auth/ProtectedRoute.tsx'
import RegisterPage from './auth/RegisterPage.tsx'
import { useAuth } from './auth/useAuth.ts'
import HomePage from './HomePage.tsx'
import NotFoundPage from './NotFoundPage.tsx'

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
      <Route path="/status" element={<ApiStatusPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
