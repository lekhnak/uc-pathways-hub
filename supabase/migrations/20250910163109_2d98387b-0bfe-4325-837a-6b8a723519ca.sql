-- Clear temporary passwords for all admin users to ensure consistency
-- This ensures all admins use their permanent hashed passwords
UPDATE admin_users 
SET temp_password = NULL,
    temp_password_expires_at = NULL,
    is_temp_password_used = NULL
WHERE temp_password IS NOT NULL;

-- Verify all admin users have consistent access
-- Add any missing email fields if needed
UPDATE admin_users 
SET email = COALESCE(email, username || '@temp.com')
WHERE email IS NULL;