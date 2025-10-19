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

      // Query a view that returns transactions with their items aggregated as
      // `transaction_item`. Create the view in your DB (SQL provided below).
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("*, transaction_item:transaction_item!expense_id(*)")
        .eq("user_id", id);

    console.log("Fetched transactions:", transactions);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ transactions }), { status: 200 });
  } catch (err) {
    console.error("Error fetching expenses:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
