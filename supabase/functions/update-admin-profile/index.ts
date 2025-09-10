import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateProfileRequest {
  adminId: string;
  email: string;
  full_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('update-admin-profile function called');
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { adminId, email, full_name }: UpdateProfileRequest = await req.json();
    console.log('Updating profile for admin:', adminId, { email, full_name });

    // Update admin user profile using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('admin_users')
      .update({
        email,
        full_name,
        updated_at: new Date().toISOString()
      })
      .eq('id', adminId)
      .select()
      .single();

    if (error) {
      console.error('Error updating admin profile:', error);
      throw new Error('Failed to update profile');
    }

    console.log('Admin profile updated successfully:', data.id);

    return new Response(
      JSON.stringify({ success: true, adminUser: data }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error in update-admin-profile function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);