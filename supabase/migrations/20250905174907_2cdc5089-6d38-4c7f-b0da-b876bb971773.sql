-- Create audit log table for tracking bulk uploads
CREATE TABLE public.bulk_upload_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  total_records INTEGER NOT NULL DEFAULT 0,
  successful_records INTEGER NOT NULL DEFAULT 0,
  failed_records INTEGER NOT NULL DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  column_mapping JSONB DEFAULT '{}'::jsonb,
  upload_status TEXT NOT NULL DEFAULT 'processing' CHECK (upload_status IN ('processing', 'completed', 'failed')),
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by TEXT,
  summary_report JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.bulk_upload_logs ENABLE ROW LEVEL SECURITY;

-- Admin users can view all upload logs
CREATE POLICY "Admin users can view all upload logs" 
ON public.bulk_upload_logs 
FOR SELECT 
USING (is_admin_user());

-- Admin users can create upload logs
CREATE POLICY "Admin users can create upload logs" 
ON public.bulk_upload_logs 
FOR INSERT 
WITH CHECK (is_admin_user());

-- Admin users can update upload logs
CREATE POLICY "Admin users can update upload logs" 
ON public.bulk_upload_logs 
FOR UPDATE 
USING (is_admin_user());

-- Create index for better performance
CREATE INDEX idx_bulk_upload_logs_admin_user_id ON public.bulk_upload_logs(admin_user_id);
CREATE INDEX idx_bulk_upload_logs_created_at ON public.bulk_upload_logs(created_at DESC);
CREATE INDEX idx_bulk_upload_logs_status ON public.bulk_upload_logs(upload_status);