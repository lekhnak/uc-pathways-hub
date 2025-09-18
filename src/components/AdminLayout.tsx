import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/AdminSidebar'
import { Button } from '@/components/ui/button'
import { LogOut, Settings } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const AdminLayout = () => {
  const { adminUser, loading, signOut } = useAdminAuth()
  const { toast } = useToast()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!adminUser) {
    return <Navigate to="/admin/auth" replace />
  }

  const handleSignOut = () => {
    signOut()
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    })
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {adminUser.full_name || adminUser.username}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default AdminLayout