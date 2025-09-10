import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

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