import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DenialEmailRequest {
  firstName: string
  lastName: string
  email: string
}

// Function to get Gmail access token
async function getGmailAccessToken(): Promise<string> {
  const clientId = Deno.env.get('GMAIL_CLIENT_ID')
  const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET')
  const refreshToken = Deno.env.get('GMAIL_REFRESH_TOKEN')

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      refresh_token: refreshToken!,
      grant_type: 'refresh_token',
    }),
  })

  const data = await response.json()
  return data.access_token
}

// Function to send Gmail email
async function sendGmailEmail(accessToken: string, to: string, subject: string, htmlContent: string) {
  const email = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    htmlContent,
  ].join('\n')

  const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedEmail,
    }),
  })

  if (!response.ok) {
    throw new Error(`Gmail API error: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { firstName, lastName, email }: DenialEmailRequest = await req.json()
    
    console.log('Sending application denial email:', { firstName, lastName, email })

    // Get Gmail access token
    const accessToken = await getGmailAccessToken()

    const subject = "UC Investments Academy - Application Update"
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Update - UC Investments Academy</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); margin-top: 20px; margin-bottom: 20px;">
            
            <!-- Header -->
            <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #0066cc;">
              <h1 style="color: #0066cc; margin: 0; font-size: 28px;">UC Investments Academy</h1>
              <p style="color: #666; margin: 5px 0 0 0; font-size: 16px;">Application Update</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 30px 0;">
              <h2 style="color: #333; margin-top: 0;">Dear ${firstName} ${lastName},</h2>
              
              <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
                Thank you for your interest in the UC Investments Academy and for taking the time to submit your application.
              </p>
              
              <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
                After careful review of all applications, we regret to inform you that we are unable to offer you a position in this cohort of the UC Investments Academy. The selection process was highly competitive, and we received many exceptional applications.
              </p>
              
              <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
                We encourage you to continue developing your finance and investment knowledge, and we invite you to apply for future cohorts as the program expands.
              </p>
              
              <p style="color: #555; font-size: 16px; margin-bottom: 30px;">
                Thank you again for your interest in the UC Investments Academy. We wish you the best in your academic and professional endeavors.
              </p>
              
              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                <p style="color: #666; font-size: 14px; margin: 0;">
                  <strong>UC Investments Academy Team</strong><br>
                  University of California Office of the President
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #888; font-size: 12px;">
              <p style="margin: 0;">© 2024 UC Investments Academy. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send the email
    const result = await sendGmailEmail(accessToken, email, subject, htmlContent)

    console.log('Email sent successfully:', result)

    return new Response(JSON.stringify({
      success: true,
      messageId: result.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    })
  } catch (error: any) {
    console.error("Error in gmail-send-application-denial function:", error)
    return new Response(
      JSON.stringify({ 
        error: "Failed to send denial email", 
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    )
  }
}

serve(handler)