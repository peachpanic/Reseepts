import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get ID from query parameters
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    console.log("Fetching expenses for user:", id);

    if (!id) {
      return new Response(JSON.stringify({ error: "User ID is required" }), {
        status: 400,
      });
    }

    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*, transaction_item(*)")
      .eq("user_id", id);

    if (error) {
      console.log("Error fetching transactions:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Fetched transactions:", JSON.stringify(transactions, null, 2));

    return new Response(JSON.stringify({ transactions }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error fetching expenses:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transaction, transaction_items } = body;

    if (!transaction || !Array.isArray(transaction_items) || transaction_items.length === 0) {
      return new Response(
        JSON.stringify({ error: "transaction and non-empty transaction_items are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Attach the item list directly
    const payload = { ...transaction, transaction_items };

    console.log("Adding transaction with items via RPC:", JSON.stringify(payload, null, 2));

    // Call the RPC with a single argument
    const { data, error } = await supabase.rpc(
      "insert_transaction_with_items",
      { p_transaction: payload }
    );

    if (error) {
      console.error("RPC insert_transaction_with_items error:", error);
      return new Response(JSON.stringify({ error: error.message || error }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in POST /api/expenses (RPC):", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
