import React, { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Search, Filter, Download, Eye, Check, X } from 'lucide-react'
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
    console.log(`Starting status update: ${applicationId} to ${newStatus}`)
    
    try {
      if (newStatus === 'rejected') {
        // For rejected applications, update status and add comment
        const { error: updateError } = await supabase
          .from('applications')
          .update({ 
            status: newStatus,
            reviewed_at: new Date().toISOString(),
            admin_comment: adminComment || 'No reason provided'
          })
          .eq('id', applicationId)

        if (updateError) {
          console.error('Error updating rejected application:', updateError)
          throw updateError
        }

        console.log(`Application ${applicationId} status updated to ${newStatus}`)

        // Get the full application data to send rejection email
        const { data: applicationData, error: fetchError } = await supabase
          .from('applications')
          .select('*')
          .eq('id', applicationId)
          .single()

        if (fetchError) {
          console.error('Error fetching application data:', fetchError)
        } else {
          // Send rejection email
          const { error: emailError } = await supabase.functions.invoke('gmail-send-application-denial', {
            body: {
              firstName: applicationData.first_name,
              lastName: applicationData.last_name,
              email: applicationData.email,
              reason: adminComment || 'No specific reason provided'
            }
          })

          if (emailError) {
            console.error('Email sending error:', emailError)
          }
        }
        
        toast({
          title: "Application Rejected",
          description: `${applicantName}'s application has been rejected and moved to rejected status.`,
        })
      } else {
        // For approved applications, update status and create profile
        const { error: updateError } = await supabase
          .from('applications')
          .update({ 
            status: newStatus,
            reviewed_at: new Date().toISOString()
          })
          .eq('id', applicationId)

        if (updateError) {
          console.error('Error updating application status:', updateError)
          throw updateError
        }

        console.log(`Application ${applicationId} status updated to ${newStatus}`)

        // Get the full application data to create profile
        const { data: applicationData, error: fetchError } = await supabase
          .from('applications')
          .select('*')
          .eq('id', applicationId)
          .single()

        if (fetchError) {
          console.error('Error fetching application data:', fetchError)
          throw fetchError
        }

        // Generate temporary password
        const tempPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

        // Create user account
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: applicationData.email,
          password: tempPassword,
          options: {
            data: {
              first_name: applicationData.first_name,
              last_name: applicationData.last_name
            }
          }
        })

        if (authError && !authError.message?.includes('User already registered')) {
          console.error('User creation error:', authError)
          throw authError
        }

        const userId = authData.user?.id
        if (!userId) {
          throw new Error('Failed to get user ID from created account')
        }

        // Create profile with all application data
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            first_name: applicationData.first_name,
            last_name: applicationData.last_name,
            email: applicationData.email,
            uc_campus: applicationData.uc_campus,
            major: applicationData.major,
            gpa: applicationData.gpa,
            graduation_year: applicationData.graduation_year,
            linkedin_url: applicationData.linkedin_url,
            temp_password: tempPassword,
            is_temp_password_used: false,
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          throw profileError
        }

        console.log('Profile created successfully for approved application')

        // Send approval email with login credentials
        const { error: emailError } = await supabase.functions.invoke('gmail-send-application-approval', {
          body: {
            firstName: applicationData.first_name,
            lastName: applicationData.last_name,
            email: applicationData.email,
            tempUsername: applicationData.email,
            tempPassword: tempPassword,
            program: 'UC Investment Academy'
          }
        })

        if (emailError) {
          console.error('Email sending error:', emailError)
        }

        toast({
          title: "Application Approved",
          description: `${applicantName}'s application has been approved, profile created, and login credentials sent to ${email}`,
        })
      }

      // Close modal and immediately update the local state
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
      fetchApplications()
    } catch (error: any) {
      console.error('Error updating application:', error)
      toast({
        title: "Error",
        description: `Failed to update application: ${error.message || 'Unknown error'}`,
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