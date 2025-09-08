-- Remove the overly permissive public SELECT policy on admin_users table
-- This policy allowed anyone to read admin usernames, password hashes, and emails
DROP POLICY IF EXISTS "Allow public to check admin status" ON public.admin_users;

-- The admin login functionality will continue to work because:
-- 1. The admin-login edge function uses the service role key, bypassing RLS
-- 2. Admin users can still manage each other through the existing admin-only policies
-- 3. The is_admin_user() function is used for other admin operations, not login