-- Create user account for lekhna.kumaraswamy@ucop.edu with temp123 password
-- First, create the auth user
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'lekhna.kumaraswamy@ucop.edu',
  crypt('temp123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Lekhna", "last_name": "Kumaraswamy"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Get the user ID we just created and create a profile
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  SELECT id INTO new_user_id 
  FROM auth.users 
  WHERE email = 'lekhna.kumaraswamy@ucop.edu';
  
  -- Create profile for the user
  INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    uc_campus,
    major
  ) VALUES (
    new_user_id,
    'Lekhna',
    'Kumaraswamy',
    'UC Office of the President',
    'Investment Management'
  );
END $$;