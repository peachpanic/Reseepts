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
    const { transaction } = body;

    console.log("Received transaction to add:", JSON.stringify(transaction, null, 2));

    // Insert the parent transaction
    const { data: txData, error: txError } = await supabase
      .from("transactions")
      .insert([{
        user_id: transaction.user_id,
        category_id: transaction.category_id,
        amount: transaction.amount,
        description: transaction.description,
        payment_method: transaction.payment_method,
        expense_date: transaction.expense_date,
        created_at: transaction.created_at
      }])
      .select("expense_id")
      .single();

    if (txError || !txData) {
      return new Response(JSON.stringify({ error: txError?.message || "Failed to insert transaction" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const expense_id = txData.expense_id;

    // Insert all items, linking to the new expense_id
    const itemsToInsert = transaction.transaction_items.map(item => ({
      expense_id,
      item_name: item.item_name,
      subcategory: item.subcategory,
      amount: item.amount,
      created_at: item.created_at
    }));

    const { error: itemsError } = await supabase
      .from("transaction_item")
      .insert(itemsToInsert);

    if (itemsError) {
      return new Response(JSON.stringify({ error: itemsError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Always return the new expense_id
    return new Response(JSON.stringify({ expense_id }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}