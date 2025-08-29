import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UpdateStatusRequest {
  applicationId: string;
  newStatus: 'approved' | 'rejected';
  applicantName: string;
  email?: string;
  adminComment?: string;
  adminToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Update application status function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { applicationId, newStatus, applicantName, email, adminComment, adminToken }: UpdateStatusRequest = await req.json();
    console.log(`Processing status update: ${applicationId} to ${newStatus}`);

    if (!adminToken) {
      console.error('No admin token provided');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Simple admin token validation (matching get-admin-applications pattern)
    if (!adminToken || adminToken !== 'admin-access-token') {
      console.error('Invalid admin token provided');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Admin authenticated successfully');

    // Get application data
    const { data: applicationData, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (fetchError || !applicationData) {
      console.error('Application not found:', fetchError);
      return new Response(JSON.stringify({ error: 'Application not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Application found:', applicationData.first_name, applicationData.last_name);

    if (newStatus === 'rejected') {
      // Update application status to rejected
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminToken,
          admin_comment: adminComment
        })
        .eq('id', applicationId);

      if (updateError) {
        console.error('Error updating application to rejected:', updateError);
        throw updateError;
      }

      // Send rejection email if email provided
      if (email) {
        try {
          const { error: emailError } = await supabase.functions.invoke('gmail-send-application-denial', {
            body: {
              firstName: applicationData.first_name,
              lastName: applicationData.last_name,
              email: email,
              reason: adminComment
            }
          });

          if (emailError) {
            console.error('Error sending rejection email:', emailError);
          } else {
            console.log('Rejection email sent successfully');
          }
        } catch (emailError) {
          console.error('Failed to send rejection email:', emailError);
        }
      }

      return new Response(JSON.stringify({ success: true, message: 'Application rejected successfully' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (newStatus === 'approved') {
      // Generate temporary credentials
      const tempUsername = `${applicationData.first_name.toLowerCase()}.${applicationData.last_name.toLowerCase()}`;
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

      console.log('Generated temp credentials for:', tempUsername);

      // Update application status to approved
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminToken
        })
        .eq('id', applicationId);

      if (updateError) {
        console.error('Error updating application to approved:', updateError);
        throw updateError;
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          first_name: applicationData.first_name,
          last_name: applicationData.last_name,
          email: applicationData.email,
          username: tempUsername,
          temp_password: tempPassword,
          is_temp_password_used: false,
          uc_campus: applicationData.uc_campus,
          major: applicationData.major,
          graduation_year: applicationData.graduation_year,
          gpa: applicationData.gpa,
          linkedin_url: applicationData.linkedin_url
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        throw profileError;
      }

      console.log('User profile created successfully');

      // Send approval email
      try {
        const { error: emailError } = await supabase.functions.invoke('gmail-send-application-approval', {
          body: {
            firstName: applicationData.first_name,
            lastName: applicationData.last_name,
            email: applicationData.email,
            tempUsername: tempUsername,
            tempPassword: tempPassword
          }
        });

        if (emailError) {
          console.error('Error sending approval email:', emailError);
        } else {
          console.log('Approval email sent successfully');
        }
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Application approved successfully',
        tempUsername,
        tempPassword 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid status' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in update-application-status function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);