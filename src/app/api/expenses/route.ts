// import { supabase } from "@/lib/supabase";
// import { NextRequest } from "next/server";

// export async function GET(req: NextRequest) {
//   try {
//     // Get ID from query parameters
//     const searchParams = req.nextUrl.searchParams;
//     const id = searchParams.get("id");
//     const period = searchParams.get("period");

//     console.log("Fetching expenses for user:", id);

//     if (!id) {
//       return new Response(JSON.stringify({ error: "User ID is required" }), {
//         status: 400,
//       });
//     }

//     // query with a date filter
//     let query = supabase
//       .from("transactions")
//       .select("*")
//       .eq("user_id", id)

//     // calculate range based on period
//     if (period) {
//       const now = new Date();
//       let startDate: Date;

//       switch (period) {
//         case "day":
//           startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//           break;
//         case "week":
//           const dayOfWeek = now.getDay();
//           startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
//           startDate.setHours(0, 0, 0, 0);
//           break;
//         case "month":
//           startDate = new Date(now.getFullYear(), now.getMonth(), 1);
//           break;
//         case "year":
//           startDate = new Date(now.getFullYear(), 0, 1);
//           break;
//         default:
//           startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//       }

//       query = query.gte("expense_date", startDate.toISOString());
//     }

//     // apply ordering
//     query = query.order("expense_date", { ascending: false });

//       // Query a view that returns transactions with their items aggregated as
//       // `transaction_item`. Create the view in your DB (SQL provided below).
//       const { data: transactions, error } = await supabase
//         .from("transactions")
//         .select("*, transaction_item:transaction_item!expense_id(*)")
//         .eq("user_id", id);

//     console.log("Fetched transactions:", transactions);

//     if (error) {
//       return new Response(JSON.stringify({ error: error.message }), {
//         status: 500,
//       });
//     }

//     return new Response(JSON.stringify({ transactions }), { status: 200 });
//   } catch (err) {
//     console.error("Error fetching expenses:", err);
//     return new Response(JSON.stringify({ error: "Internal server error" }), {
//       status: 500,
//     });
//   }
// }

import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get parameters from query
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");
    const period = searchParams.get("period");
    const limit = searchParams.get("limit");
    const sortBy = searchParams.get("sortBy") || "expense_date";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    console.log("Fetching expenses for user:", id, {
      period,
      limit,
      sortBy,
      sortOrder,
    });

    if (!id) {
      return new Response(JSON.stringify({ error: "User ID is required" }), {
        status: 400,
      });
    }

    // Build base query with transaction_items joined
    let query = supabase
      .from("transactions")
      .select(
        `
        expense_id,
        user_id,
        category_id,
        amount,
        description,
        payment_method,
        expense_date,
        created_at,
        categories (
          category_name,
          icon
        ),
        transaction_items:transaction_item!expense_id(*)
      `
      )
      .eq("user_id", id);

    // Apply period filter if provided
    if (period) {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case "day":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case "week":
          const dayOfWeek = now.getDay();
          startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
      }

      query = query.gte("expense_date", startDate.toISOString());
    }

    // Apply sorting
    const ascending = sortOrder === "asc";

    // Map 'date' to 'expense_date' for consistency
    const sortColumn = sortBy === "date" ? "expense_date" : sortBy;
    query = query.order(sortColumn, { ascending });

    // Apply limit if provided
    if (limit) {
      query = query.limit(parseInt(limit, 10));
    }

    const { data: transactions, error } = await query;

    console.log("Fetched transactions:", transactions?.length || 0, "items");

    if (error) {
      console.error("Supabase error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

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