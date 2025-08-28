import React, { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Users,
  UserCheck,
  GraduationCap,
  Award,
  Briefcase,
  Calendar,
  TrendingUp,
  Clock,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react'
import { useCalendarEvents } from '@/hooks/useCalendarEvents'
import { NavLink } from "react-router-dom"
import { format } from 'date-fns'

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
}

interface EventFormData {
  title: string
  description: string
  event_date: string
  event_time: string
  location: string
  signup_url: string
  speakers: string
  event_type: string
  status: string
}

const CalendarEventsManagement = () => {
  const { events, loading, createEvent, updateEvent, deleteEvent } = useCalendarEvents()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    signup_url: '',
    speakers: '',
    event_type: 'general',
    status: 'upcoming'
  })

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_date: '',
      event_time: '',
      location: '',
      signup_url: '',
      speakers: '',
      event_type: 'general',
      status: 'upcoming'
    })
    setEditingEvent(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const eventData = {
        ...formData,
        speakers: formData.speakers ? formData.speakers.split(',').map(s => s.trim()) : null
      }

      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData)
        toast({
          title: "Event Updated",
          description: "The event has been successfully updated.",
        })
      } else {
        await createEvent(eventData)
        toast({
          title: "Event Created",
          description: "The event has been successfully created.",
        })
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save event",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (event: any) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date,
      event_time: event.event_time || '',
      location: event.location || '',
      signup_url: event.signup_url || '',
      speakers: event.speakers ? event.speakers.join(', ') : '',
      event_type: event.event_type,
      status: event.status
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(eventId)
        toast({
          title: "Event Deleted",
          description: "The event has been successfully deleted.",
        })
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete event",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Calendar Events Management</CardTitle>
            <CardDescription>Create and manage events for students</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="event_type">Event Type</Label>
                    <Select
                      value={formData.event_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="masterclass">Masterclass</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="webinar">Webinar</SelectItem>
                        <SelectItem value="networking">Networking</SelectItem>
                        <SelectItem value="teach-in">Teach-In</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event_date">Event Date</Label>
                    <Input
                      id="event_date"
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="event_time">Event Time</Label>
                    <Input
                      id="event_time"
                      type="time"
                      value={formData.event_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, event_time: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Virtual, New York, NY, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="open">Open for Registration</SelectItem>
                        <SelectItem value="filling-fast">Filling Fast</SelectItem>
                        <SelectItem value="full">Full</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="speakers">Speakers (comma-separated)</Label>
                  <Input
                    id="speakers"
                    value={formData.speakers}
                    onChange={(e) => setFormData(prev => ({ ...prev, speakers: e.target.value }))}
                    placeholder="John Doe - VP at XYZ Corp, Jane Smith - Director at ABC Inc"
                  />
                </div>

                <div>
                  <Label htmlFor="signup_url">Registration URL</Label>
                  <Input
                    id="signup_url"
                    type="url"
                    value={formData.signup_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, signup_url: e.target.value }))}
                    placeholder="https://example.com/register"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-48"></div>
                  <div className="h-3 bg-muted rounded w-32"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-16 bg-muted rounded"></div>
                  <div className="h-8 w-16 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No events created yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{event.title}</h4>
                    <Badge variant="secondary">{event.event_type}</Badge>
                    <Badge variant={event.status === 'upcoming' ? 'default' : 'outline'}>
                      {event.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.event_date), 'PPP')}
                    {event.event_time && ` at ${format(new Date(`2000-01-01T${event.event_time}`), 'p')}`}
                  </p>
                  {event.location && (
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(event)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const AdminDashboard = () => {
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchApplications()
    fetchStats()
    
    // Set up real-time subscription for applications table
    const channel = supabase
      .channel('applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications'
        },
        () => {
          console.log('Applications table changed, refreshing data...')
          fetchApplications()
          fetchStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchApplications = async () => {
    try {
      console.log('Fetching pending applications...')
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('status', 'pending') // Only show pending applications
        .order('submitted_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching applications:', error)
        throw error
      }
      
      console.log('Fetched pending applications:', data)
      setApplications(data || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive",
      })
    }
  }

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('status')

      if (error) {
        console.error('Error fetching application stats:', error)
        throw error
      }

      console.log('Raw application data for stats:', data)

      const statusCounts = data.reduce((acc: any, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1
        return acc
      }, {})

      console.log('Status counts:', statusCounts)

      const newStats = {
        totalApplications: data.length,
        pendingApplications: statusCounts.pending || 0,
        approvedApplications: statusCounts.approved || 0,
        rejectedApplications: statusCounts.rejected || 0,
      }

      console.log('Setting new stats:', newStats)
      setStats(newStats)
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast({
        title: "Error",
        description: "Failed to fetch dashboard statistics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveApplication = async (applicationId: string, email: string, firstName: string, lastName: string) => {
    try {
      console.log(`Starting approval process for ${firstName} ${lastName} (${email})`)
      
      // First, update application status
      const { error: updateError } = await supabase
        .from('applications')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId)

      if (updateError) {
        console.error('Error updating application status:', updateError)
        throw updateError
      }

      console.log('Application status updated to approved')

      // Send approval email using the Gmail function
      const { error: emailError } = await supabase.functions.invoke('gmail-send-application-approval', {
        body: { 
          firstName,
          lastName,
          email,
          tempUsername: email, // Use email as username for now
          tempPassword: Math.random().toString(36).substring(2, 15), // Generate temp password
          program: 'UC Investment Academy'
        }
      })

      if (emailError) {
        console.error('Email sending error:', emailError)
        toast({
          title: "Application Approved",
          description: `${firstName}'s application has been approved, but approval email failed to send. Please check email service configuration.`,
          variant: "destructive",
        })
      } else {
        console.log('Approval email sent successfully')
        toast({
          title: "Application Approved",
          description: `${firstName}'s application has been approved and an approval email has been sent to ${email}`,
          duration: 5000,
        })
      }

      // Data will be refreshed automatically by the real-time subscription
    } catch (error: any) {
      console.error('Error approving application:', error)
      toast({
        title: "Error",
        description: `Failed to approve application: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      })
    }
  }

  const handleDenyApplication = async (applicationId: string, email: string, firstName: string, lastName: string) => {
    try {
      console.log(`Starting denial process for ${firstName} ${lastName} (${email})`)
      
      // First, update application status
      const { error: updateError } = await supabase
        .from('applications')
        .update({ 
          status: 'rejected',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId)

      if (updateError) {
        console.error('Error updating application status:', updateError)
        throw updateError
      }

      console.log('Application status updated to rejected')

      // Send denial email using the Gmail function
      const { error: emailError } = await supabase.functions.invoke('gmail-send-application-denial', {
        body: { 
          firstName,
          lastName,
          email
        }
      })

      if (emailError) {
        console.error('Email sending error:', emailError)
        toast({
          title: "Application Denied",
          description: `${firstName}'s application has been denied, but denial email failed to send. Please check email service configuration.`,
          variant: "destructive",
        })
      } else {
        console.log('Denial email sent successfully')
        toast({
          title: "Application Denied",
          description: `${firstName}'s application has been denied and a notification email has been sent to ${email}`,
          duration: 5000,
        })
      }

      // Data will be refreshed automatically by the real-time subscription
    } catch (error: any) {
      console.error('Error denying application:', error)
      toast({
        title: "Error",
        description: `Failed to deny application: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 animate-pulse mb-2"></div>
                <div className="h-3 bg-muted rounded w-24 animate-pulse"></div>
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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome to the UC Investment Academy admin dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              All time submissions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approvedApplications}</div>
            <p className="text-xs text-muted-foreground">
              Active students
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalApplications > 0 
                ? Math.round((stats.approvedApplications / stats.totalApplications) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Approval rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>
            Pending applications awaiting review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No applications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{app.first_name} {app.last_name}</h4>
                      <Badge variant="secondary">{app.uc_campus}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{app.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {app.major} • GPA: {app.gpa}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted: {new Date(app.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      app.status === 'pending' ? 'outline' : 
                      app.status === 'approved' ? 'default' : 
                      'destructive'
                    }>
                      {app.status}
                    </Badge>
                    {app.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handleApproveApplication(app.id, app.email, app.first_name, app.last_name)}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleDenyApplication(app.id, app.email, app.first_name, app.last_name)}
                        >
                          Deny
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm">Manage Pathways</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Add or edit career pathway content
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm">Certifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Create and manage certification programs
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm">Post Internships</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Add new internship opportunities
            </p>
          </CardContent>
        </Card>
        
        <NavLink to="/admin/calendar" className="block">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm">Manage Events</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Create and manage calendar events
              </p>
            </CardContent>
          </Card>
        </NavLink>
      </div>

      {/* Calendar Events Management */}
      <CalendarEventsManagement />
    </div>
  )
}

export default AdminDashboard
