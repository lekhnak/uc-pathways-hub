-- Add policy to allow admin users to create profiles for other users
CREATE POLICY "Admin users can create profiles for others" 
ON public.profiles 
FOR INSERT 
WITH CHECK (is_admin_user());