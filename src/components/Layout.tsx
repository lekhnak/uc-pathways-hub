import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth")
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-academy-grey-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <p className="text-academy-grey">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-academy-grey-light">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="h-16 bg-white border-b border-academy-grey-light flex items-center px-6 shadow-card">
            <SidebarTrigger className="mr-4 text-academy-blue hover:bg-academy-grey-light" />
            <div className="flex-1 flex items-center gap-3">
              <img 
                src="/lovable-uploads/11121176-120b-4173-8562-293c5b5a5179.png" 
                alt="UC Logo" 
                className="h-8 w-8 object-contain"
              />
              <h1 className="text-xl font-semibold text-academy-blue">UC Investments Academy</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-academy-grey">
                Welcome, {user.user_metadata?.first_name || user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="border-academy-grey text-academy-grey hover:bg-academy-grey-light"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}