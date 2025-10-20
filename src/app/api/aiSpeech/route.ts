import { NextResponse } from "next/server";
import { inferExpenseFromSentence } from "@/lib/utils/aiUtils";
import { google } from "@ai-sdk/google";

export const POST = async (req: Request) => {
  try {
    const { sentence, user_id } = await req.json();

    // Validate input
    if (!sentence || typeof sentence !== "string") {
      return NextResponse.json(
        { error: "Sentence is required and must be a string" },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Infer expense data from sentence using AI
    const expenseData = await inferExpenseFromSentence(
      sentence,
      google("gemini-2.0-flash-exp")
    );

    // Return the parsed data without inserting
    return NextResponse.json(
      {
        success: true,
        parsed: expenseData,
        original_sentence: sentence,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing expense:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
};
