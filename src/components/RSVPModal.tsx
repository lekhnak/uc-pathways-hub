import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useEventRsvps } from '@/hooks/useEventRsvps'
import { supabase } from '@/integrations/supabase/client'
import { CheckCircle, Clock, Download, Mail, Users } from 'lucide-react'

interface RSVPModalProps {
  isOpen: boolean
  onClose: () => void
  event: any
  rsvpStats: any
}

const RSVPModal: React.FC<RSVPModalProps> = ({ isOpen, onClose, event, rsvpStats }) => {
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_phone: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rsvpSuccess, setRsvpSuccess] = useState<{ status: 'confirmed' | 'waitlisted'; rsvp: any } | null>(null)
  const { createRsvp } = useEventRsvps()
  const { toast } = useToast()

  const isAtCapacity = event.event_capacity && rsvpStats.confirmed >= event.event_capacity
  const spotsRemaining = event.event_capacity ? event.event_capacity - rsvpStats.confirmed : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await createRsvp(event.id, formData)
      setRsvpSuccess(result)
      
      toast({
        title: result.status === 'waitlisted' ? 'Added to Waitlist' : 'RSVP Confirmed!',
        description: result.status === 'waitlisted' 
          ? 'The event is at capacity, but we\'ve added you to the waitlist.'
          : 'Your registration has been confirmed. Check your email for details.',
      })
    } catch (error: any) {
      toast({
        title: "RSVP Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const downloadCalendarFile = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-ics-file', {
        body: {
          event_id: event.id,
          user_info: {
            name: rsvpSuccess?.rsvp.user_name,
            email: rsvpSuccess?.rsvp.user_email
          }
        }
      })

      if (error) throw error

      // Create and download the file
      const blob = new Blob([data], { type: 'text/calendar' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Calendar File Downloaded",
        description: "The event has been saved to your downloads folder.",
      })
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const resetAndClose = () => {
    setFormData({
      user_name: '',
      user_email: '',
      user_phone: '',
      notes: ''
    })
    setRsvpSuccess(null)
    onClose()
  }

  if (rsvpSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={resetAndClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {rsvpSuccess.status === 'waitlisted' ? (
                <>
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Added to Waitlist
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  RSVP Confirmed!
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {rsvpSuccess.status === 'waitlisted' ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  This event is currently at capacity, but we've added you to the waitlist. 
                  We'll notify you immediately if a spot becomes available.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  Your registration is confirmed! We've sent a confirmation email with event details.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <p><strong>Name:</strong> {rsvpSuccess.rsvp.user_name}</p>
              <p><strong>Email:</strong> {rsvpSuccess.rsvp.user_email}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-1 capitalize ${
                  rsvpSuccess.status === 'waitlisted' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {rsvpSuccess.status}
                </span>
              </p>
            </div>

            {rsvpSuccess.status === 'confirmed' && (
              <div className="flex gap-2">
                <Button 
                  onClick={downloadCalendarFile}
                  variant="outline" 
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
              </div>
            )}

            <Button onClick={resetAndClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            RSVP for {event.title}
          </DialogTitle>
        </DialogHeader>

        {/* Event capacity info */}
        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span>Confirmed RSVPs:</span>
            <span className="font-medium">{rsvpStats.confirmed}</span>
          </div>
          {event.event_capacity && (
            <div className="flex justify-between text-sm">
              <span>Capacity:</span>
              <span className="font-medium">{event.event_capacity}</span>
            </div>
          )}
          {spotsRemaining !== null && spotsRemaining > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Spots remaining:</span>
              <span className="font-medium">{spotsRemaining}</span>
            </div>
          )}
          {isAtCapacity && event.allow_waitlist && (
            <div className="text-sm text-yellow-600">
              Event is at capacity. You'll be added to the waitlist.
            </div>
          )}
          {isAtCapacity && !event.allow_waitlist && (
            <div className="text-sm text-red-600">
              Event is at capacity and no longer accepting registrations.
            </div>
          )}
        </div>

        {(!isAtCapacity || event.allow_waitlist) && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="user_name">Full Name *</Label>
              <Input
                id="user_name"
                value={formData.user_name}
                onChange={(e) => setFormData(prev => ({ ...prev, user_name: e.target.value }))}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label htmlFor="user_email">Email Address *</Label>
              <Input
                id="user_email"
                type="email"
                value={formData.user_email}
                onChange={(e) => setFormData(prev => ({ ...prev, user_email: e.target.value }))}
                required
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <Label htmlFor="user_phone">Phone Number *</Label>
              <Input
                id="user_phone"
                type="tel"
                value={formData.user_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, user_phone: e.target.value }))}
                required
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional information or questions..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Submitting...' : 
                 isAtCapacity ? 'Join Waitlist' : 'Confirm RSVP'}
              </Button>
            </div>
          </form>
        )}

        {isAtCapacity && !event.allow_waitlist && (
          <div className="text-center py-4">
            <p className="text-gray-600">This event is no longer accepting registrations.</p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default RSVPModal