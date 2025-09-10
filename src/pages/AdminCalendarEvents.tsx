import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Users,
  Mail,
  Download,
  ChevronDown,
  ChevronUp,
  Send,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react'
import { useCalendarEvents } from '@/hooks/useCalendarEvents'
import { useEventRsvps } from '@/hooks/useEventRsvps'
import { format } from 'date-fns'
import { NavLink } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  rsvp_enabled: boolean
  event_capacity: string
  rsvp_deadline: string
  allow_waitlist: boolean
}

const AdminCalendarEvents = () => {
  const { events, loading, createEvent, updateEvent, deleteEvent } = useCalendarEvents()
  const { fetchRsvps, updateRsvpStatus, deleteRsvp, exportRsvpsToCSV } = useEventRsvps()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [eventRsvps, setEventRsvps] = useState<{[key: string]: any[]}>({})
  const [expandedEvents, setExpandedEvents] = useState<{[key: string]: boolean}>({})
  const [rsvpSearchTerms, setRsvpSearchTerms] = useState<{[key: string]: string}>({})
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [selectedEventForEmail, setSelectedEventForEmail] = useState<any>(null)
  const [emailForm, setEmailForm] = useState({
    subject: '',
    content: '',
    email_type: 'custom' as const
  })

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    signup_url: '',
    speakers: '',
    event_type: 'general',
    status: 'upcoming',
    rsvp_enabled: false,
    event_capacity: '',
    rsvp_deadline: '',
    allow_waitlist: true
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
      status: 'upcoming',
      rsvp_enabled: false,
      event_capacity: '',
      rsvp_deadline: '',
      allow_waitlist: true
    })
    setEditingEvent(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const eventData = {
        ...formData,
        event_capacity: formData.event_capacity ? parseInt(formData.event_capacity) : null,
        rsvp_deadline: formData.rsvp_deadline || null,
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
      status: event.status,
      rsvp_enabled: event.rsvp_enabled || false,
      event_capacity: event.event_capacity ? event.event_capacity.toString() : '',
      rsvp_deadline: event.rsvp_deadline || '',
      allow_waitlist: event.allow_waitlist !== false
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

  const loadEventRsvps = async (eventId: string) => {
    try {
      const { data } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      setEventRsvps(prev => ({
        ...prev,
        [eventId]: data || []
      }))
    } catch (error) {
      console.error('Failed to load RSVPs:', error)
    }
  }

  const toggleEventExpansion = async (eventId: string) => {
    const isExpanded = expandedEvents[eventId]
    
    setExpandedEvents(prev => ({
      ...prev,
      [eventId]: !isExpanded
    }))

    // Load RSVPs if expanding for the first time
    if (!isExpanded && !eventRsvps[eventId]) {
      await loadEventRsvps(eventId)
    }
  }

  const handleRsvpStatusChange = async (rsvpId: string, newStatus: 'confirmed' | 'cancelled' | 'waitlisted', eventId: string) => {
    try {
      await updateRsvpStatus(rsvpId, newStatus)
      await loadEventRsvps(eventId) // Reload RSVPs
      toast({
        title: "RSVP Updated",
        description: `RSVP status changed to ${newStatus}`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteRsvp = async (rsvpId: string, eventId: string) => {
    if (confirm('Are you sure you want to delete this RSVP?')) {
      try {
        await deleteRsvp(rsvpId)
        await loadEventRsvps(eventId)
        toast({
          title: "RSVP Deleted",
          description: "The RSVP has been deleted.",
        })
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      }
    }
  }

  const handleExportRsvps = (eventId: string) => {
    const rsvps = eventRsvps[eventId] || []
    if (rsvps.length === 0) {
      toast({
        title: "No RSVPs",
        description: "There are no RSVPs to export for this event.",
        variant: "destructive",
      })
      return
    }
    exportRsvpsToCSV(rsvps)
    toast({
      title: "Export Complete",
      description: "RSVPs exported to CSV file.",
    })
  }

  const sendEventEmail = async (eventId: string, emailType: string, customSubject?: string, customContent?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-event-notifications', {
        body: {
          event_id: eventId,
          email_type: emailType,
          custom_subject: customSubject,
          custom_content: customContent
        }
      })

      if (error) throw error

      toast({
        title: "Emails Sent",
        description: `Successfully sent ${emailType} emails to event attendees.`,
      })
    } catch (error: any) {
      toast({
        title: "Email Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleSendCustomEmail = async () => {
    if (!selectedEventForEmail || !emailForm.subject || !emailForm.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in both subject and content.",
        variant: "destructive",
      })
      return
    }

    await sendEventEmail(
      selectedEventForEmail.id,
      emailForm.email_type,
      emailForm.subject,
      emailForm.content
    )

    setEmailModalOpen(false)
    setEmailForm({ subject: '', content: '', email_type: 'custom' })
    setSelectedEventForEmail(null)
  }

  const getFilteredRsvps = (eventId: string) => {
    const rsvps = eventRsvps[eventId] || []
    const searchTerm = rsvpSearchTerms[eventId] || ''
    
    if (!searchTerm) return rsvps
    
    return rsvps.filter(rsvp => 
      rsvp.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rsvp.user_email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const getRsvpStats = (eventId: string) => {
    const rsvps = eventRsvps[eventId] || []
    return {
      total: rsvps.length,
      confirmed: rsvps.filter(r => r.status === 'confirmed').length,
      waitlisted: rsvps.filter(r => r.status === 'waitlisted').length,
      cancelled: rsvps.filter(r => r.status === 'cancelled').length
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <NavLink to="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </NavLink>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar Events Management</h1>
          <p className="text-muted-foreground">
            Create and manage events with RSVP functionality
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Events</CardTitle>
              <CardDescription>
                Manage upcoming and past events with RSVP tracking
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingEvent ? 'Edit Event' : 'Create New Event'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
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

                  {/* RSVP Configuration Section */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="rsvp_enabled"
                        checked={formData.rsvp_enabled}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rsvp_enabled: checked }))}
                      />
                      <Label htmlFor="rsvp_enabled" className="font-medium">Enable RSVP System</Label>
                    </div>

                    {formData.rsvp_enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                          <Label htmlFor="event_capacity">Event Capacity (Optional)</Label>
                          <Input
                            id="event_capacity"
                            type="number"
                            min="1"
                            value={formData.event_capacity}
                            onChange={(e) => setFormData(prev => ({ ...prev, event_capacity: e.target.value }))}
                            placeholder="Leave empty for unlimited"
                          />
                        </div>
                        <div>
                          <Label htmlFor="rsvp_deadline">RSVP Deadline (Optional)</Label>
                          <Input
                            id="rsvp_deadline"
                            type="datetime-local"
                            value={formData.rsvp_deadline}
                            onChange={(e) => setFormData(prev => ({ ...prev, rsvp_deadline: e.target.value }))}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="allow_waitlist"
                              checked={formData.allow_waitlist}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_waitlist: checked }))}
                            />
                            <Label htmlFor="allow_waitlist">Allow Waitlist When Full</Label>
                          </div>
                        </div>
                      </div>
                    )}
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

                  {!formData.rsvp_enabled && (
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
                  )}

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
              {events.map((event) => {
                const stats = getRsvpStats(event.id)
                const isExpanded = expandedEvents[event.id]

                return (
                  <div key={event.id} className="border rounded-lg">
                    <div className="flex items-center justify-between p-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge variant="secondary">{event.event_type}</Badge>
                          <Badge variant={event.status === 'upcoming' ? 'default' : 'outline'}>
                            {event.status}
                          </Badge>
                          {event.rsvp_enabled && (
                            <Badge className="bg-green-100 text-green-800">
                              RSVP Enabled
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.event_date), 'PPP')}
                          {event.event_time && ` at ${format(new Date(`2000-01-01T${event.event_time}`), 'p')}`}
                        </p>
                        {event.location && (
                          <p className="text-sm text-muted-foreground">{event.location}</p>
                        )}
                        {event.speakers && event.speakers.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Speakers: {event.speakers.join(', ')}
                          </p>
                        )}
                        {event.rsvp_enabled && (
                          <div className="flex gap-4 text-sm">
                            <span className="text-green-600">✓ {stats.confirmed} confirmed</span>
                            {stats.waitlisted > 0 && (
                              <span className="text-yellow-600">⏳ {stats.waitlisted} waitlisted</span>
                            )}
                            <span className="text-muted-foreground">📊 {stats.total} total</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {event.rsvp_enabled && (
                          <Collapsible open={isExpanded} onOpenChange={() => toggleEventExpansion(event.id)}>
                            <CollapsibleTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Users className="h-4 w-4 mr-1" />
                                RSVPs ({stats.total})
                                {isExpanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                              </Button>
                            </CollapsibleTrigger>
                          </Collapsible>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Mail className="h-4 w-4 mr-1" />
                              Email
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => sendEventEmail(event.id, 'event_reminder_24h')}>
                              Send 24h Reminder
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => sendEventEmail(event.id, 'event_reminder_1h')}>
                              Send 1h Reminder
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedEventForEmail(event)
                              setEmailModalOpen(true)
                            }}>
                              Send Custom Email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Button size="sm" variant="outline" onClick={() => handleEdit(event)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(event.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* RSVP Management Section */}
                    {event.rsvp_enabled && (
                      <Collapsible open={isExpanded} onOpenChange={() => toggleEventExpansion(event.id)}>
                        <CollapsibleContent className="border-t bg-gray-50">
                          <div className="p-4 space-y-4">
                            <div className="flex justify-between items-center">
                              <h5 className="font-medium">RSVP Management</h5>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleExportRsvps(event.id)}
                                  disabled={stats.total === 0}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Export CSV
                                </Button>
                              </div>
                            </div>

                            {stats.total > 0 && (
                              <>
                                <div className="flex gap-2">
                                  <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      placeholder="Search by name or email..."
                                      value={rsvpSearchTerms[event.id] || ''}
                                      onChange={(e) => setRsvpSearchTerms(prev => ({
                                        ...prev,
                                        [event.id]: e.target.value
                                      }))}
                                      className="pl-10"
                                    />
                                  </div>
                                </div>

                                <div className="border rounded-lg overflow-hidden">
                                  <div className="overflow-x-auto">
                                    <table className="w-full">
                                      <thead className="bg-muted/50">
                                        <tr>
                                          <th className="text-left p-3 font-medium">Name</th>
                                          <th className="text-left p-3 font-medium">Email</th>
                                          <th className="text-left p-3 font-medium">Phone</th>
                                          <th className="text-left p-3 font-medium">Status</th>
                                          <th className="text-left p-3 font-medium">RSVP Date</th>
                                          <th className="text-right p-3 font-medium">Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {getFilteredRsvps(event.id).map((rsvp) => (
                                          <tr key={rsvp.id} className="border-t">
                                            <td className="p-3">{rsvp.user_name}</td>
                                            <td className="p-3 text-sm text-muted-foreground">{rsvp.user_email}</td>
                                            <td className="p-3 text-sm text-muted-foreground">{rsvp.user_phone}</td>
                                            <td className="p-3">
                                              <Badge
                                                variant={
                                                  rsvp.status === 'confirmed' ? 'default' :
                                                  rsvp.status === 'waitlisted' ? 'secondary' : 'destructive'
                                                }
                                              >
                                                {rsvp.status}
                                              </Badge>
                                            </td>
                                            <td className="p-3 text-sm text-muted-foreground">
                                              {format(new Date(rsvp.rsvp_date), 'PPp')}
                                            </td>
                                            <td className="p-3 text-right">
                                              <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                  <Button size="sm" variant="ghost">
                                                    <MoreVertical className="h-4 w-4" />
                                                  </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                  <DropdownMenuItem
                                                    onClick={() => handleRsvpStatusChange(rsvp.id, 'confirmed', event.id)}
                                                  >
                                                    Mark Confirmed
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem
                                                    onClick={() => handleRsvpStatusChange(rsvp.id, 'waitlisted', event.id)}
                                                  >
                                                    Move to Waitlist
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem
                                                    onClick={() => handleRsvpStatusChange(rsvp.id, 'cancelled', event.id)}
                                                  >
                                                    Mark Cancelled
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem
                                                    onClick={() => handleDeleteRsvp(rsvp.id, event.id)}
                                                    className="text-red-600"
                                                  >
                                                    Delete RSVP
                                                  </DropdownMenuItem>
                                                </DropdownMenuContent>
                                              </DropdownMenu>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </>
                            )}

                            {stats.total === 0 && (
                              <div className="text-center py-8 text-muted-foreground">
                                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No RSVPs yet for this event</p>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Custom Email</DialogTitle>
            <DialogDescription>
              Send a custom email to all confirmed attendees of {selectedEventForEmail?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email_subject">Subject</Label>
              <Input
                id="email_subject"
                value={emailForm.subject}
                onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter email subject..."
              />
            </div>
            <div>
              <Label htmlFor="email_content">Message</Label>
              <Textarea
                id="email_content"
                value={emailForm.content}
                onChange={(e) => setEmailForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your message..."
                rows={8}
              />
              <p className="text-sm text-muted-foreground mt-1">
                HTML tags are supported for formatting.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEmailModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendCustomEmail}>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminCalendarEvents