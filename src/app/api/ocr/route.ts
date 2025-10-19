import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const { imagePath } = await request.json();

    if (!imagePath) {
      return NextResponse.json(
        { error: "imagePath is required" },
        { status: 400 }
      );
    }

    // Read the image file from public/images folder
    const fullPath = path.join(process.cwd(), "public", "images", imagePath);

    // Security check: prevent directory traversal
    const resolvedPath = path.resolve(fullPath);
    const imagesDir = path.resolve(
      path.join(process.cwd(), "public", "images")
    );
    if (!resolvedPath.startsWith(imagesDir)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json(
        { error: "Image file not found" },
        { status: 404 }
      );
    }

    // Read and encode image to base64
    const imageBuffer = fs.readFileSync(resolvedPath);
    const base64Image = imageBuffer.toString("base64");

    // Determine media type based on file extension
    const ext = path.extname(imagePath).toLowerCase();
    let mediaType = "image/jpeg";
    if (ext === ".png") mediaType = "image/png";
    if (ext === ".gif") mediaType = "image/gif";
    if (ext === ".webp") mediaType = "image/webp";
    if (ext === ".jfif") mediaType = "image/jpeg"; // JFIF is JPEG format

    // Call OpenRouter Gemini API with base64 image
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
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `
Perform OCR on this image. 
Return only the exact extracted text as it appears, without any explanations, context, or descriptions.
Do not add any words or commentary. 
If the text is unclear, output "[unreadable]" for those parts. 
Preserve line breaks and spacing.
  `,
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
    return NextResponse.json(data);
  } catch (error) {
    console.error("OCR API error:", error);
    return NextResponse.json(
      { error: "Failed to process OCR request" },
      { status: 500 }
    );
  }
}
