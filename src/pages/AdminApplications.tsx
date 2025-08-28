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
}

const AdminApplications = () => {
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
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
      // Only fetch applications if we're showing all, otherwise filter server-side
      let query = supabase
        .from('applications')
        .select('*')
        .order('submitted_at', { ascending: false })

      // If we have a specific status filter, apply it server-side for better performance
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setApplications(data || [])
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

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    setFilteredApplications(filtered)
  }

  const handleStatusUpdate = async (applicationId: string, newStatus: 'approved' | 'rejected', applicantName: string, email?: string) => {
    console.log(`Starting status update: ${applicationId} to ${newStatus}`)
    
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: newStatus,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId)

      if (error) {
        console.error('Error updating application status:', error)
        throw error
      }

      console.log(`Application ${applicationId} status updated to ${newStatus}`)

      // Enhanced approval process - create learner profile and send password setup email
      if (newStatus === 'approved' && email) {
        const [firstName, lastName] = applicantName.split(' ')
        
        console.log(`Processing approval for ${firstName} ${lastName} (${email})`)
        
        // Generate secure token for password setup
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 24) // Token expires in 24 hours

        console.log('Generated token for approval:', token)

        // Store password reset token
        const { error: tokenError } = await supabase
          .from('password_reset_tokens')
          .insert({
            email,
            token,
            expires_at: expiresAt.toISOString()
          })

        if (tokenError) {
          console.error('Token creation error during approval:', tokenError)
        } else {
          console.log('Password reset token created for approval')
          
          // Send password setup email
          const { error: emailError } = await supabase.functions.invoke('gmail-send-password-setup', {
            body: { 
              firstName,
              lastName,
              email,
              token
            }
          })

          if (emailError) {
            console.error('Email sending error during approval:', emailError)
          } else {
            console.log('Password setup email sent for approval')
          }
        }
      }

      toast({
        title: `Application ${newStatus}`,
        description: newStatus === 'approved' && email 
          ? `${applicantName}'s application has been approved and a password setup email has been sent to ${email}`
          : `${applicantName}'s application has been ${newStatus}`,
      })

      // Close modal and immediately update the local state to remove the application from view
      setIsModalOpen(false)
      setSelectedApplication(null)
      
      // Remove the updated application from the current list immediately for better UX
      setApplications(prevApps => prevApps.filter(app => app.id !== applicationId))
      
      // Also refresh from server to ensure data consistency
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
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
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
                          onClick={() => handleStatusUpdate(app.id, 'rejected', `${app.first_name} ${app.last_name}`)}
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
        onReject={(applicationId, newStatus, applicantName) => handleStatusUpdate(applicationId, newStatus, applicantName)}
      />
    </div>
  )
}

export default AdminApplications