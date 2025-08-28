-- Update existing user password to temp123 and ensure profile exists
UPDATE auth.users 
SET 
  encrypted_password = crypt('temp123', gen_salt('bf')),
  updated_at = NOW(),
  email_confirmed_at = NOW()
WHERE email = 'lekhna.kumaraswamy@ucop.edu';

-- Ensure profile exists for the user
DO $$
DECLARE
  existing_user_id uuid;
  profile_exists boolean;
BEGIN
  -- Get the user ID
  SELECT id INTO existing_user_id 
  FROM auth.users 
  WHERE email = 'lekhna.kumaraswamy@ucop.edu';
  
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_id = existing_user_id) INTO profile_exists;
  
  -- Create profile if it doesn't exist
  IF NOT profile_exists THEN
    INSERT INTO public.profiles (
      user_id,
      first_name,
      last_name,
      uc_campus,
      major
    ) VALUES (
      existing_user_id,
      'Lekhna',
      'Kumaraswamy',
      'UC Office of the President',
      'Investment Management'
    );
  END IF;
END $$;