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
      // Call the secure admin authentication edge function
      const { data, error } = await supabase.functions.invoke('admin-login', {
        body: { username, password }
      })

      if (error) {
        console.error('Authentication error:', error)
        return { success: false, error: 'Authentication failed' }
      }

      if (data?.success && data?.adminUser) {
        const adminUserData = {
          id: data.adminUser.id,
          username: data.adminUser.username,
          email: data.adminUser.email,
          full_name: data.adminUser.full_name
        }
        
        setAdminUser(adminUserData)
        localStorage.setItem('admin_user', JSON.stringify(adminUserData))
        return { success: true }
      } else {
        return { success: false, error: data?.error || 'Invalid credentials' }
      }
    } catch (error) {
      console.error('Signin error:', error)
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