-- Re-enable RLS with proper policies
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Admin users can update applications" ON public.applications;
DROP POLICY IF EXISTS "Admin users can view all applications" ON public.applications;
DROP POLICY IF EXISTS "Anyone can submit an application" ON public.applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON public.applications;

-- Create a simple INSERT policy that allows everyone to submit applications
CREATE POLICY "Enable insert for everyone" 
ON public.applications 
FOR INSERT 
WITH CHECK (true);

-- Create a SELECT policy for admins to view all applications
CREATE POLICY "Enable select for admin users" 
ON public.applications 
FOR SELECT 
USING (is_admin_user());

-- Create an UPDATE policy for admins
CREATE POLICY "Enable update for admin users" 
ON public.applications 
FOR UPDATE 
USING (is_admin_user()) 
WITH CHECK (is_admin_user());

-- Create a SELECT policy for users to view their own applications (if authenticated)
CREATE POLICY "Enable select for own applications" 
ON public.applications 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Grant necessary permissions
GRANT INSERT ON public.applications TO anon;
GRANT SELECT, INSERT ON public.applications TO authenticated;