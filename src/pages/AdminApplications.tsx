import React, { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Search, Filter, Download, Eye, Check, X, Mail, UserX, UserPlus } from 'lucide-react'
import ApplicationModal from '@/components/ApplicationModal'
import RejectionDialog from '@/components/RejectionDialog'

interface Application {
  id: string
  first_name: string
  last_name: string
  email: string
  uc_campus: string
  major: string
  status: string
  submitted_at: string
  gpa: number
  student_type: string
  graduation_year?: number
  linkedin_url?: string
  current_position?: string
  current_employer?: string
  resume_file_path?: string
  transcript_file_path?: string
  consent_form_file_path?: string
  racial_identity?: string
  gender_identity?: string
  sexual_orientation?: string
  first_generation_student?: boolean
  pell_grant_eligible?: boolean
  currently_employed?: boolean
  question_1?: string
  question_2?: string
  question_3?: string
  question_4?: string
  admin_comment?: string
}

const AdminApplications = () => {
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)
  const [applicationToReject, setApplicationToReject] = useState<Application | null>(null)
  const [sendingApproval, setSendingApproval] = useState<string | null>(null)
  const [revokingApproval, setRevokingApproval] = useState<string | null>(null)
  const [fixingProfile, setFixingProfile] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    filterApplications()
  }, [applications, searchTerm, statusFilter])

  useEffect(() => {
    // Refetch applications when status filter changes to apply server-side filtering
    fetchApplications()
  }, [statusFilter])

  const fetchApplications = async () => {
    try {
      console.log('Fetching applications with status filter:', statusFilter)
      
      // Use admin edge function to get applications
      const { data, error } = await supabase.functions.invoke('get-admin-applications', {
        body: { 
          status: statusFilter !== 'all' ? statusFilter : undefined,
          adminToken: 'admin-access-token'
        }
      })

      if (error) {
        console.error('Error fetching applications:', error)
        throw error
      }

      const applications = data?.applications || []
      console.log(`Fetched ${applications.length} applications`)
      setApplications(applications)
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterApplications = () => {
    let filtered = applications

    if (searchTerm) {
      filtered = filtered.filter(app =>
        `${app.first_name} ${app.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.uc_campus.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.major.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Don't filter here if we're using server-side filtering
    setFilteredApplications(filtered)
  }

  const handleStatusUpdate = async (applicationId: string, newStatus: 'approved' | 'rejected', applicantName: string, email?: string, adminComment?: string) => {
    console.log(`Starting status update via edge function: ${applicationId} to ${newStatus}`)
    
    try {
      const { data, error } = await supabase.functions.invoke('update-application-status', {
        body: {
          applicationId,
          newStatus,
          applicantName,
          email,
          adminComment,
          adminToken: 'admin-access-token'
        }
      })

      if (error) {
        console.error('Edge function error:', error)
        throw new Error(error.message)
      }

      console.log('Status update successful:', data)

      // Close modal and update local state
      setIsModalOpen(false)
      setSelectedApplication(null)
      
      // Update local state to reflect the new status
      setApplications(prevApps => 
        prevApps.map(app => 
          app.id === applicationId 
            ? { 
                ...app, 
                status: newStatus, 
                reviewed_at: new Date().toISOString(),
                admin_comment: adminComment || app.admin_comment
              }
            : app
        )
      )
      
      // Refresh from server to ensure data consistency
      await fetchApplications()
      
      toast({
        title: "Application Updated",
        description: `Application has been ${newStatus} successfully.`,
      })

    } catch (error: any) {
      console.error('Error updating application status:', error)
      toast({
        title: "Error", 
        description: `Failed to update application: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application)
    setIsModalOpen(true)
  }

  const handleReject = (application: Application) => {
    setApplicationToReject(application)
    setRejectionDialogOpen(true)
  }

  const confirmRejection = (reason: string) => {
    if (applicationToReject) {
      handleStatusUpdate(
        applicationToReject.id, 
        'rejected', 
        `${applicationToReject.first_name} ${applicationToReject.last_name}`,
        applicationToReject.email,
        reason
      )
      setApplicationToReject(null)
    }
  }

  const handleSendApproval = async (application: Application) => {
    setSendingApproval(application.id)
    
    try {
      // First, get the user's actual credentials from the profile using admin edge function
      console.log('Looking for profile with email:', application.email)
      
      const { data: profileResponse, error: profileFunctionError } = await supabase.functions.invoke('get-user-profile-for-admin', {
        body: {
          email: application.email,
          adminToken: 'admin-access-token'
        }
      })

      console.log('Profile function result:', { profileResponse, profileFunctionError })

      if (profileFunctionError) {
        console.error('Profile function error:', profileFunctionError)
        throw new Error(`Failed to get profile: ${profileFunctionError.message}`)
      }

      if (!profileResponse?.profile) {
        throw new Error('User profile not found. Please use "Fix Profile" to recreate the user account first.')
      }

      const profileData = profileResponse.profile
      
      if (!profileData.username || !profileData.temp_password) {
        console.error('Missing credentials:', profileData)
        throw new Error('User credentials are missing. Please use "Fix Profile" to recreate the user account.')
      }

      console.log('Sending approval email with credentials:', { 
        username: profileData.username, 
        hasPassword: !!profileData.temp_password 
      })

      const { data, error } = await supabase.functions.invoke('send-application-approval', {
        body: {
          firstName: application.first_name,
          lastName: application.last_name,
          email: application.email,
          tempUsername: profileData.username,
          tempPassword: profileData.temp_password
        }
      })

      if (error) {
        console.error('Email function error:', error)
        throw new Error(error.message)
      }

      console.log('Email sent successfully:', data)

      toast({
        title: "Email Sent",
        description: `Approval email sent to ${application.first_name} ${application.last_name}`,
      })

    } catch (error: any) {
      console.error('Error sending approval email:', error)
      toast({
        title: "Error", 
        description: `Failed to send approval email: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setSendingApproval(null)
    }
  }

  const handleFixProfile = async (application: Application) => {
    setFixingProfile(application.id)
    
    try {
      // Re-run the approval process to create the missing profile
      const { data, error } = await supabase.functions.invoke('update-application-status', {
        body: {
          applicationId: application.id,
          newStatus: 'approved',
          applicantName: `${application.first_name} ${application.last_name}`,
          email: application.email,
          adminToken: 'admin-access-token'
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      toast({
        title: "Profile Fixed",
        description: `User profile created for ${application.first_name} ${application.last_name}`,
      })

      // Refresh data
      await fetchApplications()

    } catch (error: any) {
      console.error('Error fixing profile:', error)
      toast({
        title: "Error", 
        description: `Failed to fix profile: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setFixingProfile(null)
    }
  }

  const handleRevokeApproval = async (application: Application) => {
    setRevokingApproval(application.id)
    
    try {
      // First, get the user_id from the profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', application.email)
        .single()

      if (profileError || !profileData) {
        console.log('Profile not found, updating application status only')
      }

      // Delete user profile from database if it exists
      if (profileData?.user_id) {
        const { error: deleteProfileError } = await supabase
          .from('profiles')
          .delete()
          .eq('user_id', profileData.user_id)

        if (deleteProfileError) {
          console.error('Error deleting profile:', deleteProfileError)
        }

        // Also delete the Supabase auth user
        const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(profileData.user_id)
        
        if (deleteAuthError) {
          console.error('Error deleting auth user:', deleteAuthError)
        }
      }

      // Update application status back to pending
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status: 'pending', reviewed_at: null })
        .eq('id', application.id)

      if (updateError) {
        throw new Error(updateError.message)
      }

      // Update local state
      setApplications(prevApps => 
        prevApps.map(app => 
          app.id === application.id 
            ? { ...app, status: 'pending', reviewed_at: null }
            : app
        )
      )

      // Refresh data
      await fetchApplications()

      toast({
        title: "Access Revoked",
        description: `Access revoked for ${application.first_name} ${application.last_name}`,
      })

    } catch (error: any) {
      console.error('Error revoking approval:', error)
      toast({
        title: "Error", 
        description: `Failed to revoke access: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setRevokingApproval(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-5 bg-muted rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-48 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
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
        <h1 className="text-3xl font-bold tracking-tight">Applications Management</h1>
        <p className="text-muted-foreground">
          Review and manage student applications
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending Applications</SelectItem>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No applications found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((app) => (
            <Card key={app.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{app.first_name} {app.last_name}</h3>
                      <Badge className={getStatusColor(app.status)}>
                        {app.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <p><strong>Email:</strong> {app.email}</p>
                      <p><strong>Campus:</strong> {app.uc_campus}</p>
                      <p><strong>Major:</strong> {app.major}</p>
                      <p><strong>GPA:</strong> {app.gpa}</p>
                      <p><strong>Type:</strong> {app.student_type}</p>
                      <p><strong>Submitted:</strong> {new Date(app.submitted_at).toLocaleDateString()}</p>
                    </div>
                    {app.linkedin_url && (
                      <p className="text-sm">
                        <strong>LinkedIn:</strong> 
                        <a href={app.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                          View Profile
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewDetails(app)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                    {app.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleStatusUpdate(app.id, 'approved', `${app.first_name} ${app.last_name}`, app.email)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleReject(app)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {app.status === 'approved' && (
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSendApproval(app)}
                            disabled={sendingApproval === app.id}
                          >
                            <Mail className="w-4 h-4 mr-1" />
                            {sendingApproval === app.id ? 'Sending...' : 'Send Approval'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleRevokeApproval(app)}
                            disabled={revokingApproval === app.id}
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            {revokingApproval === app.id ? 'Revoking...' : 'Revoke Access'}
                          </Button>
                        </div>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleFixProfile(app)}
                          disabled={fixingProfile === app.id}
                          className="w-full"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          {fixingProfile === app.id ? 'Fixing...' : 'Fix Profile'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Application Details Modal */}
      <ApplicationModal
        application={selectedApplication}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedApplication(null)
        }}
        onApprove={(applicationId, newStatus, applicantName, email) => handleStatusUpdate(applicationId, newStatus, applicantName, email)}
        onReject={(app) => handleReject(app)}
      />

      {/* Rejection Dialog */}
      <RejectionDialog
        isOpen={rejectionDialogOpen}
        onClose={() => {
          setRejectionDialogOpen(false)
          setApplicationToReject(null)
        }}
        onConfirm={confirmRejection}
        applicantName={applicationToReject ? `${applicationToReject.first_name} ${applicationToReject.last_name}` : ''}
      />
    </div>
  )
}

export default AdminApplications