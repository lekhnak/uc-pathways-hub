import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-academy-grey-light">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="h-16 bg-white border-b border-academy-grey-light flex items-center px-6 shadow-card">
            <SidebarTrigger className="mr-4 text-academy-blue hover:bg-academy-grey-light" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-academy-blue">UC Investment Academy</h1>
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