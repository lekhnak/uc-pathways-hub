-- Add DELETE policy for admin users on applications table
CREATE POLICY "Admin users can delete applications" 
ON public.applications 
FOR DELETE 
USING (is_admin_user());