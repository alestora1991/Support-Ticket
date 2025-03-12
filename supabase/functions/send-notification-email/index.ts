// supabase/functions/send-notification-email/index.ts

interface EmailRequestBody {
  to: string;
  subject: string;
  ticketId: string;
  ticketTitle: string;
  userName: string;
  userEmail?: string;
  status?: string;
  type: "user-confirmation" | "admin-notification" | "status-update";
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

    // In a real implementation, you would send an actual email here
    // For this demo, we'll just log the email details and return a success response
    console.log("Email notification request:", {
      to: body.to,
      subject: body.subject,
      ticketId: body.ticketId,
      ticketTitle: body.ticketTitle,
      type: body.type,
    });

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email notification sent to ${body.to}`,
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
