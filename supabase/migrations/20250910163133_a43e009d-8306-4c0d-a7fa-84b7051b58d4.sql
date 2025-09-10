-- Clear temporary passwords for all admin users to ensure consistency
-- This ensures all admins use their permanent hashed passwords
UPDATE admin_users 
SET temp_password = NULL
WHERE temp_password IS NOT NULL;