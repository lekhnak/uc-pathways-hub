import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface AdminUser {
  id: string
  username: string
  email?: string
  full_name?: string
}

interface AdminAuthContextType {
  adminUser: AdminUser | null
  loading: boolean
  signIn: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  adminUser: null,
  loading: true,
  signIn: async () => ({ success: false }),
  signOut: () => {},
})

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminSession()
  }, [])

  const checkAdminSession = () => {
    const storedAdmin = localStorage.getItem('admin_user')
    if (storedAdmin) {
      try {
        const parsedAdmin = JSON.parse(storedAdmin)
        setAdminUser(parsedAdmin)
      } catch (error) {
        localStorage.removeItem('admin_user')
      }
    }
    setLoading(false)
  }

  const signIn = async (username: string, password: string) => {
    try {
      // For demo purposes, we'll check against a simple credential
      // In production, you'd want to implement proper password hashing verification
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .single()

      if (error || !data) {
        return { success: false, error: 'Invalid credentials' }
      }

      // Simple password check for demo (in production, use proper hashing)
      if (password === 'admin123') {
        const adminUserData = {
          id: data.id,
          username: data.username,
          email: data.email,
          full_name: data.full_name
        }
        
        setAdminUser(adminUserData)
        localStorage.setItem('admin_user', JSON.stringify(adminUserData))
        return { success: true }
      } else {
        return { success: false, error: 'Invalid credentials' }
      }
    } catch (error) {
      return { success: false, error: 'Authentication failed' }
    }
  }

  const signOut = () => {
    setAdminUser(null)
    localStorage.removeItem('admin_user')
  }

  const value = {
    adminUser,
    loading,
    signIn,
    signOut,
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}