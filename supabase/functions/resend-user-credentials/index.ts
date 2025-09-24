import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResendCredentialsRequest {
  userId: string;
  adminToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Resend user credentials function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, adminToken }: ResendCredentialsRequest = await req.json();
    console.log(`Resending credentials for user ID: ${userId}`);

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

    // Simple admin token validation
    if (!adminToken || adminToken !== 'admin-access-token') {
      console.error('Invalid admin token provided');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Admin authenticated successfully');

    // Get user profile data
    const { data: profileData, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError || !profileData) {
      console.error('User profile not found:', fetchError);
      return new Response(JSON.stringify({ error: 'User profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User profile found:', profileData.first_name, profileData.last_name);

    // Check if user has credentials to resend
    if (!profileData.username || !profileData.temp_password) {
      console.error('User missing credentials');
      return new Response(JSON.stringify({ error: 'User missing credentials' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send credentials email
    try {
      const { error: emailError } = await supabase.functions.invoke('send-application-approval', {
        body: {
          firstName: profileData.first_name,
          lastName: profileData.last_name,
          email: profileData.email,
          tempUsername: profileData.username,
          tempPassword: profileData.temp_password
        }
      });

      if (emailError) {
        console.error('Error sending credentials email:', emailError);
        throw emailError;
      } else {
        console.log('Credentials email sent successfully');
      }
    } catch (emailError) {
      console.error('Failed to send credentials email:', emailError);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Credentials email sent successfully'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in resend-user-credentials function:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);