-- Create calendar_events table
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  signup_url TEXT,
  speakers TEXT[],
  event_type TEXT DEFAULT 'general',
  status TEXT DEFAULT 'upcoming',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create policies for calendar events
CREATE POLICY "Anyone can view calendar events" 
ON public.calendar_events 
FOR SELECT 
USING (true);

CREATE POLICY "Admin users can create calendar events" 
ON public.calendar_events 
FOR INSERT 
WITH CHECK (is_admin_user());

CREATE POLICY "Admin users can update calendar events" 
ON public.calendar_events 
FOR UPDATE 
USING (is_admin_user());

CREATE POLICY "Admin users can delete calendar events" 
ON public.calendar_events 
FOR DELETE 
USING (is_admin_user());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the sample event
INSERT INTO public.calendar_events (
  title,
  description,
  event_date,
  event_time,
  location,
  signup_url,
  speakers,
  event_type
) VALUES (
  'UC Investments Academy and ITDC Event: Virtual Private Credit Teach-In',
  'Virtual teach-in on private credit, aimed at students and those early in their careers. Walk through different segments of private credit, with a focus on the biggest areas, direct lending and asset-based finance. There will be plenty of time for Q&A. The teach-in should help anyone who is looking to understand this area more in detail.

Why: The event is in honor of Sasha Talcott''s and Sonali Wilson''s friend, Jennifer Strickland, who recently passed away. Jennifer was a successful private credit professional and a mentor and trailblazer in the industry. She created the Jennifer T Strickland Foundation, with a mission to provide mentorship and career development resources to women in private credit.',
  '2024-09-04',
  '14:00:00',
  'Virtual Event',
  'https://www.surveymonkey.com/r/3YHHGVC',
  ARRAY['Sonali Patel Wilson - Managing Director of Alternatives, Wellington Management', 'Sasha Talcott - Managing Director at KKR'],
  'teach-in'
);