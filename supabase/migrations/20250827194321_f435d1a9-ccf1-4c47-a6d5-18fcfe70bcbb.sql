-- Create RLS policies for application-documents storage bucket

-- Allow users to upload files to application-documents bucket
CREATE POLICY "Users can upload application documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'application-documents');

-- Allow users to view files they uploaded (optional, for potential future use)
CREATE POLICY "Users can view application documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'application-documents');

-- Allow admins to view all application documents
CREATE POLICY "Admins can view all application documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'application-documents');