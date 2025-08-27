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