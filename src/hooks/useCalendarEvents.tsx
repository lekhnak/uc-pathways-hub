import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface CalendarEvent {
  id: string
  title: string
  description: string | null
  event_date: string
  event_time: string | null
  location: string | null
  signup_url: string | null
  speakers: string[] | null
  event_type: string
  status: string
  rsvp_enabled: boolean
  event_capacity: number | null
  rsvp_deadline: string | null
  allow_waitlist: boolean
  created_at: string
  updated_at: string
}

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('event_date', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching calendar events:', err)
    } finally {
      setLoading(false)
    }
  }

  const createEvent = async (eventData: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // For admin operations, use the service role via edge function
      const { data, error } = await supabase.functions.invoke('create-calendar-event', {
        body: eventData
      })

      if (error) throw error
      await fetchEvents() // Refresh the list
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateEvent = async (id: string, eventData: Partial<CalendarEvent>) => {
    try {
      // For admin operations, use the service role via edge function
      const { data, error } = await supabase.functions.invoke('update-calendar-event', {
        body: { id, ...eventData }
      })

      if (error) throw error
      await fetchEvents() // Refresh the list
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      // For admin operations, use the service role via edge function
      const { data, error } = await supabase.functions.invoke('delete-calendar-event', {
        body: { id }
      })

      if (error) throw error
      await fetchEvents() // Refresh the list
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    fetchEvents()

    // Set up real-time subscription
    const channel = supabase
      .channel('calendar-events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_events'
        },
        () => {
          fetchEvents()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent
  }
}