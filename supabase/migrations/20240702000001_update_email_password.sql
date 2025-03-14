-- Store the email password in the vault for secure access
SELECT vault.create_secret('email_password', 'your-app-password-here');
