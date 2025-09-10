-- Add temp_password column to admin_users table
ALTER TABLE public.admin_users 
ADD COLUMN temp_password text;