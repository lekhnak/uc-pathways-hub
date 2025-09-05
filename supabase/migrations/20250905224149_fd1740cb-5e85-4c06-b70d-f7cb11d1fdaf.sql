-- Create missing profile for Punit Vyas
INSERT INTO profiles (
  user_id,
  email, 
  first_name, 
  last_name, 
  username, 
  temp_password,
  password
) 
SELECT 
  gen_random_uuid() as user_id,
  email,
  first_name,
  last_name,
  LOWER(REPLACE(first_name || '.' || last_name, ' ', '.')) as username,
  LEFT(MD5(RANDOM()::TEXT), 16) as temp_password,
  LEFT(MD5(RANDOM()::TEXT), 12) as password
FROM applications 
WHERE LOWER(email) = LOWER('punit.vyas@ucop.edu') 
AND status = 'approved'
AND NOT EXISTS (
  SELECT 1 FROM profiles WHERE LOWER(profiles.email) = LOWER(applications.email)
);