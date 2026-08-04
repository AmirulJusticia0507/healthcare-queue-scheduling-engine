import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginApi, fetchMe } from '../services/authService'
import { getToken, setToken, clearToken } from '../lib/auth'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const check = async () => {
      if (getToken()) {
        try {
          const me = await fetchMe()
          if (active) setUser(me.user || me)
        } catch {
          clearToken()
          if (active) setUser(null)
        }
      } else if (active) {
        setUser(null)
      }
      if (active) setLoading(false)
    }
    check()

    const onLogout = () => {
      setUser(null)
      setLoading(false)
    }
    window.addEventListener('auth:logout', onLogout)
    return () => {
      active = false
      window.removeEventListener('auth:logout', onLogout)
    }
  }, [])

  const login = async (email, password) => {
    const data = await loginApi(email, password)
    setToken(data.token)
    setUser(data.user)
    navigate('/', { replace: true })
  }

  const logout = () => {
    clearToken()
    setUser(null)
    navigate('/login', { replace: true })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
