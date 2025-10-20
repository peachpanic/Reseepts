import { supabase } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get ID from query parameters
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");
    const period = searchParams.get("period");

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
    let { transaction, transaction_items } = body;

    if (!transaction) {
      return new Response(
        JSON.stringify({ error: "transaction is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Prefer explicit top-level transaction_items, otherwise accept transaction.line_items
    const itemsToAttach =
      Array.isArray(transaction_items) && transaction_items.length > 0
        ? transaction_items
        : Array.isArray(transaction?.line_items) &&
          transaction.line_items.length > 0
        ? transaction.line_items
        : null;

    // ensure we never pass line_items to a plain insert
    if (transaction?.line_items) delete transaction.line_items;

    // Use RPC to perform atomic insert of transaction and its items
    const { data, error } = await supabase.rpc(
      "insert_transaction_with_items",
      {
        p_transaction: transaction,
        p_items: itemsToAttach,
      }
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
