-- Add a secure.email_password secret for the edge function
SELECT
  CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM vault.secrets WHERE name = 'email_password'
    )
    THEN vault.create_secret('email_password', 'your-email-password-here')
    ELSE 'Secret already exists'
  END;
