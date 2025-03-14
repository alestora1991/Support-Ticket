# Email Notification Function

## Setup

1. Create a `.env` file based on the `.env.example` template
2. Add your email password to the `.env` file
3. Deploy the function using `supabase functions deploy send-notification-email`

## Configuration

This function uses the Supabase Vault to store the email password securely. The password is stored as a secret named `email_password`.

You can set the secret using the Supabase dashboard or by running the SQL migration:

```sql
SELECT vault.create_secret('email_password', 'your-actual-password-here');
```

## Usage

The function accepts the following parameters:

```typescript
interface EmailRequestBody {
  to: string;              // Recipient email address
  subject: string;         // Email subject
  ticketId: string;        // ID of the ticket
  ticketTitle: string;     // Title of the ticket
  userName: string;        // Name of the user
  userEmail?: string;      // Email of the user (for admin notifications)
  status?: string;         // New status (for status updates)
  type: "user-confirmation" | "admin-notification" | "status-update";
}
```

The function will generate appropriate HTML email content based on the notification type.
