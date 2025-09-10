import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { username, password } = await req.json();

    // Get the stored hash for this user
    const { data: adminUser, error } = await supabaseClient
      .from('admin_users')
      .select('password_hash, username')
      .eq('username', username)
      .single();

    if (error || !adminUser) {
      return new Response(JSON.stringify({
        error: 'User not found',
        details: error?.message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }

    console.log(`Testing password for user: ${username}`);
    console.log(`Stored hash: ${adminUser.password_hash}`);
    console.log(`Password to test: ${password}`);

    // Test with bcryptjs
    let bcryptResult = false;
    let bcryptError = null;
    try {
      const bcrypt = await import("https://esm.sh/bcryptjs@2.4.3");
      bcryptResult = await bcrypt.compare(password, adminUser.password_hash);
      console.log(`Bcryptjs result: ${bcryptResult}`);
    } catch (error) {
      bcryptError = error.message;
      console.error('Bcryptjs error:', error);
    }

    // Test with bcrypt (Deno)
    let denoResult = false;
    let denoError = null;
    try {
      const bcrypt = await import("https://deno.land/x/bcrypt@v0.4.1/mod.ts");
      denoResult = await bcrypt.compare(password, adminUser.password_hash);
      console.log(`Deno bcrypt result: ${denoResult}`);
    } catch (error) {
      denoError = error.message;
      console.error('Deno bcrypt error:', error);
    }

    return new Response(JSON.stringify({
      username,
      hashFormat: adminUser.password_hash.substring(0, 10) + '...',
      bcryptjs: { result: bcryptResult, error: bcryptError },
      denoBcrypt: { result: denoResult, error: denoError },
      testSuccessful: bcryptResult || denoResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Test function error:', error);
    return new Response(JSON.stringify({
      error: 'Test failed',
      details: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});