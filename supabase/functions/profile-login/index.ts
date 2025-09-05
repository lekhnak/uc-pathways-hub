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

    // Check if user has an approved application (case-insensitive)
    const { data: applicationData, error: appError } = await supabase
      .from('applications')
      .select('status, first_name, last_name')
      .ilike('email', email)
      .eq('status', 'approved')
      .single()

    if (appError || !applicationData) {
      throw new Error('Only users with approved applications can sign in. Please wait for your application to be reviewed.')
    }

    // Find the profile with matching email (case-insensitive)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, password, first_name, last_name, user_id, temp_password')
      .ilike('email', email)
      .maybeSingle()

    // If profile exists, validate password
    if (profile) {
      const isValidPassword = profile.password === password || profile.temp_password === password;
      
      if (!isValidPassword) {
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
    }

    // If no profile exists but application is approved, allow login with application data
    console.log('No profile found, but application is approved. Allowing login for:', email)

    return new Response(JSON.stringify({ 
      success: true, 
      user: {
        id: applicationData.first_name + applicationData.last_name + email, // temporary ID
        email: email,
        firstName: applicationData.first_name,
        lastName: applicationData.last_name
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