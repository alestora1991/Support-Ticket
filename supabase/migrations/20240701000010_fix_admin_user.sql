-- Update admin user if exists or create new one
DO $$
BEGIN
  -- Check if the admin user already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'it@sos.com.om') THEN
    -- Update the existing user
    UPDATE auth.users 
    SET raw_user_meta_data = jsonb_build_object('full_name', 'IT Admin')
    WHERE email = 'it@sos.com.om';
    
    -- Ensure the user exists in public schema
    INSERT INTO public.users (id, email, full_name, created_at, updated_at)
    SELECT id, email, 'IT Admin', COALESCE(created_at, now()), COALESCE(updated_at, now())
    FROM auth.users
    WHERE email = 'it@sos.com.om'
    ON CONFLICT (id) DO UPDATE
    SET full_name = 'IT Admin', updated_at = now();
  ELSE
    -- Create a new admin user with a secure password
    INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, encrypted_password)
    VALUES 
    ('00000000-0000-0000-0000-000000000001', 'it@sos.com.om', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"IT Admin"}', false, '$2a$10$Ht9QXvWn1/uhRRLSQZ.U8uMbreVpePpXpbqUB8JTnM3WT7.Zlm1yG')
    ON CONFLICT (id) DO NOTHING;
    
    -- Create user in public schema
    INSERT INTO public.users (id, email, full_name, created_at, updated_at)
    VALUES 
    ('00000000-0000-0000-0000-000000000001', 'it@sos.com.om', 'IT Admin', now(), now())
    ON CONFLICT (id) DO NOTHING;
  END IF;
END
$$;