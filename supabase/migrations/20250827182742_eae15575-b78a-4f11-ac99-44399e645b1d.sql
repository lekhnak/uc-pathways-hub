-- Create certification_uploads table
CREATE TABLE public.certification_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certification_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certification_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies for certification uploads
CREATE POLICY "Users can view their own uploads" 
ON public.certification_uploads 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own uploads" 
ON public.certification_uploads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all uploads" 
ON public.certification_uploads 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_certification_uploads_updated_at
BEFORE UPDATE ON public.certification_uploads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for certification files
INSERT INTO storage.buckets (id, name, public) VALUES ('certification-files', 'certification-files', false);

-- Create storage policies
CREATE POLICY "Users can upload their own certification files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'certification-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own certification files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'certification-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all certification files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'certification-files');

-- Create index for better performance
CREATE INDEX idx_certification_uploads_user_id ON public.certification_uploads(user_id);
CREATE INDEX idx_certification_uploads_created_at ON public.certification_uploads(created_at DESC);