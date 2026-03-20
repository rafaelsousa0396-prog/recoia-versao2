-- Insert second test hospital
INSERT INTO public.hospitals (id, nome, cidade, estado)
VALUES ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Hospital Regional do Vale - Teste', 'Rio de Janeiro', 'RJ');

-- Link admin user to second hospital
INSERT INTO public.user_hospitals (user_id, hospital_id, role)
VALUES ('cba99d59-f40a-4bd0-9e95-ac5dbfe8d4a2', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'admin');