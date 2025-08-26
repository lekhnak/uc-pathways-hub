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
    isActive ? "bg-academy-blue text-white font-medium" : "hover:bg-academy-grey-light text-academy-grey hover:text-academy-blue"

  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarContent className="bg-white border-r border-academy-grey-light">
        {/* Academy Header */}
        <div className="p-6 border-b border-academy-grey-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-academy-blue">UC Investment</h2>
                <p className="text-sm text-academy-grey">Academy</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-academy-grey font-semibold">
            Learning
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                  <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Community Features */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-academy-grey font-semibold">
            Community
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communityItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Profile */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-academy-grey font-semibold">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {profileItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}