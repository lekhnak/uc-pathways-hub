-- Add user profile for Jack Zhu with correct email
INSERT INTO profiles (
  email, 
  first_name, 
  last_name, 
  password,
  user_id
) VALUES (
  'jack.zhu@ucop.edu',
  'Jack',
  'Zhu',
  'UCOP123',
  gen_random_uuid()
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name;

-- Also create an approved application for Jack Zhu so he can login
INSERT INTO applications (
  email,
  first_name, 
  last_name,
  status,
  submitted_at
) VALUES (
  'jack.zhu@ucop.edu',
  'Jack',
  'Zhu', 
  'approved',
  now()
)
ON CONFLICT (email) DO UPDATE SET
  status = 'approved';