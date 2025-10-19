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

    // query with a date filter
    let query = supabase
      .from("transactions")
      .select("*")
      .eq("user_id", id)


    // calculate range based on period
    if (period) {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case "day":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
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
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      }

      query = query.gte("expense_date", startDate.toISOString());
    }

    // apply ordering
    query = query.order("expense_date", { ascending: false });

    // Get expenses from User
    const { data: expenses, error } = await query;

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
