import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApplicationConfirmationRequest {
  firstName: string;
  lastName: string;
  email: string;
  program: string;
  applicationId: string;
}

const getGmailAccessToken = async () => {
  const clientId = Deno.env.get("GMAIL_CLIENT_ID");
  const clientSecret = Deno.env.get("GMAIL_CLIENT_SECRET");
  const refreshToken = Deno.env.get("GMAIL_REFRESH_TOKEN");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      refresh_token: refreshToken!,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();
  return data.access_token;
};

const sendGmailEmail = async (accessToken: string, to: string, subject: string, htmlContent: string) => {
  const fromEmail = Deno.env.get("GMAIL_USER") || "noreply@ucinvestmentacademy.com";
  
  const emailContent = [
    `From: UC Investment Academy <${fromEmail}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    ``,
    htmlContent,
  ].join("\r\n");

  const encodedEmail = btoa(emailContent).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      raw: encodedEmail,
    }),
  });

  return response.json();
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email, program, applicationId }: ApplicationConfirmationRequest = await req.json();

    console.log("Sending application confirmation email:", { email, program });

    const accessToken = await getGmailAccessToken();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Confirmation - UC Investment Academy</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; margin-top: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin: 0; font-size: 28px;">UC Investment Academy</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #334155; margin-top: 0;">Application Received!</h2>
            <p style="color: #475569; line-height: 1.6; margin: 0;">
              Dear ${firstName} ${lastName},
            </p>
            <p style="color: #475569; line-height: 1.6;">
              Thank you for submitting your application to the <strong>${program}</strong> program. We have successfully received your application and it is now under review.
            </p>
          </div>

          <div style="padding: 20px; border-left: 4px solid #1e40af; background-color: #eff6ff; margin-bottom: 20px;">
            <h3 style="color: #1e40af; margin-top: 0;">Application Details</h3>
            <ul style="color: #475569; padding-left: 20px;">
              <li><strong>Application ID:</strong> ${applicationId}</li>
              <li><strong>Program:</strong> ${program}</li>
              <li><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</li>
              <li><strong>Status:</strong> Under Review</li>
            </ul>
          </div>

          <div style="padding: 20px;">
            <h3 style="color: #334155; margin-top: 0;">What Happens Next?</h3>
            <ol style="color: #475569; line-height: 1.8; padding-left: 20px;">
              <li>Our admissions team will review your application materials</li>
              <li>You may be contacted for additional information or an interview</li>
              <li>Final decisions will be communicated within 2-3 weeks</li>
              <li>If accepted, you'll receive detailed program information and next steps</li>
            </ol>
          </div>

          <div style="text-align: center; padding: 20px; background-color: #f1f5f9; border-radius: 8px; margin-top: 30px;">
            <p style="color: #475569; margin: 0; font-size: 14px;">
              If you have any questions, please contact us at 
              <a href="mailto:admissions@ucinvestmentacademy.com" style="color: #1e40af; text-decoration: none;">admissions@ucinvestmentacademy.com</a>
            </p>
            <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 12px;">
              © 2024 UC Investment Academy. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendGmailEmail(
      accessToken,
      email,
      `Application Confirmation - ${program}`,
      htmlContent
    );

    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Application confirmation email sent successfully",
      messageId: result.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in gmail-send-application-confirmation function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send email", 
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);