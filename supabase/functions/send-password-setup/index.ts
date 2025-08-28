import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const smtpClient = new SMTPClient({
  connection: {
    hostname: "smtp.gmail.com",
    port: 587,
    tls: true,
    auth: {
      username: Deno.env.get("GMAIL_USER")!,
      password: Deno.env.get("GMAIL_PASS")!,
    },
  },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordSetupRequest {
  firstName: string;
  lastName: string;
  email: string;
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log(`Received ${req.method} request to send-password-setup`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { 
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  try {
    console.log("Parsing request body...");
    const { firstName, lastName, email, token }: PasswordSetupRequest = await req.json();
    console.log(`Processing password setup email for: ${email}`);

    const setupUrl = `https://preview--uc-pathways-hub.lovable.app/set-password?token=${token}`;
    console.log(`Setup URL: ${setupUrl}`);

    console.log("Connecting to Gmail SMTP...");
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-top: 40px; margin-bottom: 40px; }
          .header { text-align: center; margin-bottom: 40px; }
          .logo { background-color: #3b82f6; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
          .title { color: #1e293b; font-size: 28px; font-weight: bold; margin: 0; }
          .subtitle { color: #64748b; font-size: 16px; margin: 8px 0 0 0; }
          .greeting { font-size: 18px; margin-bottom: 24px; }
          .content { margin-bottom: 32px; }
          .button { display: inline-block; background-color: #3b82f6; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; text-align: center; margin: 20px 0; }
          .button:hover { background-color: #2563eb; }
          .security-notice { background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin: 24px 0; }
          .security-notice h4 { color: #92400e; margin: 0 0 8px 0; font-size: 14px; font-weight: 600; }
          .security-notice p { color: #92400e; margin: 0; font-size: 14px; }
          .footer { border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 40px; text-align: center; color: #64748b; font-size: 14px; }
          .requirements { background-color: #f1f5f9; border-radius: 6px; padding: 20px; margin: 20px 0; }
          .requirements h4 { color: #1e293b; margin: 0 0 12px 0; font-size: 16px; }
          .requirements ul { margin: 0; padding-left: 20px; }
          .requirements li { margin-bottom: 6px; color: #475569; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">UC</div>
            <h1 class="title">Welcome to UC Investment Academy</h1>
            <p class="subtitle">Your learning journey starts here</p>
          </div>
          
          <div class="content">
            <p class="greeting">Hi ${firstName},</p>
            
            <p>Congratulations! You've been enrolled in the UC Investment Academy. To get started, you'll need to set up your password for your new account.</p>
            
            <p>Your account email: <strong>${email}</strong></p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${setupUrl}" class="button">Set Your Password</a>
            </div>
            
            <div class="requirements">
              <h4>Password Requirements:</h4>
              <ul>
                <li>At least 8 characters long</li>
                <li>Include at least one number</li>
                <li>Include at least one special character (!@#$%^&*)</li>
                <li>Passwords must match when confirmed</li>
              </ul>
            </div>
            
            <div class="security-notice">
              <h4>🔒 Security Notice</h4>
              <p>This password setup link expires in 24 hours for your security. If you don't set your password within this time, please contact an administrator for a new link.</p>
            </div>
            
            <p>Once you've set your password, you'll have access to:</p>
            <ul>
              <li>Learning modules and career pathways</li>
              <li>Certification programs</li>
              <li>Internship and job opportunities</li>
              <li>Mentorship matching</li>
              <li>UC partner company connections</li>
            </ul>
            
            <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
            
            <p>Welcome to the team!</p>
            <p><strong>The UC Investment Academy Team</strong></p>
          </div>
          
          <div class="footer">
            <p>UC Investment Academy | University of California</p>
            <p>If you didn't expect this email, please ignore it or contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log("Attempting to send email via Gmail SMTP...");
    
    await smtpClient.send({
      from: "UC Investment Academy <uc.investment.academy@gmail.com>",
      to: email,
      subject: "Set Your Password - UC Investment Academy",
      html: htmlContent,
    });

    console.log("Password setup email sent successfully via Gmail SMTP");

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Password setup email sent successfully",
      setupUrl: setupUrl 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-setup function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);