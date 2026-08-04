import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-6 text-sm text-gray-500">Memuat…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default RequireAuth
