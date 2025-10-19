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

    // Get transactions and include their related transaction_items
    // This relies on a foreign key relationship in the DB (transactions -> transaction_items).
    // Supabase lets you select related rows using the related table name as a field: transaction_items(*)
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select(`*, transaction_item(*)`)
      .eq("user_id", id);

    // Handle error
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    console.log("Fetched transactions:", transactions);

    // Success
    return new Response(JSON.stringify({ transactions }), { status: 200 });
  } catch (err) {
    console.error("Error fetching expenses:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
