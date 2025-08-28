-- Fix RLS policies for profiles table to allow admin users to create profiles for others
-- First, let's check the current admin users to ensure the policy works correctly

-- Update the admin users RLS policy to allow selecting admin users (needed for is_admin_user function)
CREATE POLICY "Allow public to check admin status"
ON public.admin_users
FOR SELECT 
TO public
USING (true);

-- Also add a policy to allow admins to view all profiles (needed for user management)
CREATE POLICY "Admin users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_admin_user());

-- Add a policy to allow admins to delete profiles (for user management)
CREATE POLICY "Admin users can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (is_admin_user());