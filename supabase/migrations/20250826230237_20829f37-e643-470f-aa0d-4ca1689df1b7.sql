-- Add new columns to applications table
ALTER TABLE public.applications 
ADD COLUMN graduation_year INTEGER,
ADD COLUMN linkedin_url TEXT,
ADD COLUMN first_generation_student BOOLEAN,
ADD COLUMN pell_grant_eligible BOOLEAN,
ADD COLUMN currently_employed BOOLEAN,
ADD COLUMN current_position TEXT,
ADD COLUMN current_employer TEXT,
ADD COLUMN resume_file_path TEXT,
ADD COLUMN transcript_file_path TEXT,
ADD COLUMN consent_form_file_path TEXT;

-- Create storage bucket for application documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('application-documents', 'application-documents', false);

-- Create RLS policies for application documents bucket
CREATE POLICY "Users can upload their own application documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'application-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own application documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'application-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all application documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'application-documents');

CREATE POLICY "Users can update their own application documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'application-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own application documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'application-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);