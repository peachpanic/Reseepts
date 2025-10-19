import { generateText } from "ai";
import { UserData } from "../definitions";

export const generateInsights = async (
  userData: UserData,
  model: any,
  daysDiff: number,
  totalExpenses: number,
  expenseCount: number,
  topCats: string
) => {
  const prompt = `You are a friendly financial advisor. Produce a VERY SHORT insights summary (max 3 bullets).
Include: 1) one-line overview of finances, 2) top spending category and amount, 3) three quick, practical tips to save.

User: ${userData.full_name}
Allowance: ₱${userData.allowance ?? "N/A"}
Savings goal: ${userData.savings_goal ?? "None"}
Total spent: ₱${totalExpenses.toFixed(
    2
  )} over ${daysDiff} days (${expenseCount} transactions)
Top categories: ${topCats}`;

  const { text: insights } = await generateText({
    model,
    prompt: prompt,
  });

  return insights;
};
