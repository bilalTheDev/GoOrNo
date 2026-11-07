import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore.js'

export default function FounderRoute({ children }) {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  if (status !== 'authenticated') return <Navigate to="/login" replace />
  if (!user?.roles?.includes('founder')) return <Navigate to="/account" replace />
  return children
}
