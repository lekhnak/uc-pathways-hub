-- Drop the problematic RLS policy that tries to access auth.users
DROP POLICY IF EXISTS "Users can view their own application" ON public.applications;

-- Create a new policy that works with authenticated users
-- Users can view applications that match their authenticated email
CREATE POLICY "Authenticated users can view their own applications" 
ON public.applications 
FOR SELECT 
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
);

-- Also ensure that anyone can still submit applications (this should already exist but let's make sure)
DROP POLICY IF EXISTS "Anyone can submit an application" ON public.applications;
CREATE POLICY "Anyone can submit an application" 
ON public.applications 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);