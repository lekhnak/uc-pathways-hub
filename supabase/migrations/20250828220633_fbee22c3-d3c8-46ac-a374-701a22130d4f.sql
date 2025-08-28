-- Fix the function search path security warning
DROP TRIGGER IF EXISTS set_temp_password_expiry_trigger ON public.profiles;
DROP FUNCTION IF EXISTS public.set_temp_password_expiry();

-- Recreate the function with proper search path
CREATE OR REPLACE FUNCTION public.set_temp_password_expiry()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  IF NEW.temp_password IS DISTINCT FROM OLD.temp_password AND NEW.temp_password IS NOT NULL THEN
    NEW.temp_password_expires_at = now() + interval '48 hours';
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER set_temp_password_expiry_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_temp_password_expiry();