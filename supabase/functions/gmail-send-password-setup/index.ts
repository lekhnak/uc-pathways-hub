import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordSetupRequest {
  firstName: string;
  lastName: string;
  email: string;
  token: string;
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
    const { firstName, lastName, email, token }: PasswordSetupRequest = await req.json();

    console.log("Sending password setup email to:", email);

    const accessToken = await getGmailAccessToken();
    const passwordSetupUrl = `${Deno.env.get("SUPABASE_URL")}/auth/v1/verify?token=${token}&type=recovery&redirect_to=${Deno.env.get("SITE_URL") || "https://wotqxwqlmjcnrckfjgno.supabase.co"}/set-password`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to UC Investment Academy - Set Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; margin-top: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin: 0; font-size: 28px;">UC Investment Academy</h1>
            <p style="color: #64748b; margin: 10px 0 0 0; font-size: 16px;">Welcome to Your Learning Journey</p>
          </div>
          
          <div style="padding: 20px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #334155; margin-top: 0;">Welcome ${firstName} ${lastName}!</h2>
            <p style="color: #475569; line-height: 1.6; margin: 0;">
              Congratulations! Your learner profile has been created successfully. You're now part of the UC Investment Academy community.
            </p>
          </div>

          <div style="padding: 20px; border-left: 4px solid #10b981; background-color: #f0fdf4; margin-bottom: 25px;">
            <h3 style="color: #065f46; margin-top: 0;">Complete Your Account Setup</h3>
            <p style="color: #047857; line-height: 1.6; margin-bottom: 20px;">
              To get started, you need to set up your password. Click the button below to create your secure password and access your learning dashboard.
            </p>
            <div style="text-align: center;">
              <a href="${passwordSetupUrl}" 
                 style="display: inline-block; padding: 12px 30px; background-color: #1e40af; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Set Up My Password
              </a>
            </div>
          </div>

          <div style="padding: 20px;">
            <h3 style="color: #334155; margin-top: 0;">What You'll Get Access To:</h3>
            <ul style="color: #475569; line-height: 1.8; padding-left: 20px;">
              <li><strong>Interactive Learning Modules:</strong> Comprehensive investment education content</li>
              <li><strong>Career Pathways:</strong> Structured learning paths for different investment careers</li>
              <li><strong>Mentorship Opportunities:</strong> Connect with industry professionals</li>
              <li><strong>Networking Events:</strong> Join exclusive UC Investment Academy events</li>
              <li><strong>Certification Programs:</strong> Earn recognized credentials in finance</li>
            </ul>
          </div>

          <div style="padding: 15px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>Important:</strong> This password setup link will expire in 24 hours for security reasons. Please complete your setup as soon as possible.
            </p>
          </div>

          <div style="text-align: center; padding: 20px; background-color: #f1f5f9; border-radius: 8px; margin-top: 30px;">
            <p style="color: #475569; margin: 0; font-size: 14px;">
              Need help? Contact our support team at 
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
      "Welcome to UC Investment Academy - Set Up Your Password",
      htmlContent
    );

    console.log("Password setup email sent successfully:", result);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Password setup email sent successfully",
      messageId: result.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in gmail-send-password-setup function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send password setup email", 
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