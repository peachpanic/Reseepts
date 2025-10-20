import { supabase } from "@/lib/supabase";
import { generateInsights } from "@/lib/utils/aiUtils";
import { google } from "@ai-sdk/google";
import { NextResponse } from "next/server";

const CACHE_DURATION_HOURS = 24; // Cache insights for 24 hours

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    // Check if there's a recent insight in the database
    const { data: recentInsight, error: cacheError } = await supabase
      .from("insights_weekly_analysis")
      .select("id, insights_summary, created_at")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // If recent insight exists and is fresh, return it
    if (recentInsight && !cacheError) {
      const createdAt = new Date(recentInsight.created_at);
      const now = new Date();
      const hoursDiff =
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      if (hoursDiff < CACHE_DURATION_HOURS) {
        return NextResponse.json(
          {
            insights: recentInsight.insights_summary,
            cached: true,
            cached_at: recentInsight.created_at,
          },
          { status: 200 }
        );
      }
    }

    // Fetch user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("full_name, allowance, savings_goal")
      .eq("user_id", user_id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch user's expenses with category information
    const { data: expenses, error: expensesError } = await supabase
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
          category_name
        )
      `
      )
      .eq("user_id", user_id)
      .order("expense_date", { ascending: false })
      .limit(100); // Last 100 expenses

    if (expensesError) {
      console.log(expensesError);
      return NextResponse.json(
        { error: "Failed to fetch expenses" },
        { status: 500 }
      );
    }

    if (!expenses || expenses.length === 0) {
      return NextResponse.json(
        {
          insights:
            "No expense data available yet. Start tracking your expenses to get personalized insights!",
          summary: {
            total_expenses: 0,
            expense_count: 0,
            avg_daily_spending: 0,
          },
        },
        { status: 200 }
      );
    }

    // Calculate summary statistics
    const totalExpenses = expenses.reduce(
      (sum, exp) => sum + Number(exp.amount),
      0
    );
    const expenseCount = expenses.length;

    // Calculate date range
    const dates = expenses.map((e) => new Date(e.expense_date));
    const oldestDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const newestDate = new Date(Math.max(...dates.map((d) => d.getTime())));
    const daysDiff = Math.max(
      1,
      Math.ceil(
        (newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
    const avgDailySpending = totalExpenses / daysDiff;

    // Group by category
    const categoryBreakdown: Record<string, { total: number; count: number }> =
      {};
    expenses.forEach((exp) => {
      const categoryName =
        (exp as any).categories?.category_name || "Uncategorized";
      if (!categoryBreakdown[categoryName]) {
        categoryBreakdown[categoryName] = { total: 0, count: 0 };
      }
      categoryBreakdown[categoryName].total += Number(exp.amount);
      categoryBreakdown[categoryName].count += 1;
    });

    // Group by payment method
    const paymentMethodBreakdown: Record<string, number> = {};
    expenses.forEach((exp) => {
      paymentMethodBreakdown[exp.payment_method] =
        (paymentMethodBreakdown[exp.payment_method] || 0) + Number(exp.amount);
    });

    const topCats = Object.entries(categoryBreakdown)
      .slice(0, 3)
      .map(([cat, d]) => `${cat}: ₱${d.total.toFixed(2)}`)
      .join(", ");

    // Generate new insights
    const insights = await generateInsights(
      userData,
      google("gemini-2.0-flash-exp"),
      daysDiff,
      totalExpenses,
      expenseCount,
      topCats
    );

    // Save insights to database
    const { data: savedInsight, error: insertError } = await supabase
      .from("insights_weekly_analysis")
      .insert({
        user_id: user_id,
        insights_summary: insights,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving insights:", insertError);
    }

    // Return insights with summary data
    return NextResponse.json(
      {
        insights,
        cached: false,
        generated_at: new Date().toISOString(),
        // summary: {
        //   total_expenses: totalExpenses,
        //   expense_count: expenseCount,
        //   avg_daily_spending: avgDailySpending,
        //   date_range: {
        //     from: oldestDate.toISOString().split("T")[0],
        //     to: newestDate.toISOString().split("T")[0],
        //     days: daysDiff,
        //   },
        //   category_breakdown: categoryBreakdown,
        //   payment_method_breakdown: paymentMethodBreakdown,
        // },
        // user_info: {
        //   allowance: userData.allowance,
        //   savings_goal: userData.savings_goal,
        //   budget_remaining: userData.allowance
        //     ? userData.allowance - totalExpenses
        //     : null,
        // },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json(
      {
        error: "Failed to generate insights",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
