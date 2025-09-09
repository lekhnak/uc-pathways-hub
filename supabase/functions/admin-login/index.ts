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

    console.log('Attempting password verification...');
    
    let isValidPassword = false;
    const bcrypt = await import("https://deno.land/x/bcrypt@v0.4.1/mod.ts");
    
    // Check if password is already hashed (starts with $2b$ or $2a$) or plain text
    if (adminUser.password_hash.startsWith('$2b$') || adminUser.password_hash.startsWith('$2a$')) {
      console.log('Verifying against bcrypt hash...');
      // Use async compare function correctly
      isValidPassword = await bcrypt.compare(password, adminUser.password_hash);
    } else {
      console.log('Plain text password detected, verifying and will hash...');
      // Plain text password - verify and then hash it
      isValidPassword = password === adminUser.password_hash;
      
      if (isValidPassword) {
        console.log('Password verified, hashing for future use...');
        // Hash the password for future use
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Update the password in database
        await supabaseClient
          .from('admin_users')
          .update({ password_hash: hashedPassword })
          .eq('username', username);
          
        console.log('Password hashed and updated in database');
      }
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