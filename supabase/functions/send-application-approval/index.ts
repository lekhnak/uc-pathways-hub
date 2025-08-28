import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ApprovalEmailRequest {
  firstName: string;
  lastName: string;
  email: string;
  tempUsername: string;
  tempPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email, tempUsername, tempPassword }: ApprovalEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "UC Investment Academy <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to UC Investment Academy - Application Approved!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a365d; margin-bottom: 10px;">UC Investment Academy</h1>
            <p style="color: #666; font-size: 16px;">Professional Finance Education</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 10px 0; font-size: 28px;">Congratulations, ${firstName}!</h2>
            <p style="margin: 0; font-size: 18px; opacity: 0.9;">Your application has been approved!</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #1a365d; margin-top: 0;">Your Login Credentials</h3>
            <p style="color: #666; margin-bottom: 20px;">Use these credentials to access your student dashboard:</p>
            
            <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea;">
              <p style="margin: 5px 0;"><strong>Username:</strong> <code style="background: #f1f3f4; padding: 2px 6px; border-radius: 3px;">${tempUsername}</code></p>
              <p style="margin: 5px 0;"><strong>Password:</strong> <code style="background: #f1f3f4; padding: 2px 6px; border-radius: 3px;">${tempPassword}</code></p>
            </div>
            
            <p style="color: #e74c3c; font-size: 14px; margin-top: 15px; margin-bottom: 0;">
              <strong>Important:</strong> Please change your password after your first login for security purposes.
            </p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1a365d;">What's Next?</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>Log in to your student dashboard using the credentials above</li>
              <li>Complete your profile setup</li>
              <li>Explore available learning modules and career pathways</li>
              <li>Connect with mentors and fellow students</li>
              <li>Start building your professional network</li>
            </ul>
          </div>
          
          <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <p style="color: #666; margin: 0 0 15px 0;">Ready to get started?</p>
            <a href="${Deno.env.get('SUPABASE_URL') || 'https://ucinvestmentacademy.com'}/auth" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Access Your Dashboard
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              Welcome to the UC Investment Academy community!<br>
              If you have any questions, please don't hesitate to reach out to our support team.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Approval email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-application-approval function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);