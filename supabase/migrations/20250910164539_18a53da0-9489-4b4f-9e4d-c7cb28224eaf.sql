-- Reset all admin user passwords to simple temporary passwords for testing
-- This will allow immediate login while the bcrypt verification is being fixed

UPDATE admin_users SET 
  password_hash = CASE username 
    WHEN 'lekhnak' THEN 'Temp@123'
    WHEN 'CraigH' THEN 'Temp@Craig'
    WHEN 'JackZ' THEN 'Temp@Jack'
    WHEN 'JairR' THEN 'Temp@Jair'
    WHEN 'PunitV' THEN 'Temp@Punit'
    WHEN 'UCAdmin' THEN 'Temp@Admin'
    ELSE password_hash
  END,
  temp_password = NULL
WHERE username IN ('lekhnak', 'CraigH', 'JackZ', 'JairR', 'PunitV', 'UCAdmin');