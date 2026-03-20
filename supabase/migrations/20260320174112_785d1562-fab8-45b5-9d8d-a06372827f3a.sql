-- Update admin user to super_admin for testing
UPDATE public.user_hospitals
SET role = 'super_admin'
WHERE user_id = 'cba99d59-f40a-4bd0-9e95-ac5dbfe8d4a2'
AND hospital_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';