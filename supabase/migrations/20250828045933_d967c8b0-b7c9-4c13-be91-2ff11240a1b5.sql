-- Remove the problematic policy that tries to access auth.users
DROP POLICY IF EXISTS "Enable select for own applications" ON public.applications;

-- Since applications don't have a user_id column and are submitted by email,
-- we don't need users to view their own applications through the API.
-- Applications will be managed by admins only.

-- Keep only the policies that work:
-- 1. INSERT policy for everyone (already exists)
-- 2. SELECT/UPDATE policies for admins only (already exist)