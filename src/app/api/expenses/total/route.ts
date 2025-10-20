import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase";

export async function GET() {
  // Get user session
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all expenses for the user
  const { data, error } = await supabase
    .from("expenses")
    .select("amount, type")
    .eq("user_email", session.user.email);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate totals
  let total = 0;
  let income = 0;
  let expenses = 0;
  if (data) {
    for (const item of data) {
      if (item.type === "income") {
        income += Number(item.amount);
      } else {
        expenses += Number(item.amount);
      }
    }
    total = income - expenses;
  }

  return NextResponse.json({ total, income, expenses });
}
