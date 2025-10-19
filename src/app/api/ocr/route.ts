import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const { imagePath } = await request.json();

    if (!imagePath) {
      return NextResponse.json({ error: 'imagePath is required' }, { status: 400 });
    }

    // Build and secure path
    const fullPath = path.join(process.cwd(), 'public', 'images', imagePath);
    const resolvedPath = path.resolve(fullPath);
    const imagesDir = path.resolve(path.join(process.cwd(), 'public', 'images'));

    if (!resolvedPath.startsWith(imagesDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json({ error: 'Image file not found' }, { status: 404 });
    }

    // Read and encode image
    const imageBuffer = fs.readFileSync(resolvedPath);
    const base64Image = imageBuffer.toString("base64");

    // Detect file type
    const ext = path.extname(imagePath).toLowerCase();
    const mediaType =
      ext === '.png' ? 'image/png' :
      ext === '.gif' ? 'image/gif' :
      ext === '.webp' ? 'image/webp' :
      ext === '.jfif' ? 'image/jpeg' :
      'image/jpeg';

    // Call Gemini (OpenRouter)
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GEMINI_API}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': process.env.NEXT_PUBLIC_SITE_NAME || 'SkyDev',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text:
                  'You are an OCR assistant. Read the attached receipt image and extract only the structured data fields needed for an expense entry. ' +
                  'Respond with JSON only — no explanations, no markdown, no extra text.'
              },
              {
                type: 'text',
                text:
                  'Return the result in this exact JSON format:\n' +
                  '{\n' +
                  '  "user_id": <integer>,\n' +
                  '  "category_id": <integer>,\n' +
                  '  "amount": <numeric>,\n' +
                  '  "description": "<merchant or summary>",\n' +
                  '  "payment_method": "<cash | credit card | debit | other>",\n' +
                  '  "expense_date": "YYYY-MM-DD",\n' +
                  '  "created_at": "YYYY-MM-DDTHH:MM:SSZ",\n' +
                  '  "line_items": [\n' +
                  '    {\n' +
                  '      "item_name": "<product/service>",\n' +
                  '      "quantity": <numeric>,\n' +
                  '      "unit_price": <numeric>,\n' +
                  '      "total_price": <numeric>\n' +
                  '    }\n' +
                  '  ]\n' +
                  '}\n' +
                  'Rules:\n' +
                  '1. Output must be valid JSON only.\n' +
                  '2. Do not include markdown, code blocks, or comments.\n' +
                  '3. Use null for missing fields.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mediaType};base64,${base64Image}`
                }
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mediaType};base64,${base64Image}`
                }
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    // --- ✅ Clean and return only structured JSON ---
    let content = data?.choices?.[0]?.message?.content || '';

    // Remove Markdown fences (```json ... ```)
    content = content.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();

    let parsedJSON;
    try {
      parsedJSON = JSON.parse(content);
    } catch (err) {
      console.error('❌ Failed to parse Gemini JSON:', err);
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
