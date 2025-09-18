import React, { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Search, Trash2, Users, AlertTriangle, Mail, UserPlus, CheckCircle } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface UserProfile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  username?: string
  temp_password?: string
  is_temp_password_used?: boolean
  created_at: string
  uc_campus?: string
  major?: string
  gpa?: number
}

interface ApprovedApplication {
  id: string
  first_name: string
  last_name: string
  email: string
  uc_campus?: string
  major?: string
  gpa?: number
  created_at: string
  status: string
}

const AdminUserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [applications, setApplications] = useState<ApprovedApplication[]>([])
  const [filteredApplications, setFilteredApplications] = useState<ApprovedApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState<string | null>(null)
  const [createProfileLoading, setCreateProfileLoading] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterData()
  }, [users, applications, searchTerm])

  const fetchData = async () => {
    try {
      // Fetch all profiles (users who have accounts)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Fetch approved applications that haven't been converted to profiles yet
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (applicationsError) throw applicationsError

      // Filter out applications that already have profiles
      const existingEmails = new Set(profilesData?.map(p => p.email) || [])
      const uniqueApplications = applicationsData?.filter(app => !existingEmails.has(app.email)) || []

      setUsers(profilesData || [])
      setApplications(uniqueApplications)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterData = () => {
    let filteredUsersData = users
    let filteredApplicationsData = applications

    if (searchTerm) {
      filteredUsersData = filteredUsersData.filter(user =>
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.uc_campus && user.uc_campus.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.major && user.major.toLowerCase().includes(searchTerm.toLowerCase()))
      )

      filteredApplicationsData = filteredApplicationsData.filter(app =>
        `${app.first_name} ${app.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.uc_campus && app.uc_campus.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.major && app.major.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredUsers(filteredUsersData)
    setFilteredApplications(filteredApplicationsData)
  }

  const handleResendCredentials = async (user: UserProfile) => {
    setResendLoading(user.id)
    
    try {
      const { error } = await supabase.functions.invoke('resend-user-credentials', {
        body: {
          userId: user.user_id,
          adminToken: 'admin-access-token'
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Credentials Sent",
        description: `Login credentials have been sent to ${user.first_name} ${user.last_name} at ${user.email}`,
      })
    } catch (error: any) {
      console.error('Error resending credentials:', error)
      toast({
        title: "Error",
        description: `Failed to resend credentials: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setResendLoading(null)
    }
  }

  const handleRevokeAccess = async (user: UserProfile) => {
    setDeleteLoading(user.id)
    
    try {
      // First, delete the user's authentication record using admin privileges
      const { error: authError } = await supabase.auth.admin.deleteUser(user.user_id)
      
      if (authError) {
        console.error('Error deleting auth user:', authError)
        // Continue with profile deletion even if auth deletion fails
      }

      // Delete the user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (profileError) {
        console.error('Error deleting profile:', profileError)
        throw profileError
      }

      // Delete any related records
      await Promise.all([
        // Delete TTS account links
        supabase.from('tts_account_links').delete().eq('user_id', user.user_id),
        // Delete TTS progress
        supabase.from('tts_progress').delete().eq('user_id', user.user_id),
        // Delete certification uploads
        supabase.from('certification_uploads').delete().eq('user_id', user.user_id)
      ])

      toast({
        title: "Access Revoked",
        description: `${user.first_name} ${user.last_name}'s membership has been revoked and their account disabled.`,
      })

      // Refresh the data
      fetchData()
    } catch (error: any) {
      console.error('Error revoking access:', error)
      toast({
        title: "Error",
        description: `Failed to revoke access: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleCreateProfile = async (application: ApprovedApplication) => {
    setCreateProfileLoading(application.id)
    
    try {
      const { error } = await supabase.functions.invoke('send-application-approval', {
        body: {
          applicationId: application.id,
          firstName: application.first_name,
          lastName: application.last_name,
          email: application.email,
          adminToken: 'admin-access-token'
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Profile Created",
        description: `User profile and credentials have been sent to ${application.first_name} ${application.last_name}`,
      })

      // Refresh the data
      fetchData()
    } catch (error: any) {
      console.error('Error creating profile:', error)
      toast({
        title: "Error",
        description: `Failed to create profile: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setCreateProfileLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-5 bg-muted rounded w-48 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage approved users and revoke access when needed
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, campus, or major..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Profiles</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length + applications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredUsers.length + filteredApplications.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Active Users ({filteredUsers.length})</TabsTrigger>
          <TabsTrigger value="applications">Pending Profiles ({filteredApplications.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No active users found matching your search criteria' : 'No active users found'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">
                          {user.first_name} {user.last_name}
                        </h3>
                        <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Active User
                        </div>
                      </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                         {user.email && <p><strong>Email:</strong> {user.email}</p>}
                         {user.username && <p><strong>Username:</strong> {user.username}</p>}
                         {user.uc_campus && <p><strong>Campus:</strong> {user.uc_campus}</p>}
                         {user.major && <p><strong>Major:</strong> {user.major}</p>}
                         {user.gpa && <p><strong>GPA:</strong> {user.gpa}</p>}
                         <p><strong>Joined:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                         <p><strong>Status:</strong> {user.is_temp_password_used ? 'Password Changed' : 'Using Temp Password'}</p>
                       </div>
                    </div>
                     <div className="flex flex-col gap-2 min-w-[160px]">
                       {user.username && user.temp_password && (
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => handleResendCredentials(user)}
                           disabled={resendLoading === user.id}
                         >
                           {resendLoading === user.id ? (
                             <>
                               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                               Sending...
                             </>
                           ) : (
                             <>
                               <Mail className="w-4 h-4 mr-2" />
                               Resend Email
                             </>
                           )}
                         </Button>
                       )}
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            disabled={deleteLoading === user.id}
                          >
                            {deleteLoading === user.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Revoking...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Revoke Access
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                              Revoke User Access
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to revoke access for <strong>{user.first_name} {user.last_name}</strong>?
                              <br /><br />
                              This action will:
                              <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Delete their account and profile</li>
                                <li>Remove all their data from the system</li>
                                <li>Disable their login credentials</li>
                                <li><strong>This action cannot be undone</strong></li>
                              </ul>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRevokeAccess(user)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Yes, Revoke Access
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No pending profiles found matching your search criteria' : 'No approved applications waiting for profile creation'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application) => (
              <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">
                          {application.first_name} {application.last_name}
                        </h3>
                        <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Needs Profile
                        </div>
                      </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                         <p><strong>Email:</strong> {application.email}</p>
                         {application.uc_campus && <p><strong>Campus:</strong> {application.uc_campus}</p>}
                         {application.major && <p><strong>Major:</strong> {application.major}</p>}
                         {application.gpa && <p><strong>GPA:</strong> {application.gpa}</p>}
                         <p><strong>Applied:</strong> {new Date(application.created_at).toLocaleDateString()}</p>
                         <p><strong>Status:</strong> {application.status}</p>
                       </div>
                    </div>
                     <div className="flex flex-col gap-2 min-w-[160px]">
                       <Button 
                         variant="default" 
                         size="sm"
                         onClick={() => handleCreateProfile(application)}
                         disabled={createProfileLoading === application.id}
                       >
                         {createProfileLoading === application.id ? (
                           <>
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                             Creating...
                           </>
                         ) : (
                           <>
                             <UserPlus className="w-4 h-4 mr-2" />
                             Create Profile
                           </>
                         )}
                       </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminUserManagement