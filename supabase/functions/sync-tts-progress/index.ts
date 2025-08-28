import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TTSProgressUpdate {
  userId: string;
  courseId: string;
  courseName: string;
  progressPercentage: number;
  completionStatus: 'not_started' | 'in_progress' | 'completed';
  lastAccessedAt?: string;
  completedAt?: string;
  ttsUsername?: string;
}

interface BulkProgressUpdate {
  updates: TTSProgressUpdate[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { updates }: BulkProgressUpdate = await req.json();

    console.log(`Processing ${updates.length} TTS progress updates`);

    const results = [];

    for (const update of updates) {
      try {
        // First, verify the user exists and has a linked TTS account
        const { data: accountLink, error: linkError } = await supabaseClient
          .from('tts_account_links')
          .select('*')
          .eq('user_id', update.userId)
          .eq('tts_username', update.ttsUsername)
          .single();

        if (linkError || !accountLink) {
          console.warn(`No TTS account link found for user ${update.userId} with username ${update.ttsUsername}`);
          results.push({
            userId: update.userId,
            courseId: update.courseId,
            success: false,
            error: 'No linked TTS account found'
          });
          continue;
        }

        // Update or insert progress record
        const progressData = {
          user_id: update.userId,
          course_id: update.courseId,
          course_name: update.courseName,
          progress_percentage: Math.min(100, Math.max(0, update.progressPercentage)),
          completion_status: update.completionStatus,
          tts_username: update.ttsUsername,
          last_accessed_at: update.lastAccessedAt ? new Date(update.lastAccessedAt).toISOString() : null,
          completed_at: update.completedAt ? new Date(update.completedAt).toISOString() : null,
        };

        const { error: upsertError } = await supabaseClient
          .from('tts_progress')
          .upsert(progressData, {
            onConflict: 'user_id,course_id'
          });

        if (upsertError) {
          console.error(`Error updating progress for user ${update.userId}, course ${update.courseId}:`, upsertError);
          results.push({
            userId: update.userId,
            courseId: update.courseId,
            success: false,
            error: upsertError.message
          });
        } else {
          console.log(`Successfully updated progress for user ${update.userId}, course ${update.courseId}`);
          results.push({
            userId: update.userId,
            courseId: update.courseId,
            success: true
          });

          // Update the last sync time for the account link
          await supabaseClient
            .from('tts_account_links')
            .update({ 
              last_sync_at: new Date().toISOString(),
              sync_status: 'active'
            })
            .eq('id', accountLink.id);
        }
      } catch (error) {
        console.error(`Error processing update for user ${update.userId}:`, error);
        results.push({
          userId: update.userId,
          courseId: update.courseId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`TTS sync completed: ${successful} successful, ${failed} failed`);

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${updates.length} progress updates`,
      summary: { successful, failed },
      results
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in sync-tts-progress function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to sync TTS progress", 
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);