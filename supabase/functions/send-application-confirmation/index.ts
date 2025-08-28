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
      from: "UC Investments Academy <onboarding@resend.dev>",
      to: [email],
      subject: "Application Received - UC Investments Academy",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0F9ED5; margin-bottom: 10px;">UC Investments Academy</h1>
            <h2 style="color: #333; font-weight: normal;">Application Confirmation</h2>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Dear ${firstName} ${lastName},</h3>
            <p style="color: #666; line-height: 1.6;">
              Thank you for submitting your application to the UC Investments Academy! We have successfully received your application and all required documents.
            </p>
          </div>

          <div style="margin-bottom: 20px;">
            <h4 style="color: #0F9ED5;">Application Summary:</h4>
            <ul style="color: #666; line-height: 1.8;">
              <li><strong>Name:</strong> ${firstName} ${lastName}</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>UC Campus:</strong> ${ucCampus}</li>
              <li><strong>Application ID:</strong> ${applicationId}</li>
              <li><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>
          </div>

          <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #0F9ED5; margin: 0; font-weight: 500;">
              📧 What happens next?
            </p>
            <p style="color: #666; margin: 10px 0 0 0; line-height: 1.6;">
              Our admissions team will carefully review your application and all submitted documents. You can expect to hear back from us within <strong>5-7 business days</strong> with updates on your application status.
            </p>
          </div>

          <div style="border-top: 1px solid #ddd; padding-top: 20px; text-align: center;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              If you have any questions about your application, please don't hesitate to contact us.
            </p>
            <p style="color: #0F9ED5; font-weight: 500; margin: 10px 0 0 0;">
              UC Investments Academy Team
            </p>
          </div>
        </div>
      `,
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