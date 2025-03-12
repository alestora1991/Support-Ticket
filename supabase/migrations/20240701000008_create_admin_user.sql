-- Create admin user if not exists
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, encrypted_password)
VALUES 
('00000000-0000-0000-0000-000000000001', 'it@sos.com.om', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"IT Admin"}', false, '$2a$10$Ht9QXvWn1/uhRRLSQZ.U8uMbreVpePpXpbqUB8JTnM3WT7.Zlm1yG')
ON CONFLICT (id) DO NOTHING;

-- Create user in public schema
INSERT INTO public.users (id, email, full_name, created_at, updated_at)
VALUES 
('00000000-0000-0000-0000-000000000001', 'it@sos.com.om', 'IT Admin', now(), now())
ON CONFLICT (id) DO NOTHING;