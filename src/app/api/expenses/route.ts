import { supabase } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get ID from query parameters
    const id = req.nextUrl.searchParams.get("id");

    console.log("Fetching expenses for user:", id);

    if (!id) {
      return new Response(JSON.stringify({ error: "User ID is required" }), {
        status: 400,
      });
    }

    // Get expenses from User
    const { data: expenses, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", id);

    // Handle error
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    // Success
    return new Response(JSON.stringify({ expenses }), { status: 200 });
  } catch (err) {
    console.error("Error fetching expenses:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
