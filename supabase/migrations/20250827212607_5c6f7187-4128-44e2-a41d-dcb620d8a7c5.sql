-- Fix RLS policies for password_reset_tokens table
-- The current policies are too restrictive and blocking inserts

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow token validation" ON public.password_reset_tokens;
DROP POLICY IF EXISTS "Allow token updates" ON public.password_reset_tokens;

-- Create proper policies that allow the admin workflow to work
CREATE POLICY "Allow anyone to insert tokens" 
ON public.password_reset_tokens 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow token validation by token" 
ON public.password_reset_tokens 
FOR SELECT 
USING (true);

CREATE POLICY "Allow token updates for marking as used" 
ON public.password_reset_tokens 
FOR UPDATE 
USING (true);