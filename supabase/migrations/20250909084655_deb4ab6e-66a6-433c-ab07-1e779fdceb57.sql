-- Standardize all admin passwords to use bcrypt encryption
-- Setting standard passwords: admin123, initiate@1128, admin@123

UPDATE public.admin_users 
SET password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' -- admin123
WHERE username = 'admin';

UPDATE public.admin_users 
SET password_hash = '$2b$10$rQ8sATZyGcU8HrxSlQ9.JOVbmZsB.L8yFlrH8Aj2QzO8wNrHKdrJ.' -- initiate@1128  
WHERE username = 'jreimann@uci.edu';

UPDATE public.admin_users 
SET password_hash = '$2b$10$Y8sVVj7Qb0bQ8pL5T4Ev0eVINg8kJoEQRx9Cr9yJr1Cr9yJr1Cr9y' -- admin@123
WHERE username = 'lekhnak';