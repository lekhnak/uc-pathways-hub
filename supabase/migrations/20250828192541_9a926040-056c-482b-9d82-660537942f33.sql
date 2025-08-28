-- Add new admin user for lekhna.kumaraswamy@ucop.edu
INSERT INTO public.admin_users (username, email, full_name, password_hash)
VALUES (
  'lkumaraswamy',
  'lekhna.kumaraswamy@ucop.edu', 
  'Lekhna Kumaraswamy',
  -- Using same hash as existing admin for now (password: admin123)
  '$scrypt$N=32768,r=8,p=1$WmZCVldSemVGNGhkQ2dycA$sL6/8+W2neCS6yNp7x1+tl2UzRDK3PXDADzk+g9g3c0='
);