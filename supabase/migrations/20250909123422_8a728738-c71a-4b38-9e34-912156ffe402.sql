-- Create a new function to check admin session from custom admin system
CREATE OR REPLACE FUNCTION public.is_admin_authenticated()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_header TEXT;
  admin_id UUID;
BEGIN
  -- Get admin ID from custom header (will be set by edge function)
  admin_header := current_setting('request.headers', true)::json->>'x-admin-user-id';
  
  IF admin_header IS NULL OR admin_header = '' THEN
    RETURN false;
  END IF;
  
  -- Convert to UUID and check if admin exists
  BEGIN
    admin_id := admin_header::uuid;
    RETURN EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = admin_id
    );
  EXCEPTION WHEN others THEN
    RETURN false;
  END;
END;
$$;

-- Update website_content RLS policies to work with both auth systems
DROP POLICY IF EXISTS "Admin users can manage website content" ON website_content;

-- Allow admin management through both regular auth and custom admin auth
CREATE POLICY "Admin users can manage website content" 
ON public.website_content 
FOR ALL
USING (is_admin_user() OR is_admin_authenticated())
WITH CHECK (is_admin_user() OR is_admin_authenticated());

-- Also allow direct admin operations (for edge functions with service role)
CREATE POLICY "Service role can manage website content" 
ON public.website_content 
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');