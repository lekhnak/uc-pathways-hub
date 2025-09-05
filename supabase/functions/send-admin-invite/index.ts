import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AdminInviteRequest {
  email: string;
  full_name: string;
  username: string;
  tempPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, full_name, username, tempPassword }: AdminInviteRequest = await req.json();

    console.log('Sending admin invite to:', email);

    const loginUrl = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app') || 'https://your-app.lovable.app'}/admin/auth`;

    const emailResponse = await resend.emails.send({
      from: "UC Investment Academy <noreply@ucia.edu>",
      to: [email],
      subject: "Administrator Account Created - UC Investment Academy",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Administrator Account Created</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px; text-align: center;">UC Investment Academy</h1>
            <h2 style="color: #1e40af; margin-bottom: 20px; text-align: center;">Administrator Account Created</h2>
          </div>

          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${full_name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Welcome to the UC Investment Academy admin panel! An administrator account has been created for you.
            </p>

            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-bottom: 15px;">Your Login Credentials:</h3>
              <p style="margin: 8px 0;"><strong>Username:</strong> ${username}</p>
              <p style="margin: 8px 0;"><strong>Temporary Password:</strong> <code style="background-color: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Access Admin Panel
              </a>
            </div>

            <div style="background-color: #fef3cd; border: 1px solid #f6d55c; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-weight: bold;">Important Security Notice:</p>
              <ul style="color: #92400e; margin: 10px 0; padding-left: 20px;">
                <li>Please change your password after your first login</li>
                <li>Keep your credentials secure and do not share them</li>
                <li>Contact the system administrator if you experience any issues</li>
              </ul>
            </div>

            <p style="font-size: 16px; margin-bottom: 20px;">
              If you have any questions or need assistance, please contact the system administrator.
            </p>

            <p style="font-size: 16px; margin-bottom: 5px;">Best regards,</p>
            <p style="font-size: 16px; font-weight: bold; color: #2563eb;">UC Investment Academy Team</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 14px; color: #6b7280; margin: 0;">
              This is an automated message from UC Investment Academy Admin System.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Admin invite email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-admin-invite function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);