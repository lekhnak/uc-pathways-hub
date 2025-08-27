-- Create admin_users table for admin authentication
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view admin users" 
ON public.admin_users 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert admin users" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update admin users" 
ON public.admin_users 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a default admin user (password: "admin123" - change this in production)
INSERT INTO public.admin_users (username, password_hash, email, full_name)
VALUES ('admin', '$2b$10$7KJZjK5pPq7.6k1GKdJKEeLTRyKk7V.Lq8YfN1rHjE9zKJ6qF7Zay', 'admin@ucinvestment.edu', 'System Administrator');