-- Insert a test profile for forgot password functionality
INSERT INTO profiles (user_id, first_name, last_name, email, temp_password, is_temp_password_used) 
VALUES (gen_random_uuid(), 'Test', 'User', 'lek21@ucla.edu', '53m9xjjpfi', false);