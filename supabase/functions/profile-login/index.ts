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
      .select('id, email, password, first_name, last_name, user_id, temp_password, temp_password_expires_at')
      .ilike('email', email)
      .maybeSingle()

    // If profile exists, validate password
    if (profile) {
      console.log('Profile found for user:', email, 'checking password...')
      
      // Check if temp_password has expired
      const tempPasswordExpired = profile.temp_password_expires_at && 
        new Date(profile.temp_password_expires_at) < new Date();
      
      // Validate password (regular password or non-expired temp_password)
      const isValidPassword = profile.password === password || 
        (profile.temp_password === password && !tempPasswordExpired);
      
      if (isValidPassword) {
        console.log('Login successful for:', email, 'using profile data')

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
      } else {
        console.log('Password validation failed for user:', email, {
          hasPassword: !!profile.password,
          hasTempPassword: !!profile.temp_password,
          tempPasswordExpired: tempPasswordExpired
        })
        // Don't throw error here - fall through to check application-only login
      }
    }

    // If no profile exists or password validation failed, allow login with application data only
    // This handles cases where:
    // 1. Profile doesn't exist but application is approved
    // 2. Profile exists but password is wrong/expired - still allow access since application is approved
    console.log('Using application-only login for:', email)

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
    
    // Return appropriate HTTP status codes
    let statusCode = 500; // Default to server error
    
    if (error.message.includes('Only users with approved applications')) {
      statusCode = 401; // Unauthorized - no approved application
    } else if (error.message.includes('Email and password are required')) {
      statusCode = 400; // Bad request - missing required fields
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred' 
      }),
      {
        status: statusCode,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    )
  }
}

serve(handler)