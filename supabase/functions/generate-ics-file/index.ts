import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const generateICSContent = (event: any, userInfo?: any) => {
  const startDate = new Date(`${event.event_date}T${event.event_time || '12:00:00'}`);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours duration

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UC Investment Academy//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@ucinvestmentacademy.com`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `DTSTAMP:${formatDate(new Date())}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description || ''}${userInfo ? `\\n\\nRegistered as: ${userInfo.name}` : ''}${event.speakers && event.speakers.length > 0 ? `\\n\\nSpeakers: ${event.speakers.join(', ')}` : ''}`,
    `LOCATION:${event.location || 'TBD'}`,
    'ORGANIZER;CN=UC Investment Academy:MAILTO:uc.investment.academy@gmail.com',
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'SEQUENCE:0',
    'CLASS:PUBLIC'
  ];

  if (userInfo) {
    icsLines.push(`ATTENDEE;CN=${userInfo.name};ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=TRUE:MAILTO:${userInfo.email}`);
  }

  // Add reminders
  icsLines.push(
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'DESCRIPTION:Event reminder - 24 hours',
    'ACTION:DISPLAY',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'DESCRIPTION:Event reminder - 1 hour',
    'ACTION:DISPLAY',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'DESCRIPTION:Event starting soon',
    'ACTION:DISPLAY',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  );

  return icsLines.join('\n');
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { event_id, user_info } = await req.json();

    if (!event_id) {
      throw new Error('Event ID is required');
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      throw new Error('Event not found');
    }

    // Generate ICS content
    const icsContent = generateICSContent(event, user_info);

    // Create filename
    const filename = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${event.event_date}.ics`;

    return new Response(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        ...corsHeaders
      },
    });

  } catch (error: any) {
    console.error('Error in generate-ics-file function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);