
-- Grant permissions for service role to manage hospitals and user_hospitals
GRANT INSERT, UPDATE, DELETE ON public.hospitals TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.user_hospitals TO service_role;

-- Also grant insert on profiles for the trigger
GRANT INSERT ON public.profiles TO service_role;

-- Insert test hospital
INSERT INTO public.hospitals (id, nome, cidade, estado)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Hospital São Lucas - Teste', 'São Paulo', 'SP');

-- Link admin user to hospital
INSERT INTO public.user_hospitals (user_id, hospital_id, role)
VALUES ('cba99d59-f40a-4bd0-9e95-ac5dbfe8d4a2', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin');
