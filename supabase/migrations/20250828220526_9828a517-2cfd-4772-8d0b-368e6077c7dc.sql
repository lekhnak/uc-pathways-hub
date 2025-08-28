-- Update profiles table to include password fields for forgot password functionality
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text UNIQUE,
ADD COLUMN IF NOT EXISTS temp_password text,
ADD COLUMN IF NOT EXISTS password text,
ADD COLUMN IF NOT EXISTS is_temp_password_used boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS temp_password_expires_at timestamp with time zone DEFAULT (now() + interval '48 hours');

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Create a trigger to set temp_password_expires_at when temp_password is updated
CREATE OR REPLACE FUNCTION public.set_temp_password_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.temp_password IS DISTINCT FROM OLD.temp_password AND NEW.temp_password IS NOT NULL THEN
    NEW.temp_password_expires_at = now() + interval '48 hours';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_temp_password_expiry_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_temp_password_expiry();