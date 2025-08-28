-- Get the user_id for lekhna.kumaraswamy@ucop.edu and create profile
INSERT INTO public.profiles (user_id, first_name, last_name)
SELECT 
  u.id,
  'Lekhna',
  'Kumaraswamy'
FROM auth.users u 
WHERE u.email = 'lekhna.kumaraswamy@ucop.edu'
ON CONFLICT (user_id) DO NOTHING;