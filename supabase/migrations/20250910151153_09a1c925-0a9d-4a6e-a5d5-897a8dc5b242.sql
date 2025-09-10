-- Fix RLS policies for calendar_events to work with admin authentication
DROP POLICY IF EXISTS "Admin users can create calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Admin users can update calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Admin users can delete calendar events" ON public.calendar_events;

-- Create new policies that work with the admin authentication system
CREATE POLICY "Admin users can create calendar events" 
ON public.calendar_events 
FOR INSERT 
WITH CHECK (is_admin_authenticated() OR is_admin_user());

CREATE POLICY "Admin users can update calendar events" 
ON public.calendar_events 
FOR UPDATE 
USING (is_admin_authenticated() OR is_admin_user());

CREATE POLICY "Admin users can delete calendar events" 
ON public.calendar_events 
FOR DELETE 
USING (is_admin_authenticated() OR is_admin_user());

-- Fix the admin_users RLS policies to allow service role access
CREATE POLICY "Service role can manage admin users" 
ON public.admin_users 
FOR ALL
USING ((current_setting('role') = 'service_role') OR is_admin_user())
WITH CHECK ((current_setting('role') = 'service_role') OR is_admin_user());

-- Fix event_rsvps policies to allow service role access for email functions
CREATE POLICY "Service role can manage rsvps" 
ON public.event_rsvps 
FOR ALL
USING ((current_setting('role') = 'service_role') OR is_admin_user());

-- Fix email_notifications policies 
CREATE POLICY "Service role can manage email notifications" 
ON public.email_notifications 
FOR ALL
USING ((current_setting('role') = 'service_role') OR is_admin_user());

-- Create a better admin check function that doesn't depend on auth.uid
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_header TEXT;
  admin_id UUID;
BEGIN
  -- First try to get admin ID from custom header (set by edge functions)
  BEGIN
    admin_header := current_setting('request.headers', true)::json->>'x-admin-user-id';
    IF admin_header IS NOT NULL AND admin_header != '' THEN
      admin_id := admin_header::uuid;
      RETURN EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE id = admin_id
      );
    END IF;
  EXCEPTION WHEN others THEN
    -- Continue to next check
  END;
  
  -- Fallback to regular auth.uid check
  IF auth.uid() IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid()
    );
  END IF;
  
  RETURN false;
END;
$$;

-- Update calendar_events policies to use the new function
DROP POLICY IF EXISTS "Admin users can create calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Admin users can update calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Admin users can delete calendar events" ON public.calendar_events;

CREATE POLICY "Admin users can create calendar events" 
ON public.calendar_events 
FOR INSERT 
WITH CHECK (is_current_user_admin());

CREATE POLICY "Admin users can update calendar events" 
ON public.calendar_events 
FOR UPDATE 
USING (is_current_user_admin());

CREATE POLICY "Admin users can delete calendar events" 
ON public.calendar_events 
FOR DELETE 
USING (is_current_user_admin());