-- Delete all records associated with Lekhna Kumaraswamy
DELETE FROM applications 
WHERE first_name ILIKE '%lekhna%' AND last_name ILIKE '%kumaraswamy%';