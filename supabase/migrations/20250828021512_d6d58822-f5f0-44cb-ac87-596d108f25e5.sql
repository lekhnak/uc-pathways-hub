-- CRITICAL SECURITY FIXES FOR RLS POLICIES

-- First, create a security definer function to safely check admin roles
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid()::text::uuid
  );
$$;

-- Drop existing overly permissive policies on admin_users
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can insert admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can update admin users" ON public.admin_users;

-- Create secure admin_users policies - only authenticated admin users can access
CREATE POLICY "Admin users can view admin users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admin users can update admin users"
ON public.admin_users
FOR UPDATE
TO authenticated
USING (public.is_admin_user());

-- Drop existing overly permissive policy on applications
DROP POLICY IF EXISTS "Admins can view all applications" ON public.applications;

-- Create secure applications policy - only authenticated admin users can view all applications
CREATE POLICY "Admin users can view all applications"
ON public.applications
FOR SELECT
TO authenticated
USING (public.is_admin_user());

-- Create secure applications policy for updates - only admin users can update
CREATE POLICY "Admin users can update applications"
ON public.applications
FOR UPDATE
TO authenticated
USING (public.is_admin_user());

-- Drop existing overly permissive policies on password_reset_tokens
DROP POLICY IF EXISTS "Allow token validation by token" ON public.password_reset_tokens;
DROP POLICY IF EXISTS "Allow anyone to insert tokens" ON public.password_reset_tokens;
DROP POLICY IF EXISTS "Allow token updates for marking as used" ON public.password_reset_tokens;

-- Create secure password_reset_tokens policies - only system processes and admin users
CREATE POLICY "Admin users can view password reset tokens"
ON public.password_reset_tokens
FOR SELECT
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admin users can insert password reset tokens"
ON public.password_reset_tokens
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin users can update password reset tokens"
ON public.password_reset_tokens
FOR UPDATE
TO authenticated
USING (public.is_admin_user());

-- Add password hashing column to admin_users if it doesn't exist with proper constraints
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS password_salt text;

-- Ensure password_hash is not nullable for security
ALTER TABLE public.admin_users 
ALTER COLUMN password_hash SET NOT NULL;