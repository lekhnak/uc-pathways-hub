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
      from: "UC Investments Academy <onboarding@resend.dev>",
      to: [email],
      subject: "UC Investments Academy - Congratulations!",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UC Investments Academy - Congratulations!</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #1fb6d4 0%, #0ea5e9 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
            position: relative;
        }
        .celebration {
            font-size: 48px;
            margin-bottom: 15px;
            opacity: 0.9;
        }
        .logo {
            width: 60px;
            height: 60px;
            background-color: white;
            border-radius: 12px;
            margin: 0 auto 20px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .logo-text {
            color: #1fb6d4;
            font-size: 12px;
            font-weight: 600;
            text-align: center;
            line-height: 1.2;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 32px;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        .header p {
            margin: 0;
            font-size: 18px;
            opacity: 0.95;
            font-weight: 300;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #1e3a8a;
            margin-bottom: 25px;
            font-weight: 500;
        }
        .congratulations {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px;
            margin: 25px 0;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
        }
        .congratulations h2 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 700;
        }
        .congratulations p {
            margin: 0;
            font-size: 18px;
            opacity: 0.95;
        }
        .message {
            font-size: 16px;
            margin-bottom: 25px;
            color: #374151;
        }
        .next-steps {
            background-color: #f0f9ff;
            border: 1px solid #bae6fd;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
        }
        .next-steps h3 {
            color: #0c4a6e;
            margin: 0 0 15px 0;
            font-size: 18px;
            font-weight: 600;
        }
        .next-steps ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .next-steps li {
            margin-bottom: 10px;
            color: #374151;
        }
        .contact-section {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
        }
        .contact-section h3 {
            color: #1f2937;
            margin: 0 0 15px 0;
            font-size: 18px;
            font-weight: 600;
        }
        .contact-section p {
            margin: 10px 0;
            color: #4b5563;
        }
        .contact-section a {
            color: #1fb6d4;
            text-decoration: none;
        }
        .contact-section a:hover {
            text-decoration: underline;
        }
        .signature {
            margin-top: 30px;
            font-size: 16px;
            color: #1f2937;
        }
        .button {
            display: inline-block;
            background-color: #10b981;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.3s ease;
            box-shadow: 0 3px 12px rgba(16, 185, 129, 0.3);
        }
        .button:hover {
            background-color: #059669;
            transform: translateY(-1px);
            box-shadow: 0 5px 20px rgba(16, 185, 129, 0.4);
        }
        @media (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }
            .header {
                padding: 30px 20px;
            }
            .header h1 {
                font-size: 28px;
            }
            .congratulations h2 {
                font-size: 24px;
            }
            .celebration {
                font-size: 36px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="celebration">🎉</div>
            <div class="logo">
                <div class="logo-text">UC<br>INVEST</div>
            </div>
            <h1>UC Investments Academy</h1>
            <p>Building the next generation of finance leaders</p>
        </div>

        <!-- Main Content -->
        <div class="content">
            <div class="greeting">Dear ${firstName},</div>
            
            <div class="congratulations">
                <h2>Congratulations!</h2>
                <p>You've been accepted to UC Investments Academy</p>
            </div>

            <div class="message">
                We're thrilled to welcome you to our program. Your application demonstrated exceptional potential, and we look forward to supporting your journey in finance and investment leadership.
            </div>

            <div style="text-align: center;">
                <a href="/set-password?token=${tempPassword}" class="button">Access Your Student Portal</a>
            </div>

            <div class="contact-section">
                <h3>Questions or need assistance?</h3>
                <p>Please contact <a href="mailto:UCinvestmentsacademy@ucop.edu">UCinvestmentsacademy@ucop.edu</a> if you have any questions or need technical support.</p>
                
                <div class="signature">
                    Thank you,<br>
                    <strong>UC Investments Academy Team</strong>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`,
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