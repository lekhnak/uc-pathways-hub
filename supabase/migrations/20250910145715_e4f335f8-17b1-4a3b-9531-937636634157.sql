-- Add RSVP-related fields to calendar_events table
ALTER TABLE public.calendar_events 
ADD COLUMN rsvp_enabled boolean DEFAULT false,
ADD COLUMN event_capacity integer,
ADD COLUMN rsvp_deadline timestamp with time zone,
ADD COLUMN allow_waitlist boolean DEFAULT true;

-- Create event_rsvps table
CREATE TABLE public.event_rsvps (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  user_email text NOT NULL,
  user_phone text NOT NULL,
  rsvp_date timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'waitlisted')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  UNIQUE(event_id, user_email)
);

-- Create index for better performance
CREATE INDEX idx_event_rsvps_event_id ON public.event_rsvps(event_id);
CREATE INDEX idx_event_rsvps_email ON public.event_rsvps(user_email);
CREATE INDEX idx_event_rsvps_status ON public.event_rsvps(status);

-- Enable RLS on event_rsvps table
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for event_rsvps
CREATE POLICY "Anyone can view event rsvps" 
ON public.event_rsvps 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create rsvps" 
ON public.event_rsvps 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin users can manage all rsvps" 
ON public.event_rsvps 
FOR ALL
USING (is_admin_user());

-- Create trigger for updated_at
CREATE TRIGGER update_event_rsvps_updated_at
BEFORE UPDATE ON public.event_rsvps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create email notification logs table
CREATE TABLE public.email_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  rsvp_id uuid REFERENCES public.event_rsvps(id) ON DELETE CASCADE,
  email_type text NOT NULL CHECK (email_type IN ('rsvp_confirmation', 'event_reminder_24h', 'event_reminder_1h', 'event_cancellation', 'event_update', 'waitlist_notification', 'custom')),
  recipient_email text NOT NULL,
  subject text NOT NULL,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  delivery_status text DEFAULT 'sent' CHECK (delivery_status IN ('sent', 'delivered', 'failed', 'bounced')),
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on email_notifications table
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email_notifications
CREATE POLICY "Admin users can view all email notifications" 
ON public.email_notifications 
FOR SELECT 
USING (is_admin_user());

CREATE POLICY "Admin users can manage email notifications" 
ON public.email_notifications 
FOR ALL
USING (is_admin_user());