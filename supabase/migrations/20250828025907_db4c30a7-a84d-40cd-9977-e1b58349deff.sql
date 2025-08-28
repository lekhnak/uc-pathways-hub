-- Update admin password to 'admin123'
-- This is a bcrypt hash of 'admin123' with salt rounds 10
UPDATE admin_users 
SET password_hash = '$2b$10$rQJ5qgM8W1Z2nGxYhGZqHOYNZT8dYFJx6Y9pKNxLz8tZf7BqWvXqK'
WHERE username = 'admin';