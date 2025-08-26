-- Add optional background information fields to applications table
ALTER TABLE public.applications 
ADD COLUMN racial_identity TEXT,
ADD COLUMN gender_identity TEXT,
ADD COLUMN sexual_orientation TEXT;