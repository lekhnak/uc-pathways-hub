import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-user-id',
};

interface UpdateContentRequest {
  sectionId: string;
  updates: {
    title?: string;
    subtitle?: string;
    content?: string;
    image_url?: string;
    metadata?: any;
  };
}

const handler = async (req: Request): Promise<Response> => {
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

    // Get admin user ID from request headers
    const adminUserId = req.headers.get('x-admin-user-id');
    
    if (!adminUserId) {
      return new Response(
        JSON.stringify({ error: 'Admin authentication required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify admin user exists
    const { data: adminUser, error: adminError } = await supabaseClient
      .from('admin_users')
      .select('id')
      .eq('id', adminUserId)
      .single();

    if (adminError || !adminUser) {
      return new Response(
        JSON.stringify({ error: 'Invalid admin credentials' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { sectionId, updates }: UpdateContentRequest = await req.json();

    // First try to update existing content
    let { data, error } = await supabaseClient
      .from('website_content')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('section_id', sectionId)
      .select()
      .single();

    // If no rows were updated, insert a new one
    if (error && error.code === 'PGRST116') {
      const { data: insertData, error: insertError } = await supabaseClient
        .from('website_content')
        .insert({
          section_id: sectionId,
          ...updates,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create content' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      data = insertData;
    } else if (error) {
      console.error('Database update error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update content' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in update-website-content function:', error.message);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);