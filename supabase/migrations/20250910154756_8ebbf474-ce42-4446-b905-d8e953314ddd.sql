-- Create UC Internships table
CREATE TABLE public.uc_internships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  company_logo_url TEXT NULL,
  location TEXT NOT NULL,
  position_type TEXT NOT NULL DEFAULT 'full-time', -- full-time, part-time, summer-program
  is_uc_partner BOOLEAN NOT NULL DEFAULT true,
  compensation TEXT NULL,
  application_deadline DATE NULL,
  available_positions INTEGER DEFAULT 1,
  requirements JSONB DEFAULT '[]'::jsonb,
  description TEXT NULL,
  apply_url TEXT NULL,
  contact_email TEXT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- draft, active, closed, archived
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.uc_internships ENABLE ROW LEVEL SECURITY;

-- Create policies for internships
CREATE POLICY "Anyone can view active internships" 
ON public.uc_internships 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Admin users can create internships" 
ON public.uc_internships 
FOR INSERT 
WITH CHECK (is_current_user_admin());

CREATE POLICY "Admin users can update internships" 
ON public.uc_internships 
FOR UPDATE 
USING (is_current_user_admin());

CREATE POLICY "Admin users can delete internships" 
ON public.uc_internships 
FOR DELETE 
USING (is_current_user_admin());

CREATE POLICY "Admin users can view all internships" 
ON public.uc_internships 
FOR SELECT 
USING (is_current_user_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_uc_internships_updated_at
BEFORE UPDATE ON public.uc_internships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();