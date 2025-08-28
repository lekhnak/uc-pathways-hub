import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ApplicationConfirmationRequest {
  firstName: string;
  lastName: string;
  email: string;
  ucCampus: string;
  applicationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing application confirmation email request");
    
    const { firstName, lastName, email, ucCampus, applicationId }: ApplicationConfirmationRequest = await req.json();

    console.log(`Sending confirmation email to ${email} for application ${applicationId}`);

    const emailResponse = await resend.emails.send({
      from: "UC Investments Academy <UCinvestmentsacademy@ucop.edu>",
      to: [email],
      subject: "UC Investments Academy - Application Confirmation",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UC Investments Academy - Application Confirmation</title>
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
            color: #1f2937;
            margin-bottom: 25px;
            font-weight: 500;
        }
        .message {
            font-size: 16px;
            margin-bottom: 30px;
            color: #374151;
        }
        .status-box {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border: 1px solid #bfdbfe;
            padding: 25px;
            margin: 30px 0;
            border-radius: 8px;
            text-align: center;
        }
        .status-box strong {
            color: #1e40af;
            font-size: 18px;
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
            .header p {
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">
                <div class="logo-text">UC<br>INVEST</div>
            </div>
            <h1>UC Investments Academy</h1>
            <p>Building the next generation of finance leaders</p>
        </div>

        <!-- Main Content -->
        <div class="content">
            <div class="greeting">Dear ${firstName},</div>
            
            <div class="message">
                Thank you for applying to UC Investments Academy. We're excited about your interest in joining our program.
            </div>

            <div class="status-box">
                <strong>Application Status:</strong><br>
                Your application is being reviewed and you will receive more updates soon!
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

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-application-confirmation function:", error);
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