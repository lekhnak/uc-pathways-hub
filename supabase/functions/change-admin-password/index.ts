import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChangePasswordRequest {
  adminId: string;
  currentPassword: string;
  newPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { adminId, currentPassword, newPassword }: ChangePasswordRequest = await req.json();

    // Get current admin user
    const { data: adminUser, error: fetchError } = await supabase
      .from('admin_users')
      .select('password_hash')
      .eq('id', adminId)
      .single();

    if (fetchError) {
      console.error('Error fetching admin user:', fetchError);
      throw new Error('Admin user not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, adminUser.password_hash);
    
    if (!isCurrentPasswordValid) {
      return new Response(
        JSON.stringify({ success: false, error: 'Current password is incorrect' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({
        password_hash: hashedNewPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', adminId);

    if (updateError) {
      console.error('Error updating password:', updateError);
      throw new Error('Failed to update password');
    }

    console.log('Password changed successfully for admin:', adminId);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error in change-admin-password function:', error);
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