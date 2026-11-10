import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth.ts'

export default function ProtectedRoute() {
  const { status } = useAuth()
  const { pathname, search, hash } = useLocation()

  if (status !== 'authenticated') {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: pathname + search + hash }}
      />
    )
  }

  return <Outlet />
}
