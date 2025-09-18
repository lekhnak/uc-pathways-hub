import React, { createContext, useContext, useEffect, useState } from 'react'

interface CustomUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

interface AuthContextType {
  user: CustomUser | null
  session: any | null
  loading: boolean
  signOut: () => Promise<void>
  setUser: (user: CustomUser | null) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  setUser: () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null)
  const [session, setSession] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in via localStorage instead of Supabase auth
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setUser(user)
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const signOut = async () => {
    // Clear localStorage instead of Supabase auth
    localStorage.removeItem('user')
    setUser(null)
    setSession(null)
  }

  const value = {
    user,
    session,
    loading,
    signOut,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}