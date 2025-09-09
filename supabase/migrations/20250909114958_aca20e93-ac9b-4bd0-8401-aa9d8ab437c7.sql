-- Create website_content table for editable sections
CREATE TABLE public.website_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id TEXT NOT NULL UNIQUE,
  title TEXT,
  subtitle TEXT,
  content TEXT,
  image_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only admins can manage content, everyone can read
CREATE POLICY "Everyone can view website content" 
ON public.website_content 
FOR SELECT 
USING (true);

CREATE POLICY "Admin users can manage website content" 
ON public.website_content 
FOR ALL 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Create storage bucket for website images
INSERT INTO storage.buckets (id, name, public) VALUES ('website-images', 'website-images', true);

-- Storage policies for website images
CREATE POLICY "Website images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'website-images');

CREATE POLICY "Admin users can upload website images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'website-images' AND is_admin_user());

CREATE POLICY "Admin users can update website images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'website-images' AND is_admin_user());

CREATE POLICY "Admin users can delete website images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'website-images' AND is_admin_user());

-- Add trigger for updating updated_at
CREATE TRIGGER update_website_content_updated_at
BEFORE UPDATE ON public.website_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for website_content
ALTER publication supabase_realtime ADD TABLE public.website_content;

-- Insert default content for sections
INSERT INTO public.website_content (section_id, title, subtitle, content, metadata) VALUES
('hero', 'UC Investments Academy', 'Building the next generation of finance leaders', 'Connect UC undergraduate and graduate students with opportunities in the financial industry through free training, tools, and coaching.', '{"cta_primary": "Access Portal", "cta_secondary": "Explore the Program"}'),
('about', 'What is the UC Investments Academy?', null, 'Launched by UC Investments and UC Office of the President in 2022, this program prepares UC students for careers in finance and asset management. Initially starting with just 100 students at UC Merced, the program has expanded to multiple UC campuses and provides the one-stop UC destination for preparing for careers in finance.\n\nThe UC Investments Academy, which we created to connect UC undergrads with opportunities in the financial industry, has engaged 3000+ students across 9 UC campuses. The Academy provides free training, tools and coaching to all interested UC students.', '{}'),
('program', 'Our Complete Program', 'A comprehensive pathway designed to take you from awareness to career success in finance and asset management.', null, '{}'),
('benefits', 'Why Choose UC Investments Academy?', 'Everything you need to launch your finance career.', null, '{}'),
('how-it-works', 'How the Program Works', 'The program consists of online classes and guest speakers from diverse backgrounds in the investment field.', null, '{}'),
('faq', 'Frequently Asked Questions', 'Everything you need to know about the UC Investments Academy.', null, '{}');