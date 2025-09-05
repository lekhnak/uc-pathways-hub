import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  GraduationCap,
  Award,
  Briefcase,
  Calendar,
  FileText,
  MessageSquare,
  UserCog,
  Settings,
  Shield,
} from 'lucide-react'

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Applications',
    url: '/admin/applications',
    icon: Users,
  },
  {
    title: 'User Management',
    url: '/admin/user-management',
    icon: UserCog,
  },
  {
    title: 'Admin Management',
    url: '/admin/admin-management',
    icon: Shield,
  },
  {
    title: 'Create Learner',
    url: '/admin/create-learner',
    icon: UserPlus,
  },
  {
    title: 'Career Pathways',
    url: '/admin/pathways',
    icon: GraduationCap,
  },
  {
    title: 'Certifications',
    url: '/admin/certifications',
    icon: Award,
  },
  {
    title: 'Internships',
    url: '/admin/internships',
    icon: Briefcase,
  },
  {
    title: 'Calendar Events',
    url: '/admin/calendar',
    icon: Calendar,
  },
  {
    title: 'Resume Review',
    url: '/admin/resumes',
    icon: FileText,
  },
  {
    title: 'Student Chat',
    url: '/admin/chat',
    icon: MessageSquare,
  },
  {
    title: 'Profile',
    url: '/admin/profile',
    icon: Settings,
  },
]

export const AdminSidebar = () => {
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => {
    if (path === '/admin') {
      return currentPath === '/admin'
    }
    return currentPath.startsWith(path)
  }

  return (
    <Sidebar className="w-64 border-r border-border">
      <SidebarContent className="p-4">
        <div className="mb-6 p-4 text-center">
          <h2 className="text-lg font-bold text-primary">UC Investment Academy</h2>
          <p className="text-sm text-muted-foreground">Admin Panel</p>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
                      className={({ isActive: navIsActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                          navIsActive || isActive(item.url)
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
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