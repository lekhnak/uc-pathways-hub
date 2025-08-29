-- Make certain fields nullable for admin-created applications
ALTER TABLE public.applications 
ALTER COLUMN uc_campus DROP NOT NULL,
ALTER COLUMN student_type DROP NOT NULL,
ALTER COLUMN major DROP NOT NULL,
ALTER COLUMN question_1 DROP NOT NULL,
ALTER COLUMN question_2 DROP NOT NULL,
ALTER COLUMN question_3 DROP NOT NULL,
ALTER COLUMN question_4 DROP NOT NULL,
ALTER COLUMN gpa DROP NOT NULL;

-- Add a field to track if application was created by admin
ALTER TABLE public.applications 
ADD COLUMN created_by_admin boolean DEFAULT false;