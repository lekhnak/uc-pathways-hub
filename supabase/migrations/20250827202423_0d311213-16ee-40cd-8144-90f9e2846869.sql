-- Remove the manually created user that's causing auth issues
DELETE FROM auth.users WHERE email = 'chase.griffin@ucop.edu';