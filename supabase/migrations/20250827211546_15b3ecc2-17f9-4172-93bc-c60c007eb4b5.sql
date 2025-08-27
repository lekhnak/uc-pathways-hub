-- Create table for password reset tokens
CREATE TABLE public.password_reset_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy to allow token validation
CREATE POLICY "Allow token validation" 
ON public.password_reset_tokens 
FOR SELECT 
USING (true);

-- Create policy to allow token updates (marking as used)
CREATE POLICY "Allow token updates" 
ON public.password_reset_tokens 
FOR UPDATE 
USING (true);

-- Add index for performance
CREATE INDEX idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_email ON public.password_reset_tokens(email);
CREATE INDEX idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);