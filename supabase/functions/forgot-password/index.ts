import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0"
import { hash } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ForgotPasswordRequest {
  email: string
  tempPassword: string
  newPassword: string
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

    const { email, tempPassword, newPassword }: ForgotPasswordRequest = await req.json()

    console.log('Processing forgot password request for email:', email)

    // Validate input
    if (!email || !tempPassword || !newPassword) {
      throw new Error('Email, temporary password, and new password are required')
    }

    // Find the profile with matching email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, temp_password, is_temp_password_used, temp_password_expires_at, user_id')
      .eq('email', email)
      .maybeSingle()

    if (profileError || !profile) {
      console.error('Profile not found:', profileError)
      throw new Error('Invalid email or temporary password')
    }

    // Check if temporary password has expired
    if (profile.temp_password_expires_at) {
      const expiryTime = new Date(profile.temp_password_expires_at)
      const currentTime = new Date()
      if (currentTime > expiryTime) {
        throw new Error('Temporary password has expired')
      }
    }

    // Validate temporary password
    if (profile.temp_password !== tempPassword) {
      console.error('Temporary password mismatch')
      throw new Error('Invalid email or temporary password')
    }

    // Check if temporary password has already been used
    if (profile.is_temp_password_used) {
      throw new Error('Temporary password has already been used')
    }

    // Password strength validation
    const passwordRequirements = {
      length: newPassword.length >= 8,
      number: /\d/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
      uppercase: /[A-Z]/.test(newPassword)
    }

    const isPasswordStrong = Object.values(passwordRequirements).every(Boolean)
    if (!isPasswordStrong) {
      throw new Error('Password must meet security requirements: at least 8 characters, contain a number, special character, and uppercase letter')
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword)

    // Update the profile with the new hashed password and mark temp password as used
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        password: hashedPassword,
        is_temp_password_used: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      throw new Error('Failed to update password')
    }

    // If there's a user_id, also update the Supabase auth user password
    if (profile.user_id) {
      const { error: authError } = await supabase.auth.admin.updateUserById(profile.user_id, {
        password: newPassword
      })

      if (authError) {
        console.error('Error updating auth password:', authError)
        // Don't throw here as the profile password is already updated
        console.log('Profile password updated but auth password update failed')
      }
    }

    console.log('Password reset successful for:', email)

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Password reset successfully' 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })

  } catch (error: any) {
    console.error('Error in forgot-password function:', error)
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