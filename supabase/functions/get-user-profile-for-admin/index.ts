import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GetProfileRequest {
  email: string;
  adminToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Get user profile for admin function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, adminToken }: GetProfileRequest = await req.json();
    console.log(`Getting profile for email: ${email}`);

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

    // Get user profile data using service key (bypasses RLS)
    const { data: profileData, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError) {
      console.error('Profile not found:', fetchError);
      return new Response(JSON.stringify({ error: 'Profile not found', details: fetchError }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Profile found:', profileData.first_name, profileData.last_name);

    return new Response(JSON.stringify({ 
      success: true, 
      profile: profileData
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-user-profile-for-admin function:', error);
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