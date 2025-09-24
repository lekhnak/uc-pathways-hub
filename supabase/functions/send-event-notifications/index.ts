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

const getEmailTemplate = (type: string, event: any, rsvp: any, customContent?: string) => {
  const eventDate = new Date(event.event_date).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const eventTime = event.event_time ? 
    new Date(`2000-01-01T${event.event_time}`).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }) : 'TBA';

  const baseTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Event Notification</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1e40af; margin: 0;">UC Investment Academy</h1>
        <p style="color: #6b7280; margin: 5px 0 0 0;">Empowering Future Finance Leaders</p>
      </div>
  `;

  const eventDetailsSection = `
    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="color: #1e40af; margin: 0 0 15px 0;">${event.title}</h2>
      
      <div style="display: grid; gap: 10px;">
        <div style="display: flex; align-items: center;">
          <strong style="width: 100px; color: #374151;">Date:</strong>
          <span>${eventDate}</span>
        </div>
        
        <div style="display: flex; align-items: center;">
          <strong style="width: 100px; color: #374151;">Time:</strong>
          <span>${eventTime}</span>
        </div>
        
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
  `;

  const footerSection = `
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

  switch (type) {
    case 'event_reminder_24h':
      return baseTemplate + `
        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 12px; border-radius: 6px; margin: 20px 0; text-align: center;">
          <h3 style="color: #92400e; margin: 0 0 8px 0;">📅 Event Reminder - Tomorrow!</h3>
          <p style="color: #92400e; margin: 0;">Don't forget about your upcoming event tomorrow.</p>
        </div>
        ${eventDetailsSection}
        <div style="text-align: center; margin: 20px 0;">
          <p style="color: #374151;"><strong>Hi ${rsvp.user_name},</strong></p>
          <p style="color: #4b5563;">This is a friendly reminder that you have an event scheduled for tomorrow. We're looking forward to seeing you there!</p>
        </div>
        ${footerSection}
      `;

    case 'event_reminder_1h':
      return baseTemplate + `
        <div style="background-color: #fee2e2; border: 1px solid #f87171; padding: 12px; border-radius: 6px; margin: 20px 0; text-align: center;">
          <h3 style="color: #dc2626; margin: 0 0 8px 0;">⏰ Event Starting Soon - 1 Hour!</h3>
          <p style="color: #dc2626; margin: 0;">Your event starts in approximately 1 hour.</p>
        </div>
        ${eventDetailsSection}
        <div style="text-align: center; margin: 20px 0;">
          <p style="color: #374151;"><strong>Hi ${rsvp.user_name},</strong></p>
          <p style="color: #4b5563;">Your event is starting soon! Please make sure you're ready to join us.</p>
          ${event.location === 'Virtual' ? '<p style="color: #4b5563;">This is a virtual event. Please check your original registration email for the meeting link.</p>' : ''}
        </div>
        ${footerSection}
      `;

    case 'event_cancellation':
      return baseTemplate + `
        <div style="background-color: #fee2e2; border: 1px solid #dc2626; padding: 12px; border-radius: 6px; margin: 20px 0; text-align: center;">
          <h3 style="color: #dc2626; margin: 0 0 8px 0;">❌ Event Cancelled</h3>
          <p style="color: #dc2626; margin: 0;">Unfortunately, this event has been cancelled.</p>
        </div>
        ${eventDetailsSection}
        <div style="text-align: center; margin: 20px 0;">
          <p style="color: #374151;"><strong>Hi ${rsvp.user_name},</strong></p>
          <p style="color: #4b5563;">We regret to inform you that the above event has been cancelled. We apologize for any inconvenience this may cause.</p>
          <p style="color: #4b5563;">We'll notify you about future events and appreciate your understanding.</p>
        </div>
        ${footerSection}
      `;

    case 'event_update':
      return baseTemplate + `
        <div style="background-color: #dbeafe; border: 1px solid #3b82f6; padding: 12px; border-radius: 6px; margin: 20px 0; text-align: center;">
          <h3 style="color: #1d4ed8; margin: 0 0 8px 0;">📢 Event Update</h3>
          <p style="color: #1d4ed8; margin: 0;">Important information about your upcoming event.</p>
        </div>
        ${eventDetailsSection}
        <div style="text-align: center; margin: 20px 0;">
          <p style="color: #374151;"><strong>Hi ${rsvp.user_name},</strong></p>
          <p style="color: #4b5563;">There has been an update to your upcoming event. Please review the details above to ensure you have the latest information.</p>
        </div>
        ${footerSection}
      `;

    case 'custom':
      return baseTemplate + `
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${customContent || '<p>Custom message from UC Investment Academy.</p>'}
        </div>
        ${eventDetailsSection}
        ${footerSection}
      `;

    default:
      return baseTemplate + eventDetailsSection + footerSection;
  }
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

    const { 
      event_id, 
      email_type, 
      custom_subject, 
      custom_content,
      recipient_emails // Optional: send to specific emails instead of all RSVPs
    } = await req.json();

    if (!event_id || !email_type) {
      throw new Error('Event ID and email type are required');
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

    // Get RSVPs for the event (confirmed attendees only, unless it's a cancellation)
    let rsvpQuery = supabase
      .from('event_rsvps')
      .select('*')
      .eq('event_id', event_id);

    if (email_type !== 'event_cancellation') {
      rsvpQuery = rsvpQuery.eq('status', 'confirmed');
    }

    const { data: rsvps, error: rsvpError } = await rsvpQuery;

    if (rsvpError) {
      throw new Error('Failed to fetch RSVPs');
    }

    // Filter recipients if specific emails provided
    const targetRsvps = recipient_emails && recipient_emails.length > 0
      ? rsvps?.filter(rsvp => recipient_emails.includes(rsvp.user_email)) || []
      : rsvps || [];

    if (targetRsvps.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No recipients found for this event' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get Gmail access token
    const accessToken = await getGmailAccessToken();

    // Generate subject based on type
    let subject = custom_subject;
    if (!subject) {
      switch (email_type) {
        case 'event_reminder_24h':
          subject = `Reminder: ${event.title} - Tomorrow!`;
          break;
        case 'event_reminder_1h':
          subject = `Starting Soon: ${event.title} - 1 Hour!`;
          break;
        case 'event_cancellation':
          subject = `Cancelled: ${event.title}`;
          break;
        case 'event_update':
          subject = `Update: ${event.title}`;
          break;
        default:
          subject = `${event.title} - UC Investment Academy`;
      }
    }

    // Send emails to all recipients
    const emailResults = [];
    
    for (const rsvp of targetRsvps) {
      try {
        const htmlContent = getEmailTemplate(email_type, event, rsvp, custom_content);
        
        await sendGmailEmail(accessToken, rsvp.user_email, subject, htmlContent);
        
        // Log the email notification
        await supabase
          .from('email_notifications')
          .insert([{
            event_id: event_id,
            rsvp_id: rsvp.id,
            email_type: email_type,
            recipient_email: rsvp.user_email,
            subject: subject,
            delivery_status: 'sent'
          }]);

        emailResults.push({ email: rsvp.user_email, status: 'sent' });
        
      } catch (emailError) {
        console.error(`Failed to send email to ${rsvp.user_email}:`, emailError);
        
        // Log the failed email
        await supabase
          .from('email_notifications')
          .insert([{
            event_id: event_id,
            rsvp_id: rsvp.id,
            email_type: email_type,
            recipient_email: rsvp.user_email,
            subject: subject,
            delivery_status: 'failed',
            error_message: (emailError as Error).message
          }]);

        emailResults.push({ 
          email: rsvp.user_email, 
          status: 'failed', 
          error: (emailError as Error).message 
        });
      }
    }

    console.log(`Event notification emails sent for event ${event_id}:`, emailResults);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Sent ${emailResults.filter(r => r.status === 'sent').length} of ${emailResults.length} emails successfully`,
      results: emailResults
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in send-event-notifications function:', error);
    
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