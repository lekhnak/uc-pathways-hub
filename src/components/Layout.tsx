import React, { useEffect, useState } from "react"
import { useNavigate, NavLink, Outlet } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LogOut, Lightbulb, Users, X } from "lucide-react"

export default function Layout() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false)

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
                src="/lovable-uploads/0702558c-2214-400e-b6df-770525aa1194.png" 
                alt="UC Investments Academy Logo" 
                className="h-8 w-8 object-contain"
              />
              <h1 
                className="text-xl font-semibold text-academy-blue cursor-pointer hover:text-academy-blue-dark transition-colors"
                onClick={() => setIsInfoDialogOpen(true)}
              >
                UC Investments Academy
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-academy-grey">
                  Welcome, {user.firstName || user.email}
                </span>
                <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-academy-grey hover:bg-academy-grey-light hover:text-academy-blue"
                    >
                      <Lightbulb className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-white">
                    <DialogHeader>
                      <DialogTitle className="text-2xl text-academy-blue mb-4">
                        Welcome to UC Investments Academy!
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-academy-blue mb-3">
                          Learn more about us!
                        </h3>
                        <p className="text-academy-grey leading-relaxed mb-4">
                          UC Investments Academy is a program by UC Investments to help students explore a possible career in finance. This program is completely free to students and includes the very same training that recent college graduates starting their careers at investment firms have undergone before embarking on successful careers managing money for others.
                        </p>
                        <p className="text-academy-grey leading-relaxed">
                          UC Investments (The Office of the Chief Investment Officer of the Regents) manages a portfolio of investments totaling approximately $190 billion, which includes retirement, endowment, and cash assets.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button 
                          className="flex-1 bg-academy-blue hover:bg-academy-blue-dark"
                          asChild
                        >
                          <NavLink to="/chat">
                            <Users className="mr-2 h-4 w-4" />
                            Chat with UCOP Professionals
                          </NavLink>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 border-academy-grey text-academy-grey hover:bg-academy-grey-light"
                          onClick={() => setIsInfoDialogOpen(false)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Close Popup
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
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
            <Outlet />
            
            {/* Footer with Admin Access */}
            <div className="text-center text-sm text-muted-foreground border-t pt-4 mt-8">
              <p>&copy; 2024 UC Investment Academy. All rights reserved.</p>
              <a 
                href="/admin/auth" 
                className="inline-block mt-2 text-xs hover:text-primary transition-colors"
              >
                Admin Access
              </a>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}