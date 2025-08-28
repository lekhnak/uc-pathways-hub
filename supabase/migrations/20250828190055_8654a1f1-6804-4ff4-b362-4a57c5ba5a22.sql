-- Create table to store TTS course progress
CREATE TABLE public.tts_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tts_username TEXT, -- TTS platform username for linking accounts
  course_id TEXT NOT NULL, -- TTS course identifier
  course_name TEXT NOT NULL,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completion_status TEXT DEFAULT 'not_started' CHECK (completion_status IN ('not_started', 'in_progress', 'completed')),
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE public.tts_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own TTS progress" 
ON public.tts_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own TTS progress" 
ON public.tts_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own TTS progress" 
ON public.tts_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin users can view all TTS progress" 
ON public.tts_progress 
FOR SELECT 
USING (is_admin_user());

CREATE POLICY "Admin users can manage all TTS progress" 
ON public.tts_progress 
FOR ALL 
USING (is_admin_user());

-- Add trigger for updated_at
CREATE TRIGGER update_tts_progress_updated_at
BEFORE UPDATE ON public.tts_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table to store TTS account linking
CREATE TABLE public.tts_account_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tts_username TEXT NOT NULL,
  tts_email TEXT,
  linked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'active', 'failed', 'disabled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(tts_username)
);

-- Enable RLS for account links
ALTER TABLE public.tts_account_links ENABLE ROW LEVEL SECURITY;

-- Create policies for account links
CREATE POLICY "Users can view their own TTS account link" 
ON public.tts_account_links 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own TTS account link" 
ON public.tts_account_links 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admin users can view all TTS account links" 
ON public.tts_account_links 
FOR SELECT 
USING (is_admin_user());

-- Add trigger for updated_at
CREATE TRIGGER update_tts_account_links_updated_at
BEFORE UPDATE ON public.tts_account_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();