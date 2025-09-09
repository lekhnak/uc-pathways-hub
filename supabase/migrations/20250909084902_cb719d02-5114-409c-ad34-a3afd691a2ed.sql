-- Reset admin passwords to plain text for proper bcrypt hashing in function
UPDATE public.admin_users 
SET password_hash = 'admin123'
WHERE username = 'admin';

UPDATE public.admin_users 
SET password_hash = 'initiate@1128'  
WHERE username = 'jreimann@uci.edu';

UPDATE public.admin_users 
SET password_hash = 'admin@123'
WHERE username = 'lekhnak';