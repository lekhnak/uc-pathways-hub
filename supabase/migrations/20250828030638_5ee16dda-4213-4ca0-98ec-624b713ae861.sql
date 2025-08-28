-- Update admin user password hash to use scrypt
-- First, let's update the admin user with the new scrypt hash for "admin123"
UPDATE admin_users 
SET password_hash = '$scrypt$N=32768,r=8,p=1$WmZCVldSemVGNGhkQ2dycA$sL6/8+W2neCS6yNp7x1+tl2UzRDK3PXDADzk+g9g3c0=' 
WHERE username = 'admin';