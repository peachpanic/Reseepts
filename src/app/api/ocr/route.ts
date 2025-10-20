import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(request: NextRequest) {
  try {
    const { imagePath } = await request.json();

    if (!imagePath) {
      return NextResponse.json(
        { error: "imagePath is required" },
        { status: 400 }
      );
    }

    // Build and secure path
    const fullPath = path.join(process.cwd(), "public", "images", imagePath);
    const resolvedPath = path.resolve(fullPath);
    const imagesDir = path.resolve(
      path.join(process.cwd(), "public", "images")
    );

    // Security check: ensure the resolved path is within the designated images directory
    if (!resolvedPath.startsWith(imagesDir)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json(
        { error: "Image file not found" },
        { status: 404 }
      );
    }

    // Fetch categories from database
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("categories")
      .select("*")
      .order("category_name", { ascending: true });

    if (categoriesError) {
      console.error("Failed to fetch categories:", categoriesError);
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: 500 }
      );
    }

    const categories = categoriesData || [];

    // Create a mapping object for the AI to understand
    const categoryMapping = categories.reduce(
      (
        acc: Record<string, number>,
        cat: { category_name: string; category_id: number }
      ) => {
        acc[cat.category_name] = cat.category_id;
        return acc;
      },
      {} as Record<string, number>
    );

    // Read and encode image
    const imageBuffer = fs.readFileSync(resolvedPath);
    const base64Image = imageBuffer.toString("base64");

    // Detect file type
    const ext = path.extname(imagePath).toLowerCase();
    const mediaType =
      ext === ".png"
        ? "image/png"
        : ext === ".gif"
        ? "image/gif"
        : ext === ".webp"
        ? "image/webp"
        : ext === ".jfif"
        ? "image/jpeg"
        : "image/jpeg";

    // Call Gemini (OpenRouter)
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GEMINI_API}`,
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": process.env.NEXT_PUBLIC_SITE_NAME || "SkyDev",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          temperature: 0,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text:
                    "You are an OCR assistant. Read the attached receipt image and extract only the structured data fields needed for an expense entry. " +
                    "Respond with JSON only — no explanations, no markdown, no extra text.",
                },
                {
                  type: "text",
                  text:
                    "Available categories from database: " +
                    JSON.stringify(categories) +
                    "\n\nCategory ID mapping:\n" +
                    JSON.stringify(categoryMapping, null, 2) +
                    "\n\n" +
                    "Return the result in this exact JSON format:\n" +
                    "{\n" +
                    '  "user_id": 1,\n' +
                    '  "category_id": <integer matching the category from the mapping above>,\n' +
                    '  "amount": <numeric>,\n' +
                    '  "description": "<merchant or summary>",\n' +
                    '  "payment_method": "<cash | credit | debit>",\n' +
                    '  "expense_date": "YYYY-MM-DD",\n' +
                    '  "created_at": "<ISO 8601 timestamp>",\n' +
                    '  "transaction_items": [\n' +
                    "    {\n" +
                    '      "item_name": "<product/service>",\n' +
                    '      "amount": <numeric>,\n' +
                    '      "subcategory": "<category name from the provided list>",\n' +
                    '      "created_at": "<ISO 8601 timestamp>"\n' +
                    "    }\n" +
                    "  ]\n" +
                    "}\n" +
                    "Rules:\n" +
                    "1. Output must be valid JSON only.\n" +
                    "2. Do not include markdown, code blocks, or comments.\n" +
                    "3. The 'subcategory' field for every transaction_items entry MUST be a non-null string that EXACTLY matches one of the category_name values from the database.\n" +
                    "4. The 'category_id' field MUST be the integer ID from the category mapping that best matches the overall expense type.\n" +
                    "5. For example, if the receipt is from a grocery store, use the category_id for 'Groceries' if it exists in the mapping.\n" +
                    "6. Ensure numeric fields are numbers (not strings).\n" +
                    "7. The 'amount' in transaction_items is the total price for that line item.\n" +
                    "8. The top-level 'amount' should be the SUM of all transaction_items' amount values.\n" +
                    "9. Set user_id to 1 as placeholder.\n" +
                    "10. Do NOT include 'expense_id' in transaction_items - it will be auto-generated by the database.\n" +
                    "11. Set created_at to current timestamp in ISO 8601 format.\n" +
                    "12. Match category names EXACTLY as they appear in the database (case-sensitive).\n" +
                    "13. The payment_method MUST be exactly one of: 'cash', 'credit', or 'debit' (no spaces, lowercase).\n",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mediaType};base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    let content = data?.choices?.[0]?.message?.content || "";

    // Clean up the response (remove potential JSON code blocks)
    content = content
      .replace(/^```json\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    let parsedJSON;
    try {
      parsedJSON = JSON.parse(content);
    } catch (err) {
      console.error("❌ Failed to parse Gemini JSON:", err);
      parsedJSON = { raw_content: content };
    }

    return NextResponse.json(parsedJSON);
  } catch (error) {
    console.error("OCR API error:", error);
    return NextResponse.json(
      { error: "Failed to process OCR request" },
      { status: 500 }
    );
  }
}
