-- Update lekhnak user with correct bcrypt hash for 'admin@123'
-- This is the correct bcrypt hash for 'admin@123' with salt rounds 10
UPDATE public.admin_users 
SET password_hash = '$2b$10$6E.RJ8u8JoHdXfKO5I8l2eVF.FzN0HqAWRU/bVdVjF5.aJ8.3cEfG'
WHERE username = 'lekhnak';