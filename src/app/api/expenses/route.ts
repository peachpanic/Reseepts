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

    // Add these console.logs
    console.log("Query executed for user_id:", id);
    console.log("Transactions data:", JSON.stringify(transactions, null, 2));
    console.log("Query error:", error);

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
    const {
      user_id,
      category_id,
      amount,
      description,
      payment_method,
      expense_date,
      transaction_items,
    } = body;

    // Validate required fields
    if (!user_id || !amount || !expense_date) {
      return NextResponse.json(
        { error: "Missing required fields: user_id, amount, expense_date" },
        { status: 400 }
      );
    }

    // Normalize payment_method to match database constraint
    // Common values: 'cash', 'credit', 'debit', 'bank transfer', 'e-wallet', etc.
    let normalizedPaymentMethod = (payment_method || "cash")
      .toLowerCase()
      .trim();

    // Map common variations to database-accepted values
    if (normalizedPaymentMethod.includes("credit")) {
      normalizedPaymentMethod = "credit";
    } else if (normalizedPaymentMethod.includes("debit")) {
      normalizedPaymentMethod = "debit";
    } else if (normalizedPaymentMethod === "cash") {
      normalizedPaymentMethod = "cash";
    } else {
      // Default to cash if unknown
      normalizedPaymentMethod = "cash";
    }

    console.log("Original payment_method:", payment_method);
    console.log("Normalized payment_method:", normalizedPaymentMethod);

    // Insert transaction first
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert([
        {
          user_id,
          category_id,
          amount,
          description,
          payment_method: normalizedPaymentMethod,
          expense_date,
        },
      ])
      .select()
      .single();

    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
      return NextResponse.json(
        { error: transactionError.message },
        { status: 500 }
      );
    }

    const expenseId = transaction.expense_id;
    console.log("Created transaction with expense_id:", expenseId);

    // Insert transaction items if provided
    if (
      transaction_items &&
      Array.isArray(transaction_items) &&
      transaction_items.length > 0
    ) {
      const itemsToInsert = transaction_items.map(
        (item: { item_name: string; amount: number; subcategory: string }) => ({
          expense_id: expenseId,
          item_name: item.item_name,
          amount: item.amount,
          subcategory: item.subcategory,
        })
      );

      console.log("Inserting transaction items with expense_id:", expenseId);
      console.log("Items to insert:", JSON.stringify(itemsToInsert, null, 2));

      const { data: insertedItems, error: itemsError } = await supabase
        .from("transaction_item")
        .insert(itemsToInsert)
        .select();

      if (itemsError) {
        console.error("Error creating transaction items:", itemsError);
        // Transaction was created but items failed - you might want to handle this differently
        return NextResponse.json(
          {
            warning: "Transaction created but items insertion failed",
            transaction,
            error: itemsError.message,
          },
          { status: 207 }
        );
      }

      console.log(
        "Successfully inserted items:",
        JSON.stringify(insertedItems, null, 2)
      );
    }

    // Fetch the complete transaction with items
    const { data: completeTransaction, error: fetchError } = await supabase
      .from("transactions")
      .select("*, transaction_item(*)")
      .eq("expense_id", expenseId)
      .single();

    if (fetchError) {
      console.error("Error fetching complete transaction:", fetchError);
      return NextResponse.json(
        { transaction, warning: "Transaction created but fetch failed" },
        { status: 201 }
      );
    }

    console.log(
      "Complete transaction with items:",
      JSON.stringify(completeTransaction, null, 2)
    );

    return NextResponse.json(
      { transaction: completeTransaction },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating expense:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
