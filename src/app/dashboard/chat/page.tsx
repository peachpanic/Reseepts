"use client";

import { useEffect, useState } from "react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useOCR } from "@/hooks/useOCR";
import { FileUploadInput } from "@/components/FileUploadInput";
import { OCRButton } from "@/components/OCRButton";
import { ResultsDisplay } from "@/components/ResultsDisplay";

// Helper: remove Markdown code fences (e.g., ```text ... ```) and trim
function stripCodeFences(text: string): string {
  if (!text) return "";
  // Replace any fenced blocks with their inner content
  const withoutFences = text.replace(/```[\w-]*\n([\s\S]*?)\n?```/g, "$1");
  return withoutFences.trim();
}

// Helper: extract assistant text content from various API response shapes
function extractTextFromResponse(data: unknown): string {
  try {
    let content: unknown = undefined;

    if (typeof data === "object" && data !== null) {
      const obj = data as Record<string, unknown>;

      // OpenRouter/Gemini chat.completion shape: choices[0].message.content
      const choices = obj["choices"] as unknown;
      if (Array.isArray(choices)) {
        const first = choices[0] as unknown;
        if (first && typeof first === "object") {
          const firstObj = first as Record<string, unknown>;
          const message = firstObj["message"] as unknown;
          if (message && typeof message === "object") {
            const msg = message as Record<string, unknown>;
            const msgContent = msg["content"] as unknown;
            if (typeof msgContent === "string" || Array.isArray(msgContent)) {
              content = msgContent;
            }
          }
        } else if (typeof first === "string") {
          content = first;
        }
      }

      // Alternative shapes
      if (content === undefined) {
        const message = obj["message"] as unknown;
        if (message && typeof message === "object") {
          const msg = message as Record<string, unknown>;
          const msgContent = msg["content"] as unknown;
          if (typeof msgContent === "string") content = msgContent;
        }
      }

      if (content === undefined) {
        const directContent = obj["content"] as unknown;
        if (typeof directContent === "string") content = directContent;
      }
    }

    if (typeof content === "string") return stripCodeFences(content);

    if (Array.isArray(content)) {
      const textParts = (content as unknown[])
        .map((p) => {
          if (typeof p === "string") return p;
          if (typeof p === "object" && p !== null) {
            const po = p as Record<string, unknown>;
            const t = po["text"];
            if (typeof t === "string") return t;
          }
          return "";
        })
        .join("\n")
        .trim();
      if (textParts) return stripCodeFences(textParts);
    }

    // Fallback: stringify
    return stripCodeFences(
      typeof data === "string" ? data : globalThis.JSON.stringify(data, null, 2)
    );
  } catch {
    return "";
  }
}

