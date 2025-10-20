import { generateText } from "ai";
import { UserData } from "../definitions";

interface InsightsResponse {
  insights_summary: string;
  practical_tips: string[];
}

interface ExpenseInferenceResponse {
  item_name: string;
  amount: number;
  subcategory: string;
}

export const generateInsights = async (
  userData: UserData,
  model: any,
  daysDiff: number,
  totalExpenses: number,
  expenseCount: number,
  topCats: string
): Promise<InsightsResponse> => {
  const prompt = `You are a friendly and insightful financial advisor. Analyze the user's spending patterns and produce a detailed yet easy-to-understand insights summary.

Your summary should include:
1) A comprehensive overview of their financial health (2-3 sentences) - comment on their spending patterns, how they're doing against their allowance and savings goal
2) Detailed analysis of top spending categories - breakdown the top 3 categories with amounts and observations
3) Specific spending habits and trends - identify any concerning patterns or positive behaviors
4) Three actionable, practical money-saving tips tailored to their spending habits

Keep the tone friendly and encouraging, not judgmental. Provide real, personalized advice based on their data.

Return ONLY valid JSON in this exact format:
{
  "insights_summary": "<your detailed insights here - 4-5 sentences covering all points above>",
  "practical_tips": [
    "<specific, actionable tip 1>",
    "<specific, actionable tip 2>",
    "<specific, actionable tip 3>"
  ]
}

User: ${userData.full_name}
Allowance: ₱${userData.allowance ?? "N/A"}
Savings goal: ${userData.savings_goal ?? "None"}
Total spent: ₱${totalExpenses.toFixed(
    2
  )} over ${daysDiff} days (${expenseCount} transactions)
Top categories: ${topCats}`;

  const { text: insights } = await generateText({
    model,
    prompt,
  });

  try {
    // Extract JSON if the response contains extra text
    const jsonMatch = insights.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsedInsights: InsightsResponse = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (
      !parsedInsights.insights_summary ||
      !Array.isArray(parsedInsights.practical_tips)
    ) {
      throw new Error("Missing required fields in JSON response");
    }

    if (parsedInsights.practical_tips.length !== 3) {
      console.warn(
        "Expected 3 tips, got",
        parsedInsights.practical_tips.length
      );
    }

    return parsedInsights;
  } catch (error) {
    console.error("Failed to parse insights JSON:", error);
    throw new Error(
      `Invalid JSON response from AI model: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const inferExpenseFromSentence = async (
  sentence: string,
  model: any
): Promise<ExpenseInferenceResponse> => {
  const prompt = `You are a financial data parser. Extract expense information from the user's natural language input.

Your task:
1) Identify the item/service purchased (item_name)
2) Extract the amount spent (amount as a number, without currency symbols)
3) Categorize the expense into one of these subcategories:
   - Food & Dining (meals, restaurants, groceries, snacks)
   - Transportation (commute, gas, parking, rides)
   - Entertainment (movies, games, hobbies, subscriptions)
   - Shopping (clothes, electronics, personal items)
   - Bills & Utilities (rent, electricity, water, internet)
   - Health & Wellness (medicine, gym, personal care)
   - Education (books, courses, school supplies)
   - Other (anything that doesn't fit above)

Examples:
- "I spent 150 on lunch at Jollibee" → item_name: "Lunch at Jollibee", amount: 150, subcategory: "Food & Dining"
- "Grabbed coffee for 85 pesos" → item_name: "Coffee", amount: 85, subcategory: "Food & Dining"
- "Paid 50 for jeepney fare" → item_name: "Jeepney fare", amount: 50, subcategory: "Transportation"
- "Bought a shirt 500" → item_name: "Shirt", amount: 500, subcategory: "Shopping"

Return ONLY valid JSON in this exact format:
{
  "item_name": "<descriptive name of the purchase>",
  "amount": <numeric value only>,
  "subcategory": "<one of the categories listed above>"
}

User input: "${sentence}"`;

  const { text: response } = await generateText({
    model,
    prompt,
  });

  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsedExpense: ExpenseInferenceResponse = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (
      !parsedExpense.item_name ||
      typeof parsedExpense.amount !== "number" ||
      !parsedExpense.subcategory
    ) {
      throw new Error("Missing or invalid fields in JSON response");
    }

    // Validate amount is positive
    if (parsedExpense.amount <= 0) {
      throw new Error("Amount must be a positive number");
    }

    return parsedExpense;
  } catch (error) {
    console.error("Failed to parse expense inference JSON:", error);
    throw new Error(
      `Invalid JSON response from AI model: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
