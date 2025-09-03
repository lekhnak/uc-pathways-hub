-- Create admin user with the same credentials for jreimann@uci.edu
INSERT INTO admin_users (username, full_name, email, password_hash)
VALUES (
  'jreimann@uci.edu',
  'Jeffrey Reimann',
  'jreimann@uci.edu',
  'initiate@1128'
)
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name;

-- Also update the user profile password if it exists
UPDATE profiles 
SET password = 'initiate@1128'
WHERE email = 'jreimann@uci.edu';