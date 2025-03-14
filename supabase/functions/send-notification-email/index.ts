// supabase/functions/send-notification-email/index.ts
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

interface EmailRequestBody {
  to: string;
  adminEmail?: string;
  subject: string;
  ticketId: string;
  ticketTitle: string;
  userName: string;
  userEmail?: string;
  status?: string;
  type: "user-confirmation" | "admin-notification" | "status-update" | "both";
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const body: EmailRequestBody = await req.json();

    // Configure email client
    const client = new SmtpClient();

    // Generate email content based on notification type
    let userEmailContent = "";
    let adminEmailContent = "";
    const fromEmail = "noreply@sos.com.om";

    // Create email templates based on notification type
    if (body.type === "user-confirmation" || body.type === "both") {
      userEmailContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9fafb; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Support Ticket Received</h2>
              </div>
              <div class="content">
                <p>Dear ${body.userName},</p>
                <p>Thank you for submitting your support ticket. Our IT team has received your request and will start working on it shortly.</p>
                <p><strong>Ticket ID:</strong> ${body.ticketId}</p>
                <p><strong>Title:</strong> ${body.ticketTitle}</p>
                <p>We'll notify you when there are updates to your ticket.</p>
                <p>Thank you for your patience.</p>
              </div>
              <div class="footer">
                <p>© 2024 SOS IT Support. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;
    }

    if (body.type === "admin-notification" || body.type === "both") {
      adminEmailContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9fafb; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>New Support Ticket Submitted</h2>
              </div>
              <div class="content">
                <p>A new support ticket has been submitted and requires your attention.</p>
                <p><strong>Ticket ID:</strong> ${body.ticketId}</p>
                <p><strong>Title:</strong> ${body.ticketTitle}</p>
                <p><strong>Submitted by:</strong> ${body.userName} (${body.userEmail || "No email provided"})</p>
                <p>Please log in to the admin dashboard to review and assign this ticket.</p>
              </div>
              <div class="footer">
                <p>© 2024 SOS IT Support. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;
    }

    if (body.type === "status-update") {
      userEmailContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9fafb; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Ticket Status Updated</h2>
              </div>
              <div class="content">
                <p>Dear ${body.userName},</p>
                <p>The status of your support ticket has been updated.</p>
                <p><strong>Ticket ID:</strong> ${body.ticketId}</p>
                <p><strong>Title:</strong> ${body.ticketTitle}</p>
                <p><strong>New Status:</strong> ${body.status}</p>
                <p>You can log in to check the details of your ticket.</p>
              </div>
              <div class="footer">
                <p>© 2024 SOS IT Support. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;
    }

    // For development/testing, log the email content instead of sending
    console.log("Email content that will be sent:", {
      to: body.to,
      adminEmail: body.adminEmail,
      subject: body.subject,
      type: body.type,
    });

    // Always attempt to send emails in production mode
    console.log("Running in production mode");

    try {
      // Connect to SMTP server with credentials from environment variables
      // This is a simplified approach for this demo application
      console.log("Connecting to SMTP server with credentials");
      // Get email password from environment variable with fallback
      const emailPassword =
        Deno.env.get("EMAIL_PASSWORD") || "SOS_IT_Support_2024";
      await client.connectTLS({
        hostname: "smtp.gmail.com", // SMTP server
        port: 465,
        username: "noreply@sos.com.om", // Sender email
        password: emailPassword, // Get password from environment variable with fallback
      });

      // Send emails based on type
      if (body.type === "both" && body.adminEmail) {
        // Send to user
        await client.send({
          from: fromEmail,
          to: body.to,
          subject: body.subject,
          content: userEmailContent,
          html: userEmailContent,
        });

        // Send to admin
        await client.send({
          from: fromEmail,
          to: body.adminEmail,
          subject: `New IT Support Ticket: ${body.ticketTitle}`,
          content: adminEmailContent,
          html: adminEmailContent,
        });
      } else if (body.type === "user-confirmation") {
        await client.send({
          from: fromEmail,
          to: body.to,
          subject: body.subject,
          content: userEmailContent,
          html: userEmailContent,
        });
      } else if (body.type === "admin-notification") {
        await client.send({
          from: fromEmail,
          to: body.to,
          subject: body.subject,
          content: adminEmailContent,
          html: adminEmailContent,
        });
      } else if (body.type === "status-update") {
        await client.send({
          from: fromEmail,
          to: body.to,
          subject: body.subject,
          content: userEmailContent,
          html: userEmailContent,
        });
      }

      // Close connection
      await client.close();

      console.log("Email sent successfully to", body.to);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Email notification sent to ${body.to}${body.adminEmail && body.type === "both" ? " and " + body.adminEmail : ""}`,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          status: 200,
        },
      );
    } catch (emailError) {
      console.error("SMTP Error:", emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }
  } catch (error) {
    console.error("Error sending email notification:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to send email notification",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 400,
      },
    );
  }
});