export default function GeminiPage() {
  // ✅ prefixed unused states to silence ESLint
  const [_imageRecognitionResponse, setImageRecognitionResponse] = useState<
    string | null
  >(null);
  const [_imageRecognitionError, setImageRecognitionError] = useState<
    string | null
  >(null);

  const {
    filename,
    loading: uploadLoading,
    error: uploadError,
    handleFileUpload,
  } = useFileUpload();
  const {
    result: ocrResult,
    loading: ocrLoading,
    error: ocrError,
    performOCROnImage,
  } = useOCR();

  const [chatLoading, setChatLoading] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [updatedOCRResult, setUpdatedOCRResult] = useState(null);

  useEffect(() => {
    const fetchImageRecognition = async () => {
      try {
        const res = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: globalThis.JSON.stringify({
            model: "google/gemini-2.0-flash-001",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: "What is in this image?" },
                  {
                    type: "image_url",
                    image_url: {
                      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
                    },
                  },
                ],
              },
            ],
          }),
        });
        const data = await res.json();
        setImageRecognitionResponse(extractTextFromResponse(data));
      } catch (err) {
        setImageRecognitionError((err as Error).message);
      }
    };
    fetchImageRecognition();
  }, []);

  // Handles OCR
  const handleOCRSubmit = async () => {
    const targetFilename = filename;
    if (!targetFilename) return;

    setImageRecognitionError(null);
    setImageRecognitionResponse(null);

    try {
      await performOCROnImage(targetFilename);
      setImageRecognitionResponse(
        globalThis.JSON.stringify(ocrResult, null, 2)
      );
    } catch (error) {
      setImageRecognitionError((error as Error).message);
    }
  };

  const parsedOCRResult =
    typeof ocrResult === "string"
      ? globalThis.JSON.parse(ocrResult)
      : ocrResult;

  const handleChatSubmit = async () => {
    if (!parsedOCRResult) {
      alert("No OCR result to augment. Perform OCR first.");
      return;
    }

    if (!userInput.trim()) return;

    setChatLoading(true);
    setImageRecognitionError(null);

    try {
      const base = updatedOCRResult ?? parsedOCRResult;

      const categoriesList = [
        "Food",
        "Travel",
        "Office Supplies",
        "Entertainment",
        "Utilities",
        "Healthcare",
        "Housing/Rent",
        "Mortgage",
        "Transportation",
        "Auto/Car Payment",
        "Insurance",
        "Personal Care",
        "Clothing",
        "Education",
        "Debt Repayment",
        "Savings & Investments",
        "Gifts & Donations",
        "Pets",
        "Appliances",
        "Other",
      ];

      const systemInstruction = `You are an assistant that receives an existing expense JSON and a short user instruction.
YOU MUST return ONLY a single valid JSON object (no markdown, no code fences, no explanation).
The JSON must match the same schema. Numeric fields must be numbers (not strings).

Important rules:
1) The 'sub_category' field inside every line_items entry MUST be exactly one of: ${JSON.stringify(
        categoriesList
      )}.
2) NEVER return sub_category:null. If you cannot determine a precise sub_category, return "Other".
3) If an item name clearly indicates food (apple, orange, banana, gatorade, juice, milk, bread, rice, etc.), set sub_category to "Food".
4) Provide explicit examples: e.g. "apple" -> "Food", "gatorade" -> "Food", "t-shirt" -> "Clothing", "push pins" -> "Office Supplies", "biogesic" -> "Healthcare".
5) Output only the complete JSON object and nothing else.
6) **CRITICAL: After adding, removing, or modifying any line_items, you MUST recalculate the top-level "amount" field as the SUM of all line_items' total_price values.**
7) Example: If line_items are [{"total_price": 100}, {"total_price": 50}], then "amount" must be 150.
8) Keep the top-level "main_category" field as is unless the user explicitly asks to change it.
9) Do NOT add extra fields like "category" to line_items. Only use the fields that exist: item_name, sub_category, quantity, unit_price, total_price.`;

      const userMessage = `Current expense data:\n${globalThis.JSON.stringify(
        base,
        null,
        2
      )}\n\nUser instruction: ${userInput}`;

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: globalThis.JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            {
              role: "system",
              content: [{ type: "text", text: systemInstruction }],
            },
            { role: "user", content: [{ type: "text", text: userMessage }] },
          ],
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Request failed (${res.status}): ${errText}`);
      }

      const data = await res.json();
      const assistantText = extractTextFromResponse(data);

      let parsed;
      try {
        parsed = globalThis.JSON.parse(assistantText);
      } catch (err) {
        console.error("JSON parse error: ", err);
        throw new Error("Assistant returned non-JSON response: " + assistantText);
      }

      setUpdatedOCRResult(parsed);
      setUserInput("");
    } catch (err) {
      setImageRecognitionError((err as Error).message);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <section style={{ marginBottom: "30px" }}>
        <h2>OCR (Optical Character Recognition)</h2>
        <p style={{ color: "#666", fontSize: "14px" }}>
          Extracts text from images
        </p>

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            background: "#fafafa",
            padding: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 260 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "#555",
                  marginBottom: 6,
                }}
              >
                Upload image
              </label>
              <FileUploadInput
                onFileSelect={handleFileUpload}
                loading={uploadLoading || ocrLoading}
                error={uploadError}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <OCRButton
              onClick={handleOCRSubmit}
              loading={ocrLoading}
              disabled={!filename}
              label={ocrLoading ? "Processing OCR..." : "Perform OCR"}
            />
            {filename ? (
              <span style={{ fontSize: 12, color: "#333" }}>
                Selected: {filename}
              </span>
            ) : null}
            {uploadError || ocrError ? (
              <span style={{ fontSize: 12, color: "#b91c1c" }}>
                {uploadError || ocrError}
              </span>
            ) : null}
          </div>
        </div>

        <ResultsDisplay
          result={ocrResult}
          error={ocrError}
          title="OCR Results"
        />

        <div style={{ marginTop: "20px" }}>
          <h3>Chat to Augment OCR Result</h3>
          <p style={{ color: "#666", fontSize: 14 }}>
            Tell the assistant what to add or change. It will return the full
            updated OCR JSON which will replace the current result.
          </p>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="e.g. Add: Apple 2x 200 or Remove: Apple"
            rows={3}
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              width: "100%",
              marginBottom: "10px",
              resize: "vertical",
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleChatSubmit}
              disabled={chatLoading}
              style={{
                padding: "10px 20px",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: chatLoading ? "wait" : "pointer",
              }}
            >
              {chatLoading ? "Processing..." : "Send to Assistant"}
            </button>
            <button
              onClick={() => setUserInput("")}
              style={{
                padding: "10px 20px",
                backgroundColor: "#e5e7eb",
                color: "#111827",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {updatedOCRResult && (
          <div style={{ marginTop: "20px" }}>
            <h3>Updated OCR Result</h3>
            <pre
              style={{
                background: "#f4f4f4",
                padding: "10px",
                borderRadius: "4px",
                overflowX: "auto",
              }}
            >
              {globalThis.JSON.stringify(updatedOCRResult, null, 2)}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
}
