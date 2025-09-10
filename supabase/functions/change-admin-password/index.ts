import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Crypto utilities for password hashing - matching admin-login function
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const saltArray = Array.from(salt);
  const combined = saltArray.concat(hashArray);
  return btoa(String.fromCharCode.apply(null, combined));
}

// Secure password verification - matching admin-login function
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    if (hash.startsWith('$2')) {
      // Legacy bcrypt hash - use scrypt for Deno compatibility
      const scrypt = await import("https://deno.land/x/scrypt@v4.4.4/mod.ts");
      return await scrypt.verify(password, hash);
    } else if (hash.length > 20) {
      // Web Crypto hash
      const encoder = new TextEncoder();
      const combined = Uint8Array.from(atob(hash), c => c.charCodeAt(0));
      const salt = combined.slice(0, 16);
      const storedHash = combined.slice(16);
      
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );
      
      const hashBuffer = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        256
      );
      
      const hashArray = new Uint8Array(hashBuffer);
      return hashArray.every((byte, index) => byte === storedHash[index]);
    } else {
      // Plain text - direct comparison (for migration only)
      return password === hash;
    }
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

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

  console.log('change-admin-password function called');
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { adminId, currentPassword, newPassword }: ChangePasswordRequest = await req.json();
    console.log('Password change request for admin:', adminId);

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

    // Verify current password using the same method as admin-login
    const isCurrentPasswordValid = await verifyPassword(currentPassword, adminUser.password_hash);
    
    if (!isCurrentPasswordValid) {
      console.log('Current password verification failed for admin:', adminId);
      return new Response(
        JSON.stringify({ success: false, error: 'Current password is incorrect' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Hash new password using the same method as admin-login
    const hashedNewPassword = await hashPassword(newPassword);

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