import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface EventRsvp {
  id: string
  event_id: string
  user_name: string
  user_email: string
  user_phone: string
  rsvp_date: string
  status: 'confirmed' | 'cancelled' | 'waitlisted'
  notes?: string
  created_at: string
  updated_at: string
}

export interface RsvpFormData {
  user_name: string
  user_email: string
  user_phone: string
  notes?: string
}

export const useEventRsvps = (eventId?: string) => {
  const [rsvps, setRsvps] = useState<EventRsvp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRsvps = async (targetEventId?: string) => {
    try {
      setLoading(true)
      let query = supabase.from('event_rsvps').select('*')
      
      if (targetEventId || eventId) {
        query = query.eq('event_id', targetEventId || eventId)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setRsvps((data as EventRsvp[]) || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching RSVPs:', err)
    } finally {
      setLoading(false)
    }
  }

  const createRsvp = async (eventId: string, rsvpData: RsvpFormData) => {
    try {
      // Check if user already has an RSVP for this event
      const { data: existingRsvp } = await supabase
        .from('event_rsvps')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_email', rsvpData.user_email)
        .single()

      if (existingRsvp) {
        throw new Error('You have already registered for this event')
      }

      // Get event capacity and current confirmed RSVPs
      const { data: event } = await supabase
        .from('calendar_events')
        .select('event_capacity, allow_waitlist')
        .eq('id', eventId)
        .single()

      const { data: confirmedRsvps } = await supabase
        .from('event_rsvps')
        .select('id')
        .eq('event_id', eventId)
        .eq('status', 'confirmed')

      const confirmedCount = confirmedRsvps?.length || 0
      const isAtCapacity = event?.event_capacity && confirmedCount >= event.event_capacity

      const status: 'confirmed' | 'waitlisted' = isAtCapacity && event?.allow_waitlist ? 'waitlisted' : 'confirmed'

      const { data, error } = await supabase
        .from('event_rsvps')
        .insert([{
          event_id: eventId,
          ...rsvpData,
          status
        }])
        .select()

      if (error) throw error

      // Send confirmation email
      await supabase.functions.invoke('send-rsvp-confirmation', {
        body: {
          rsvp: data[0],
          event_id: eventId,
          status
        }
      })

      await fetchRsvps()
      return { rsvp: data[0], status: status as 'confirmed' | 'waitlisted' }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateRsvpStatus = async (rsvpId: string, status: 'confirmed' | 'cancelled' | 'waitlisted') => {
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .update({ status })
        .eq('id', rsvpId)
        .select()

      if (error) throw error
      await fetchRsvps()
      return data[0]
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteRsvp = async (rsvpId: string) => {
    try {
      const { error } = await supabase
        .from('event_rsvps')
        .delete()
        .eq('id', rsvpId)

      if (error) throw error
      await fetchRsvps()
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const getRsvpStats = async (targetEventId: string) => {
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select('status')
        .eq('event_id', targetEventId)

      if (error) throw error

      const stats = {
        total: data?.length || 0,
        confirmed: data?.filter(r => r.status === 'confirmed').length || 0,
        waitlisted: data?.filter(r => r.status === 'waitlisted').length || 0,
        cancelled: data?.filter(r => r.status === 'cancelled').length || 0
      }

      return stats
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const exportRsvpsToCSV = (eventRsvps: EventRsvp[]) => {
    const headers = ['Name', 'Email', 'Phone', 'Status', 'RSVP Date', 'Notes']
    const csvData = eventRsvps.map(rsvp => [
      rsvp.user_name,
      rsvp.user_email,
      rsvp.user_phone,
      rsvp.status,
      new Date(rsvp.rsvp_date).toLocaleDateString(),
      rsvp.notes || ''
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `event-rsvps-${new Date().getTime()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    if (eventId) {
      fetchRsvps()
    }

    // Set up real-time subscription for RSVPs
    const channel = supabase
      .channel('event-rsvps-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_rsvps'
        },
        () => {
          fetchRsvps()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId])

  return {
    rsvps,
    loading,
    error,
    createRsvp,
    updateRsvpStatus,
    deleteRsvp,
    getRsvpStats,
    exportRsvpsToCSV,
    fetchRsvps
  }
}