-- Create new admin user with username 'lekhnak' and password 'admin@123'
-- Using bcrypt to hash the password (using a standard salt rounds of 10)

INSERT INTO public.admin_users (
  username,
  email,
  full_name,
  password_hash
) VALUES (
  'lekhnak',
  'lekhnak@ucia.edu',
  'Lekhnak Admin',
  -- Bcrypt hash for 'admin@123' with salt rounds 10
  '$2b$10$xQo0h4j3l5XHVsUOH.Kf1eYAUFtQxoC8G6VNzR0.1WGjvYoEh9u1m'
);