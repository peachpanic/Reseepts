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
//       // transaction_item. Create the view in your DB (SQL provided below).
//       const { data: transactions, error } = await supabase
//         .from("transactions")
//         .select(", transaction_item:transaction_item!expense_id()")
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

    console.log("=== API EXPENSES POST DEBUG ===");
    console.log("Raw body received:", JSON.stringify(body, null, 2));
    console.log("Body keys:", Object.keys(body));

    // Check if data is nested under 'transaction' key or direct
    const transactionInput = body.transaction || body;
    const { transaction_items, ...rest } = transactionInput;

    console.log("After extraction:");
    console.log("- rest keys:", Object.keys(rest));
    console.log(
      "- rest.user_id:",
      rest.user_id,
      "(type:",
      typeof rest.user_id,
      ")"
    );
    console.log(
      "- rest.amount:",
      rest.amount,
      "(type:",
      typeof rest.amount,
      ")"
    );
    console.log("- rest.category_id:", rest.category_id);
    console.log("- rest.description:", rest.description);
    console.log("- transaction_items count:", transaction_items?.length || 0);

    // Extract only the fields that exist in the transactions table
    const transactionData = {
      user_id: rest.user_id || 1, // Default to 1 if missing
      category_id: rest.category_id,
      amount: rest.amount,
      description: rest.description,
      payment_method: rest.payment_method,
      expense_date: rest.expense_date,
      created_at: rest.created_at || new Date().toISOString(),
    };

    console.log(
      "Transaction data to insert:",
      JSON.stringify(transactionData, null, 2)
    );

    // Validation with detailed error messages
    if (
      transactionData.user_id === undefined ||
      transactionData.user_id === null
    ) {
      console.error("VALIDATION FAILED: user_id is missing");
      return new Response(
        JSON.stringify({
          error: "user_id is required",
          received: body,
          extracted: transactionData,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (
      transactionData.amount === undefined ||
      transactionData.amount === null
    ) {
      console.error("VALIDATION FAILED: amount is missing");
      console.error("rest.amount was:", rest.amount);
      console.error("Full rest object:", JSON.stringify(rest, null, 2));
      return new Response(
        JSON.stringify({
          error: "amount is required",
          received: body,
          extracted: transactionData,
          restAmount: rest.amount,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 1: Insert the transaction first
    const { data: insertedTransaction, error: transactionError } =
      await supabase
        .from("transactions")
        .insert([transactionData])
        .select()
        .single();

    if (transactionError) {
      console.error("Error inserting transaction:", transactionError);
      return new Response(JSON.stringify({ error: transactionError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Transaction inserted successfully:", insertedTransaction);

    // Step 2: Insert transaction items if they exist
    let insertedItems = null;
    if (Array.isArray(transaction_items) && transaction_items.length > 0) {
      console.log("=== INSERTING TRANSACTION ITEMS ===");
      console.log("Transaction items to process:", transaction_items.length);
      console.log(
        "Expense ID from transaction:",
        insertedTransaction.expense_id
      );
      console.log(
        "Full inserted transaction:",
        JSON.stringify(insertedTransaction, null, 2)
      );

      // Verify the expense_id exists in the database
      const { data: verifyTransaction, error: verifyError } = await supabase
        .from("transactions")
        .select("expense_id")
        .eq("expense_id", insertedTransaction.expense_id)
        .single();

      if (verifyError) {
        console.error("=== VERIFICATION ERROR ===");
        console.error("Could not verify transaction exists:", verifyError);
      } else {
        console.log("Transaction verified:", verifyTransaction);
      }

      const itemsWithExpenseId = transaction_items.map((item, index) => {
        const mappedItem = {
          expense_id: insertedTransaction.expense_id,
          item_name: item.item_name || `Item ${index + 1}`,
          amount: Number(item.amount) || 0,
          subcategory: item.subcategory || null,
          created_at: item.created_at || new Date().toISOString(),
        };
        console.log(`Item ${index + 1}:`, JSON.stringify(mappedItem, null, 2));
        return mappedItem;
      });

      console.log("All items mapped. Total items:", itemsWithExpenseId.length);
      console.log(
        "Full items array:",
        JSON.stringify(itemsWithExpenseId, null, 2)
      );

      // Check if table name is correct
      console.log("Attempting insert into 'transaction_item' table...");

      const { data: items, error: itemsError } = await supabase
        .from("transaction_item")
        .insert(itemsWithExpenseId)
        .select();

      if (itemsError) {
        console.error("=== ERROR INSERTING ITEMS ===");
        console.error("Error code:", itemsError.code);
        console.error("Error message:", itemsError.message);
        console.error("Error hint:", itemsError.hint);
        console.error("Error details:", itemsError.details);
        console.error(
          "Full error object:",
          JSON.stringify(itemsError, null, 2)
        );
        console.error(
          "Items that failed:",
          JSON.stringify(itemsWithExpenseId, null, 2)
        );

        // Try inserting one item at a time to find which one fails
        console.log("=== ATTEMPTING INDIVIDUAL INSERTS ===");
        for (let i = 0; i < itemsWithExpenseId.length; i++) {
          const singleItem = [itemsWithExpenseId[i]];
          const { error: singleError } = await supabase
            .from("transaction_item")
            .insert(singleItem);

          if (singleError) {
            console.error(
              `Item ${i + 1} failed:`,
              JSON.stringify(singleItem[0], null, 2)
            );
            console.error(`Error:`, JSON.stringify(singleError, null, 2));
          } else {
            console.log(`Item ${i + 1} inserted successfully`);
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            transaction: insertedTransaction,
            transaction_items: [],
            warning: `Transaction created but items failed to insert: ${itemsError.message}`,
            error_details: itemsError,
          }),
          {
            status: 201,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      insertedItems = items;
      console.log("=== ITEMS INSERTED SUCCESSFULLY ===");
      console.log("Inserted items count:", insertedItems?.length || 0);
      console.log("Inserted items:", JSON.stringify(insertedItems, null, 2));
    } else {
      console.log("No transaction items to insert");
    }

    // Step 3: Return the complete transaction with items
    console.log("=== FINAL RESPONSE ===");
    const finalResponse = {
      success: true,
      transaction: {
        ...insertedTransaction,
        transaction_items: insertedItems || [],
      },
    };
    console.log("Response:", JSON.stringify(finalResponse, null, 2));

    return new Response(JSON.stringify(finalResponse), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in POST /api/expenses:", err);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
