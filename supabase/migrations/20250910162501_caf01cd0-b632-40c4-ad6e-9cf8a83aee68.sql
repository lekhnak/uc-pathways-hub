-- Update admin user passwords with secure hashing
-- Using crypt function with bcrypt algorithm for secure password hashing

UPDATE admin_users 
SET password_hash = crypt('Temp@Craig', gen_salt('bf')),
    password_salt = gen_salt('bf')
WHERE username = 'CraigH';

UPDATE admin_users 
SET password_hash = crypt('Temp@Jack', gen_salt('bf')),
    password_salt = gen_salt('bf')
WHERE username = 'JackZ';

UPDATE admin_users 
SET password_hash = crypt('Temp@123', gen_salt('bf')),
    password_salt = gen_salt('bf')
WHERE username = 'lekhnak';

UPDATE admin_users 
SET password_hash = crypt('Temp@Punit', gen_salt('bf')),
    password_salt = gen_salt('bf')
WHERE username = 'PunitV';

UPDATE admin_users 
SET password_hash = crypt('Temp@Jair', gen_salt('bf')),
    password_salt = gen_salt('bf')
WHERE username = 'JairR';

UPDATE admin_users 
SET password_hash = crypt('Temp@UCAdmin', gen_salt('bf')),
    password_salt = gen_salt('bf')
WHERE username = 'UCAdmin';