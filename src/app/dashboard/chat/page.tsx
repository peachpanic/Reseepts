"use client";

import { useEffect, useRef, useState } from "react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useOCR } from "@/hooks/useOCR";
import { FileUploadInput } from "@/components/FileUploadInput";
import { FileNameInput } from "@/components/FileNameInput";
import { OCRButton } from "@/components/OCRButton";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import Image from "next/image";

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
      typeof data === "string" ? data : JSON.stringify(data, null, 2)
    );
  } catch {
    return "";
  }
}

export default function GeminiPage() {
  const [imageRecognitionResponse, setImageRecognitionResponse] = useState<
    string | null
  >(null);
  const [imageRecognitionError, setImageRecognitionError] = useState<
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

  const [manualFilename, setManualFilename] = useState("");

  // Message content type for OpenRouter payload
  type MessageContent =
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } };

  // New: unified prompt + image UI state
  const [prompt, setPrompt] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Add state for user input and updated OCR result
  const [userInput, setUserInput] = useState("");
  const [updatedOCRResult, setUpdatedOCRResult] = useState(null);

  useEffect(() => {
    const fetchImageRecognition = async () => {
      try {
        const res = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
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
    const targetFilename = filename || manualFilename;
    if (!targetFilename) return;

    setImageRecognitionError(null);
    setImageRecognitionResponse(null);

    try {
      await performOCROnImage(targetFilename);
      setImageRecognitionResponse(JSON.stringify(ocrResult, null, 2));
    } catch (error) {
      setImageRecognitionError((error as Error).message);
    }
  };

  // Opens dialog for file picker
  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  // Handles file selection in local
  const handleLocalFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreviewUrl(URL.createObjectURL(file));
    setManualFilename("");
    await handleFileUpload(file);
  };

  // Removes selected image
  const clearSelectedImage = () => {
    setImagePreviewUrl(null);
  };

  // Submits both image and prompt to API
  const handleUnifiedSubmit = async () => {
    if (!prompt && !filename) return;

    setChatLoading(true);
    setImageRecognitionError(null);
    setImageRecognitionResponse(null);

    // Fallback prompt if only image is provided
    const text = prompt || "What is in this image?";

    // Helper to convert a Blob to a data URL (base64)
    const blobToDataUrl = (blob: Blob) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

    // Build image content as an embedded data URL so OpenRouter can read it
    let imageContent: MessageContent[] = [];
    if (filename) {
      try {
        const res = await fetch(`/images/${filename}`);
        if (!res.ok) throw new Error(`Failed to load image (${res.status}`);
        const blob = await res.blob();
        const dataUrl = await blobToDataUrl(blob);
        imageContent = [
          {
            type: "image_url",
            image_url: {
              // Use data URL so it's accessible to the provider (no need for a public HTTP URL)
              url: dataUrl,
            },
          },
        ];
      } catch (e) {
        setImageRecognitionError(
          (e as Error).message || "Unable to load image for recognition."
        );
        setChatLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            {
              role: "user",
              content: [{ type: "text", text }, ...imageContent],
            },
          ],
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`errText || Request failed (${res.status}`);
      }

      const data = await res.json();
      setImageRecognitionResponse(extractTextFromResponse(data));
      setPrompt("");
    } catch (err) {
      setImageRecognitionError((err as Error).message);
    } finally {
      setChatLoading(false);
    }
  };

  // Ensure ocrResult is parsed as JSON
  const parsedOCRResult =
    typeof ocrResult === "string" ? JSON.parse(ocrResult) : ocrResult;

  // Function to handle adding user input to OCR result
  const handleAddItem = () => {
    if (!parsedOCRResult || !userInput.trim()) return;

    const parsedInput = userInput.match(/^(.*)\s+(\d+)\s*PHP$/i);
    if (!parsedInput) {
      alert("Invalid format. Use 'ItemName Price PHP'.");
      return;
    }

    const [_, itemName, price] = parsedInput;
    const priceNumber = parseFloat(price);

    const newItem = {
      item_name: itemName,
      quantity: 1,
      unit_price: priceNumber,
      total_price: priceNumber,
    };

    const updatedResult = {
      ...parsedOCRResult,
      amount: (parsedOCRResult.amount || 0) + priceNumber,
      line_items: [...(parsedOCRResult.line_items || []), newItem],
    };

    setUpdatedOCRResult(updatedResult);
    setUserInput("");
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
      {/* OCR Section (left as a separate panel if you still want it) */}
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
              disabled={!filename && !manualFilename}
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

        {/* New Section for Adding Items */}
        <div style={{ marginTop: "20px" }}>
          <h3>Add Additional Items</h3>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="ItemName Price PHP"
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              width: "100%",
              marginBottom: "10px",
            }}
          />
          <button
            onClick={handleAddItem}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Add Item
          </button>
        </div>

        {/* Display Updated OCR Result */}
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
              {JSON.stringify(updatedOCRResult, null, 2)}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
}