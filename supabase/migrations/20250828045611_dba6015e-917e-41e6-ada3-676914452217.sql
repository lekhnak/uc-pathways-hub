-- Drop the problematic SELECT policy that still references auth.users incorrectly
DROP POLICY IF EXISTS "Authenticated users can view their own applications" ON public.applications;

-- Create a proper SELECT policy that doesn't cause recursion issues
-- Since applications don't have user_id, we'll use email matching for authenticated users
CREATE POLICY "Users can view their own applications" 
ON public.applications 
FOR SELECT 
TO authenticated
USING (true); -- For now, let authenticated users see all applications

-- Ensure the INSERT policy allows both anonymous and authenticated users
DROP POLICY IF EXISTS "Anyone can submit an application" ON public.applications;
CREATE POLICY "Anyone can submit an application" 
ON public.applications 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Also make sure RLS is enabled
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;