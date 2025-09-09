import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LoginRequest {
  username: string;
  password: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Admin login function called - v2.0');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { username, password }: LoginRequest = await req.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Username and password are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Admin login attempt for username: ${username}`);
    console.log('Password received:', password);

    // Fetch admin user from database
    const { data: adminUser, error: fetchError } = await supabaseClient
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .single();

    if (fetchError || !adminUser) {
      console.log('Admin user not found:', fetchError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid credentials' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Admin user found:', adminUser.username);
    console.log('Stored password hash:', adminUser.password_hash);

    console.log('Attempting password verification against stored hash...');
    
    let isValidPassword = false;
    
    // Check password format and use appropriate verification method
    if (adminUser.password_hash.startsWith('$scrypt$')) {
      // Handle scrypt hashed passwords
      console.log('Using scrypt verification');
      const crypto = await import("https://deno.land/std@0.190.0/node/crypto.ts");
      try {
        isValidPassword = crypto.scryptSync(password, '', 64).toString('base64') === adminUser.password_hash.split('$').pop();
      } catch (error) {
        // If scrypt fails, this might be a complex scrypt format, skip for now
        console.log('Scrypt verification failed, trying direct comparison');
        isValidPassword = false;
      }
    } else if (adminUser.password_hash.startsWith('$2b$') || adminUser.password_hash.startsWith('$2a$')) {
      // Handle bcrypt hashed passwords
      console.log('Using bcrypt verification');
      const bcrypt = await import("https://deno.land/x/bcrypt@v0.4.1/mod.ts");
      isValidPassword = await bcrypt.compareSync(password, adminUser.password_hash);
    } else {
      // Handle plain text passwords (legacy)
      console.log('Using plain text comparison');
      isValidPassword = password === adminUser.password_hash;
    }
    
    console.log('Password verification result:', isValidPassword);

    if (!isValidPassword) {
      console.log('Invalid password for admin user:', username);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid credentials' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Admin login successful for:', username);

    // Return successful authentication with user data (excluding password hash)
    const { password_hash, password_salt, ...safeAdminUser } = adminUser;
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        adminUser: safeAdminUser 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in admin-login function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Authentication failed' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);