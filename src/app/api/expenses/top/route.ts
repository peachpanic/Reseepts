import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("id");
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    const period = searchParams.get("period");

    console.log("Fetching top expenses for user: ", userId);

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

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

    const { data: expenses, error } = await supabase
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
                )
            `
      )
      .eq("user_id", userId)
      .order("amount", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Supabase error: ", error);
      return NextResponse.json(
        { error: "Failed to fetch top expenses: ", details: error.message },
        { status: 500 }
      );
    }

    console.log("Fetched top expenses: ", expenses);

    return NextResponse.json({ expenses: expenses || [] });
  } catch (error) {
    console.error("");
  }
}
