import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const eventData = await req.json();

    console.log('Creating calendar event:', eventData);

    // Use service role to create event (bypasses RLS)
    const { data, error } = await supabase
      .from('calendar_events')
      .insert([eventData])
      .select()
      .single();

    if (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }

    console.log('Calendar event created successfully:', data.id);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in create-calendar-event function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to create calendar event'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);