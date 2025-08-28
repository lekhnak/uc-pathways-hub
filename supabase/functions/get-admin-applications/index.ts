import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { status } = await req.json()
    
    let query = supabaseAdmin
      .from('applications')
      .select('*')
      .order('submitted_at', { ascending: false })

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status)
    }

    // Limit to recent applications
    query = query.limit(10)

    const { data: applications, error } = await query

    if (error) {
      throw error
    }

    console.log(`Fetched ${applications?.length || 0} applications with status: ${status || 'all'}`)

    return new Response(JSON.stringify({ applications }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    })
  } catch (error: any) {
    console.error("Error in get-admin-applications function:", error)
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch applications", 
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    )
  }
}

serve(handler)