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

interface CreateAdminRequest {
  username: string;
  full_name: string;
  email: string;
  password: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('create-admin-user function called');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { username, full_name, email, password }: CreateAdminRequest = await req.json();
    console.log('Creating admin user:', { username, full_name, email });

    // Hash the password using the same method as admin-login
    const hashedPassword = await hashPassword(password);

    // Insert new admin user
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        username,
        full_name,
        email,
        password_hash: hashedPassword
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating admin user:', error);
      
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ success: false, error: 'Username or email already exists' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
      
      throw new Error('Failed to create administrator');
    }

    console.log('Admin user created successfully:', data.id);

    return new Response(
      JSON.stringify({ success: true, adminUser: data }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error in create-admin-user function:', error);
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