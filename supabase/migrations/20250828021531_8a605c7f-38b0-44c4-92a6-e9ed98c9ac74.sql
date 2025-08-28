-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid()::text::uuid
  );
$$;