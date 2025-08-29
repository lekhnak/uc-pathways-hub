import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RevokeAccessRequest {
  applicationId: string;
  adminToken: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Revoke access function called');
    
    const { applicationId, adminToken, email }: RevokeAccessRequest = await req.json();
    
    console.log('Processing revoke request for application:', applicationId, 'email:', email);

    // Validate admin token
    if (adminToken !== 'admin-access-token') {
      console.log('Invalid admin token provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Admin authenticated successfully');

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Step 1: Look up profile by email
    console.log('Step 1: Looking up profile for email:', email);
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', email)
      .single();

    console.log('Profile lookup result:', profileData, 'Error:', profileError);

    let userId: string | null = null;
    if (profileData && !profileError) {
      userId = profileData.user_id;
      console.log('Found profile with user_id:', userId);
    } else {
      console.log('No profile found for email:', email);
    }

    // Step 2: Delete profile if it exists
    if (userId) {
      console.log('Step 2: Deleting profile for user_id:', userId);
      
      const { error: deleteProfileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (deleteProfileError) {
        console.error('Error deleting profile:', deleteProfileError);
        throw new Error(`Failed to delete profile: ${deleteProfileError.message}`);
      } else {
        console.log('Profile deleted successfully');
      }

      // Step 3: Delete Supabase auth user
      console.log('Step 3: Deleting auth user:', userId);
      
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
      
      if (deleteAuthError) {
        console.error('Error deleting auth user:', deleteAuthError);
        // Don't throw here as we still want to delete the application
        console.log('Continuing despite auth user deletion error...');
      } else {
        console.log('Auth user deleted successfully');
      }
    }

    // Step 4: Delete application record
    console.log('Step 4: Deleting application:', applicationId);
    
    const { error: deleteAppError } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicationId);

    if (deleteAppError) {
      console.error('Error deleting application:', deleteAppError);
      throw new Error(`Failed to delete application: ${deleteAppError.message}`);
    } else {
      console.log('Application deleted successfully');
    }

    console.log('Revoke access completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Access revoked and application deleted successfully',
        deletedProfile: !!userId,
        deletedApplication: true
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error('Error in revoke access function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
};

serve(handler);