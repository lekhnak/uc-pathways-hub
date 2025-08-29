import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LoginRequest {
  email: string
  password: string
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { email, password }: LoginRequest = await req.json()

    console.log('Processing login request for email:', email)

    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    // Find the profile with matching email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, password, first_name, last_name, user_id')
      .eq('email', email)
      .maybeSingle()

    if (profileError || !profile) {
      console.error('Profile not found:', profileError)
      throw new Error('Invalid email or password')
    }

    // Check if user has an approved application
    const { data: applicationData, error: appError } = await supabase
      .from('applications')
      .select('status')
      .eq('email', email)
      .eq('status', 'approved')
      .single()

    if (appError || !applicationData) {
      throw new Error('Only users with approved applications can sign in. Please wait for your application to be reviewed.')
    }

    // Validate password
    if (profile.password !== password) {
      console.error('Password mismatch for user:', email)
      throw new Error('Invalid email or password')
    }

    console.log('Login successful for:', email)

    return new Response(JSON.stringify({ 
      success: true, 
      user: {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })

  } catch (error: any) {
    console.error('Error in profile-login function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred' 
      }),
      {
        status: 400,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    )
  }
}

serve(handler)