import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  Briefcase, 
  Calendar, 
  Upload, 
  User, 
  Users, 
  MessageCircle,
  TrendingUp,
  Building,
  DollarSign,
  Home
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Learning Modules", url: "/modules", icon: BookOpen },
  { title: "Career Pathways", url: "/pathways", icon: TrendingUp },
  { title: "Certifications", url: "/certifications", icon: Award },
  { title: "Internships", url: "/internships", icon: Briefcase },
]

const communityItems = [
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Resume Drop", url: "/resume-drop", icon: Upload },
  { title: "Mentorship", url: "/mentorship", icon: Users },
  { title: "Chat with Fellows", url: "/chat", icon: MessageCircle },
]

const profileItems = [
  { title: "My Profile", url: "/profile", icon: User },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-academy-blue text-white font-medium" : "text-academy-grey hover:bg-academy-grey-light hover:text-academy-blue"

  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarContent className="bg-white border-r border-academy-grey-light">
        {/* Academy Header */}
        <div className="p-6 border-b border-academy-grey-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-academy-grey-light">
              <img 
                src="/lovable-uploads/11121176-120b-4173-8562-293c5b5a5179.png" 
                alt="UC Logo" 
                className="h-8 w-8 object-contain"
              />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-academy-blue text-sm">UC Investments</h2>
                <p className="text-xs text-academy-grey">Academy</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-academy-grey font-semibold px-3 py-2">
            Learning
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink 
                    to={item.url} 
                    end 
                    className={({ isActive }) => 
                      `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full ${
                        isActive 
                          ? "bg-academy-blue text-white font-medium" 
                          : "text-academy-grey hover:bg-academy-grey-light hover:text-academy-blue"
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Community Features */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-academy-grey font-semibold px-3 py-2">
            Community
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {communityItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink 
                    to={item.url} 
                    className={({ isActive }) => 
                      `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full ${
                        isActive 
                          ? "bg-academy-blue text-white font-medium" 
                          : "text-academy-grey hover:bg-academy-grey-light hover:text-academy-blue"
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Profile */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-academy-grey font-semibold px-3 py-2">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {profileItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink 
                    to={item.url} 
                    className={({ isActive }) => 
                      `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full ${
                        isActive 
                          ? "bg-academy-blue text-white font-medium" 
                          : "text-academy-grey hover:bg-academy-grey-light hover:text-academy-blue"
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}