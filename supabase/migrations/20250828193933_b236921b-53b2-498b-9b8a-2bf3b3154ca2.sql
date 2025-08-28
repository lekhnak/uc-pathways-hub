-- Update password for existing user and create profile
-- Update the password for lekhna.kumaraswamy@ucop.edu
UPDATE auth.users 
SET 
  encrypted_password = crypt('temp123', gen_salt('bf')),
  updated_at = NOW(),
  email_confirmed_at = NOW()
WHERE email = 'lekhna.kumaraswamy@ucop.edu';

-- Create profile for the user (if it doesn't exist already)
DO $$
DECLARE
  user_uuid uuid;
BEGIN
  SELECT id INTO user_uuid 
  FROM auth.users 
  WHERE email = 'lekhna.kumaraswamy@ucop.edu';
  
  -- Insert profile only if it doesn't exist
  INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    uc_campus,
    major
  ) 
  SELECT 
    user_uuid,
    'Lekhna',
    'Kumaraswamy',
    'UC Office of the President',
    'Investment Management'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = user_uuid
  );
END $$;