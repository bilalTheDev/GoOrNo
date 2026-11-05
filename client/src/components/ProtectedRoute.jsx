import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore.js'

export default function ProtectedRoute({ children }) {
  const status = useAuthStore((state) => state.status)
  if (status !== 'authenticated') return <Navigate to="/login" replace />
  return children
}
