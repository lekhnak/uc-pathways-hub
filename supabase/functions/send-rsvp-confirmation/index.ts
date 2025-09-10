import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Gmail OAuth2 configuration
const getGmailAccessToken = async () => {
  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: Deno.env.get('GMAIL_CLIENT_ID') || '',
      client_secret: Deno.env.get('GMAIL_CLIENT_SECRET') || '',
      refresh_token: Deno.env.get('GMAIL_REFRESH_TOKEN') || '',
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
};

const sendGmailEmail = async (accessToken: string, to: string, subject: string, htmlContent: string) => {
  const emailContent = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=utf-8',
    '',
    htmlContent
  ].join('\n');

  const base64Email = btoa(unescape(encodeURIComponent(emailContent))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: base64Email
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to send email: ${response.statusText} - ${errorData}`);
  }

  return await response.json();
};

const generateICSFile = (event: any, rsvp: any) => {
  const startDate = new Date(`${event.event_date}T${event.event_time || '12:00:00'}`);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UC Investment Academy//Event//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${event.id}@ucinvestmentacademy.com`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description || ''}\\n\\nRegistered as: ${rsvp.user_name}\\nEmail: ${rsvp.user_email}`,
    `LOCATION:${event.location || 'TBD'}`,
    `ORGANIZER:CN=UC Investment Academy:MAILTO:uc.investment.academy@gmail.com`,
    `ATTENDEE:CN=${rsvp.user_name}:MAILTO:${rsvp.user_email}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'DESCRIPTION:Event reminder',
    'ACTION:DISPLAY',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'DESCRIPTION:Event reminder',
    'ACTION:DISPLAY',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\n');

  return icsContent;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { rsvp, event_id, status } = await req.json();

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      throw new Error('Event not found');
    }

    // Get Gmail access token
    const accessToken = await getGmailAccessToken();

    // Generate ICS file
    const icsContent = generateICSFile(event, rsvp);
    const icsBase64 = btoa(icsContent);

    // Create email content based on status
    const isWaitlisted = status === 'waitlisted';
    const subject = isWaitlisted 
      ? `Waitlisted: ${event.title} - UC Investment Academy`
      : `RSVP Confirmed: ${event.title} - UC Investment Academy`;

    const statusMessage = isWaitlisted
      ? `<div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 12px; border-radius: 6px; margin: 20px 0;">
           <h3 style="color: #92400e; margin: 0 0 8px 0;">You're on the Waitlist</h3>
           <p style="color: #92400e; margin: 0;">This event is currently at capacity, but we've added you to the waitlist. We'll notify you immediately if a spot becomes available.</p>
         </div>`
      : `<div style="background-color: #d1fae5; border: 1px solid #10b981; padding: 12px; border-radius: 6px; margin: 20px 0;">
           <h3 style="color: #065f46; margin: 0 0 8px 0;">Registration Confirmed!</h3>
           <p style="color: #065f46; margin: 0;">Your spot is secured. We look forward to seeing you at the event.</p>
         </div>`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RSVP Confirmation</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e40af; margin: 0;">UC Investment Academy</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0;">Empowering Future Finance Leaders</p>
        </div>

        ${statusMessage}

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1e40af; margin: 0 0 15px 0;">${event.title}</h2>
          
          <div style="display: grid; gap: 10px;">
            <div style="display: flex; align-items: center;">
              <strong style="width: 100px; color: #374151;">Date:</strong>
              <span>${new Date(event.event_date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            
            ${event.event_time ? `
            <div style="display: flex; align-items: center;">
              <strong style="width: 100px; color: #374151;">Time:</strong>
              <span>${new Date(`2000-01-01T${event.event_time}`).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })}</span>
            </div>
            ` : ''}
            
            ${event.location ? `
            <div style="display: flex; align-items: center;">
              <strong style="width: 100px; color: #374151;">Location:</strong>
              <span>${event.location}</span>
            </div>
            ` : ''}
            
            ${event.speakers && event.speakers.length > 0 ? `
            <div style="display: flex; align-items: center;">
              <strong style="width: 100px; color: #374151;">Speakers:</strong>
              <span>${event.speakers.join(', ')}</span>
            </div>
            ` : ''}
          </div>

          ${event.description ? `
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #4b5563;">${event.description}</p>
          </div>
          ` : ''}
        </div>

        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin: 0 0 10px 0;">Your Registration Details</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${rsvp.user_name}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${rsvp.user_email}</p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${rsvp.user_phone}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> <span style="text-transform: capitalize; color: ${isWaitlisted ? '#d97706' : '#059669'};">${status}</span></p>
        </div>

        ${!isWaitlisted ? `
        <div style="text-align: center; margin: 25px 0;">
          <p style="color: #6b7280; margin-bottom: 10px;">Add this event to your calendar:</p>
          <div style="display: inline-block;">
            <a href="data:text/calendar;base64,${icsBase64}" download="${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics" 
               style="background-color: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">
              📅 Download Calendar File
            </a>
          </div>
        </div>
        ` : ''}

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            If you have any questions, please contact us at 
            <a href="mailto:uc.investment.academy@gmail.com" style="color: #1e40af;">uc.investment.academy@gmail.com</a>
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
            UC Investment Academy • Building Tomorrow's Financial Leaders
          </p>
        </div>
      </body>
      </html>
    `;

    // Send email
    await sendGmailEmail(accessToken, rsvp.user_email, subject, htmlContent);

    // Log the email notification
    await supabase
      .from('email_notifications')
      .insert([{
        event_id: event_id,
        rsvp_id: rsvp.id,
        email_type: isWaitlisted ? 'waitlist_notification' : 'rsvp_confirmation',
        recipient_email: rsvp.user_email,
        subject: subject,
        delivery_status: 'sent'
      }]);

    console.log('RSVP confirmation email sent successfully to:', rsvp.user_email);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'RSVP confirmation email sent successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in send-rsvp-confirmation function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);