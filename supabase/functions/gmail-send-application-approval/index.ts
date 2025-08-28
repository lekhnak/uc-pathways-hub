import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApprovalEmailRequest {
  firstName: string;
  lastName: string;
  email: string;
  tempUsername: string;
  tempPassword: string;
  program: string;
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

  // Use TextEncoder to properly handle Unicode characters
  const encoder = new TextEncoder();
  const encodedBytes = encoder.encode(emailContent);
  const base64String = btoa(String.fromCharCode(...encodedBytes));
  const encodedEmail = base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

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
    const { firstName, lastName, email, tempUsername, tempPassword, program }: ApprovalEmailRequest = await req.json();

    console.log("Sending application approval email:", { email, program });

    const accessToken = await getGmailAccessToken();
    const loginUrl = `${Deno.env.get("SITE_URL") || "https://wotqxwqlmjcnrckfjgno.supabase.co"}/auth`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Approved - UC Investment Academy</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; margin-top: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin: 0; font-size: 28px;">UC Investment Academy</h1>
            <p style="color: #64748b; margin: 10px 0 0 0; font-size: 16px;">Excellence in Investment Education</p>
          </div>
          
          <div style="padding: 20px; background-color: #f0fdf4; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
            <h2 style="color: #065f46; margin-top: 0; display: flex; align-items: center;">
              🎉 Congratulations ${firstName} ${lastName}!
            </h2>
            <p style="color: #047857; line-height: 1.6; font-size: 16px; margin: 0;">
              We are thrilled to inform you that your application to the <strong>${program}</strong> program has been <strong>APPROVED</strong>!
            </p>
          </div>

          <div style="padding: 20px; background-color: #eff6ff; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e40af; margin-top: 0;">Your Account Details</h3>
            <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <p style="color: #374151; margin: 5px 0;"><strong>Username:</strong> ${tempUsername}</p>
              <p style="color: #374151; margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background-color: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${tempPassword}</code></p>
              <p style="color: #374151; margin: 5px 0;"><strong>Program:</strong> ${program}</p>
            </div>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${loginUrl}" 
                 style="display: inline-block; padding: 12px 30px; background-color: #1e40af; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Access Your Account
              </a>
            </div>
          </div>

          <div style="padding: 15px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
            <h4 style="color: #92400e; margin: 0 0 10px 0;">🔒 Important Security Information</h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Please change your password immediately after your first login</li>
              <li>Keep your login credentials secure and do not share them</li>
              <li>If you experience any login issues, contact our support team</li>
            </ul>
          </div>

          <div style="padding: 20px;">
            <h3 style="color: #334155; margin-top: 0;">What's Next?</h3>
            <div style="display: grid; gap: 15px;">
              <div style="padding: 15px; border: 1px solid #e5e7eb; border-radius: 6px;">
                <h4 style="color: #1e40af; margin: 0 0 8px 0;">📚 Complete Your Profile</h4>
                <p style="color: #475569; margin: 0; font-size: 14px;">Update your personal information and preferences</p>
              </div>
              <div style="padding: 15px; border: 1px solid #e5e7eb; border-radius: 6px;">
                <h4 style="color: #1e40af; margin: 0 0 8px 0;">🎯 Start Learning</h4>
                <p style="color: #475569; margin: 0; font-size: 14px;">Access your curriculum and begin your investment education journey</p>
              </div>
              <div style="padding: 15px; border: 1px solid #e5e7eb; border-radius: 6px;">
                <h4 style="color: #1e40af; margin: 0 0 8px 0;">🤝 Connect with Mentors</h4>
                <p style="color: #475569; margin: 0; font-size: 14px;">Join our mentorship program and network with industry professionals</p>
              </div>
            </div>
          </div>

          <div style="text-align: center; padding: 20px; background-color: #f8fafc; border-radius: 8px; margin-top: 30px;">
            <h3 style="color: #334155; margin-top: 0;">Welcome to the UC Investment Academy Family!</h3>
            <p style="color: #475569; margin-bottom: 15px;">We're excited to support your journey in investment education and career development.</p>
            <p style="color: #475569; margin: 0; font-size: 14px;">
              Questions? Contact us at 
              <a href="mailto:support@ucinvestmentacademy.com" style="color: #1e40af; text-decoration: none;">support@ucinvestmentacademy.com</a>
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
      `🎉 Application Approved - Welcome to ${program}!`,
      htmlContent
    );

    console.log("Application approval email sent successfully:", result);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Application approval email sent successfully",
      messageId: result.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in gmail-send-application-approval function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send approval email", 
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