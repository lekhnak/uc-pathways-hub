-- Add missing fields to profiles table for enhanced profile management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS major text,
ADD COLUMN IF NOT EXISTS graduation_year integer,
ADD COLUMN IF NOT EXISTS gpa numeric,
ADD COLUMN IF NOT EXISTS uc_campus text,
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS github_url text,
ADD COLUMN IF NOT EXISTS career_interests text[],
ADD COLUMN IF NOT EXISTS target_companies jsonb DEFAULT '[]'::jsonb;

-- Update the updated_at trigger to work with profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();