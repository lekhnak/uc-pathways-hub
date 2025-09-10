import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-user-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface InternshipData {
  title: string;
  company: string;
  location: string;
  position_type: string;
  is_uc_partner: boolean;
  status: string;
  compensation?: string;
  description?: string;
  apply_url?: string;
  contact_email?: string;
  available_positions?: number;
  requirements?: string[];
  application_deadline?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get admin user ID from header
    const adminUserId = req.headers.get("x-admin-user-id");
    if (!adminUserId) {
      return new Response(
        JSON.stringify({ error: "Admin authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify admin user exists
    const { data: adminUser, error: adminError } = await supabaseClient
      .from("admin_users")
      .select("id")
      .eq("id", adminUserId)
      .single();

    if (adminError || !adminUser) {
      return new Response(
        JSON.stringify({ error: "Invalid admin user" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const internshipData: InternshipData = await req.json();

    // Validate required fields
    if (!internshipData.title || !internshipData.company || !internshipData.location) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: title, company, location" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create internship with admin context
    const { data, error } = await supabaseClient
      .from("uc_internships")
      .insert({
        ...internshipData,
        created_by: adminUserId
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});