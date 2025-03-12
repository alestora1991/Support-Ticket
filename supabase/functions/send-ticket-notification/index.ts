// supabase/functions/send-ticket-notification/index.ts

interface EmailNotificationRequest {
  recipientEmail: string;
  ticketId: string;
  ticketTitle: string;
  userName: string;
  isAdmin: boolean;
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
    const body: EmailNotificationRequest = await req.json();
    const { recipientEmail, ticketId, ticketTitle, userName, isAdmin } = body;

    // In a real implementation, you would send an actual email here
    // For this demo, we'll just log the email details and return a success response
    console.log("Email notification request:", {
      to: recipientEmail,
      ticketId,
      ticketTitle,
      userName,
      isAdmin,
    });

    // Prepare email content based on recipient type
    let subject = "";
    let emailContent = "";

    if (isAdmin) {
      subject = `New Support Ticket: ${ticketTitle}`;
      emailContent = `
        <h2>New Support Ticket Submitted</h2>
        <p>A new support ticket has been submitted and requires your attention.</p>
        <p><strong>Ticket ID:</strong> ${ticketId}</p>
        <p><strong>Title:</strong> ${ticketTitle}</p>
        <p><strong>Submitted by:</strong> ${userName}</p>
        <p>Please log in to the admin dashboard to review and assign this ticket.</p>
      `;
    } else {
      subject = `Your Support Ticket: ${ticketTitle} - Received`;
      emailContent = `
        <h2>Support Ticket Received</h2>
        <p>Dear ${userName},</p>
        <p>Thank you for submitting your support ticket. Our IT team has received your request and will start working on it shortly.</p>
        <p><strong>Ticket ID:</strong> ${ticketId}</p>
        <p><strong>Title:</strong> ${ticketTitle}</p>
        <p>We'll notify you when there are updates to your ticket.</p>
        <p>Thank you for your patience.</p>
      `;
    }

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email notification sent to ${recipientEmail}`,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      },
    );
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
