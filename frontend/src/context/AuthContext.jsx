import { createContext, useContext, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('teclab_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  async function login(email, password) {
    const data = await api.post('/auth/login', { email, password })
    localStorage.setItem('teclab_token', data.token)
    localStorage.setItem('teclab_user',  JSON.stringify(data.user))
    setUser(data.user)
  }

  function logout() {
    localStorage.removeItem('teclab_token')
    localStorage.removeItem('teclab_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}