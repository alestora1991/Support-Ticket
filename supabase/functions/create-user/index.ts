// supabase/functions/create-user/index.ts

interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
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
    const body: CreateUserRequest = await req.json();
    const { email, password, fullName } = body;

    // Get supabase admin client
    const supabaseAdmin = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");

    if (!supabaseAdmin || !supabaseUrl) {
      throw new Error("Missing environment variables");
    }

    // Create user with admin privileges
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAdmin}`,
        apikey: supabaseAdmin,
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create user");
    }

    const userData = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        data: userData,
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
    console.error("Error creating user:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to create user",
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
