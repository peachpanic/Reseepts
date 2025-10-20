"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import ExpenseItem from "@/components/expenses/ExpenseItem";
import CategoryDialog from "@/components/CategoryDialog";
import { useOCR } from "@/hooks/useOCR";
import { useFileUpload } from "@/hooks/useFileUpload";

// Helper: remove Markdown code fences
function stripCodeFences(text: string): string {
  if (!text) return "";
  const withoutFences = text.replace(/```[\w-]*\n([\s\S]*?)\n?```/g, "$1");
  return withoutFences.trim();
}

// Helper: extract assistant text content from various API response shapes
function extractTextFromResponse(data: unknown): string {
  try {
    let content: unknown = undefined;

    if (typeof data === "object" && data !== null) {
      const obj = data as Record<string, unknown>;

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

    return stripCodeFences(
      typeof data === "string" ? data : JSON.stringify(data, null, 2)
    );
  } catch {
    return "";
  }
}

export default function ExpensePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"expenses" | "bills">("expenses");
  const [screen, setScreen] = useState<"main" | "upload" | "result">("main");
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrResults, setOcrResults] = useState<unknown>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File upload and OCR hooks
  const {
    filename,
    loading: uploadLoading,
    error: uploadError,
    handleFileUpload: fileUploadHandler,
  } = useFileUpload();
  const {
    result: ocrResult,
    loading: ocrLoading,
    error: ocrError,
    performOCROnImage,
  } = useOCR();

  const [chatLoading, setChatLoading] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [updatedOCRResult, setUpdatedOCRResult] = useState<unknown>(null);
  const [categories, setCategories] = useState<
    Array<{ category_id: number; category_name: string }>
  >([]);
  const [categoryMapping, setCategoryMapping] = useState<
    Record<string, number>
  >({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data || []);
          const mapping = data.reduce(
            (
              acc: Record<string, number>,
              cat: { category_name: string; category_id: number }
            ) => {
              acc[cat.category_name] = cat.category_id;
              return acc;
            },
            {}
          );
          setCategoryMapping(mapping);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Initialize camera when toggled
  useEffect(() => {
    if (isCameraActive && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("Error accessing camera:", err));
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [isCameraActive]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL("image/png");
        setCapturedImage(imageData);
        setIsCameraActive(false);
      }
    }
  };

  const handleUpload = async () => {
    if (capturedImage) {
      setIsLoading(true);
      try {
        // Perform OCR on captured image
        const base64Data = capturedImage.split(",")[1];
        const blob = new Blob([atob(base64Data)], { type: "image/png" });
        const file = new File([blob], "receipt.png", { type: "image/png" });

        // Upload file first
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();

        if (uploadData.filename) {
          console.log("File uploaded:", uploadData.filename);

          // Use the OCR hook to perform OCR
          await performOCROnImage(uploadData.filename);

          // Move to result screen immediately after OCR completes
          setIsLoading(false);
          setScreen("result");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setScreen("main");
    setIsCameraActive(false);
    setCapturedImage(null);
  };

  const handleReset = () => {
    setIsCameraActive(false);
    setCapturedImage(null);
    setOcrResults(null);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);

        setIsLoading(true);
        try {
          // Upload file
          await fileUploadHandler(file);
          // OCR will be triggered by useEffect when filename changes
        } catch (error) {
          console.error("Error uploading file:", error);
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add useEffect to trigger OCR after file upload
  useEffect(() => {
    const performOCR = async () => {
      if (filename && !ocrLoading && !ocrResult && isLoading) {
        try {
          await performOCROnImage(filename);
          setIsLoading(false);
          setScreen("result");
        } catch (error) {
          console.error("Error performing OCR:", error);
          setIsLoading(false);
        }
      }
    };
    performOCR();
  }, [filename]); // Trigger when filename changes

  const handleSaveTransaction = async () => {
    const dataToSave = updatedOCRResult ?? ocrResult;

    if (!dataToSave) {
      alert("No transaction data to save. Perform OCR first.");
      return;
    }

    setSaveLoading(true);
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save transaction");
      }

      const result = await response.json();
      console.log("Transaction saved:", result);

      setSaveSuccess(true);
      alert(
        `Transaction saved successfully! Expense ID: ${result.transaction?.expense_id}`
      );
      setUpdatedOCRResult(result.transaction);

      setTimeout(() => {
        setScreen("main");
        setCapturedImage(null);
      }, 2000);
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save transaction: " + (err as Error).message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChatSubmit = async () => {
    const parsedOCRResult =
      typeof ocrResult === "string" ? JSON.parse(ocrResult) : ocrResult;

    if (!parsedOCRResult) {
      alert("No OCR result to augment. Perform OCR first.");
      return;
    }

    if (!userInput.trim()) return;

    setChatLoading(true);

    try {
      const base = updatedOCRResult ?? parsedOCRResult;
      const categoriesList = categories.map((cat) => cat.category_name);

      const systemInstruction = `You are an assistant that receives an existing expense JSON and a short user instruction.
YOU MUST return ONLY a single valid JSON object (no markdown, no code fences, no explanation).
The JSON must match the database schema exactly. Numeric fields must be numbers (not strings).

Database schema:
- transactions table: expense_id, user_id, category_id, amount, description, payment_method, expense_date, created_at
- transaction_item table: id, item_name, amount, subcategory, expense_id, created_at

Available categories from database:
${JSON.stringify(categories, null, 2)}

Category ID mapping:
${JSON.stringify(categoryMapping, null, 2)}

Important rules:
1) The 'subcategory' field inside every transaction_items entry MUST be exactly one of: ${JSON.stringify(
        categoriesList
      )}.
2) The 'category_id' field MUST be the integer ID from the category mapping that best matches the overall expense type.
3) NEVER return subcategory:null. If you cannot determine a precise subcategory, use the closest match from the available categories.
4) Match category names EXACTLY as they appear in the database (case-sensitive).
5) Output only the complete JSON object and nothing else.
6) **CRITICAL: After adding, removing, or modifying any transaction_items, you MUST recalculate the top-level "amount" field as the SUM of all transaction_items' amount values.**
7) Example: If transaction_items are [{"amount": 100}, {"amount": 50}], then top-level "amount" must be 150.
8) Do NOT add extra fields. Only use: item_name, amount, subcategory, expense_id, created_at for transaction_items.
9) Keep user_id as 1 and maintain ISO 8601 timestamp format for created_at fields.
10) When determining category_id, choose the most appropriate category from the mapping based on the expense description and items.`;

      const userMessage = `Current expense data:\n${JSON.stringify(
        base,
        null,
        2
      )}\n\nUser instruction: ${userInput}`;

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        parsed = JSON.parse(assistantText);
      } catch (err) {
        throw new Error(
          "Assistant returned non-JSON response: " + assistantText
        );
      }

      setUpdatedOCRResult(parsed);
      setUserInput("");
    } catch (err) {
      alert("Error: " + (err as Error).message);
    } finally {
      setChatLoading(false);
    }
  };

  const expenses = [
    {
      id: "1",
      category: "Food",
      name: "Groceries",
      date: "2025-10-01",
      amount: 120.5,
    },
    {
      id: "2",
      category: "Rent",
      name: "October Rent",
      date: "2025-10-01",
      amount: 850.0,
    },
    {
      id: "3",
      category: "Utilities",
      name: "Electricity",
      date: "2025-10-05",
      amount: 65.25,
    },
  ];

  const bills = [
    {
      id: "b1",
      category: "Subscription",
      name: "Netflix",
      date: "2025-10-10",
      amount: 15.99,
    },
    {
      id: "b2",
      category: "Loan",
      name: "Car Loan",
      date: "2025-10-15",
      amount: 250.0,
    },
  ];

  const handleBackToHome = () => {
    router.push("/home");
  };

  const parsedOCRResult =
    typeof ocrResult === "string" ? JSON.parse(ocrResult) : ocrResult;

  return (
    <div className="relative min-h-screen bg-[#429690]">
      <div className="flex justify-between items-center p-4 mb-4 font-bold text-white text-2xl">
        <button
          onClick={handleBackToHome}
          className="flex items-center gap-2 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all active:scale-95 cursor-pointer group"
          aria-label="Go back to home"
        >
          <ArrowLeft
            size={24}
            className="text-white group-hover:text-teal-600 transition-colors"
          />
        </button>
        <h2 className="text-white text-lg flex-1 text-center">Expenses</h2>
        <button
          onClick={() => setIsCategoryDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all active:scale-95 cursor-pointer font-semibold text-sm shadow-md hover:shadow-lg group"
          aria-label="Open category dialog"
        >
          <span className="text-teal-600 group-hover:text-teal-800 transition-colors">
            Category
          </span>
          <svg
            className="w-4 h-4 text-teal-600 group-hover:text-teal-800 group-hover:translate-x-0.5 transition-all"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Category Dialog */}
      <CategoryDialog
        isOpen={isCategoryDialogOpen}
        onClose={() => setIsCategoryDialogOpen(false)}
      />

      {/* Main Content */}
      <div className="bg-white rounded-lg p-4 min-h-screen">
        <div className="relative min-h-[300px]">
          <AnimatePresence mode="wait">
            {screen === "main" && !isLoading && (
              <motion.div
                key="main"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className="mb-4 flex flex-col items-center">
                  <label className="text-gray-500">Total Expense</label>
                  <h1 className="text-black text-4xl font-bold">$2,548</h1>
                </div>
                <div className="flex flex-col items-center mb-4 text-[#549994] font-bold">
                  <button
                    className="border-2 rounded-full p-2 px-4 text-xl focus:outline-none"
                    onClick={() => setScreen("upload")}
                  >
                    +
                  </button>
                  <label>Add</label>
                </div>
                <div className="bg-gray-200 flex p-2 gap-1 justify-around mb-4 rounded-xl">
                  <button
                    className={`w-full rounded-lg font-medium ${
                      activeTab === "expenses"
                        ? "bg-white text-gray-900"
                        : "bg-gray-200 text-gray-500"
                    }`}
                    onClick={() => setActiveTab("expenses")}
                  >
                    Expenses
                  </button>
                  <button
                    className={`w-full rounded-lg font-medium ${
                      activeTab === "bills"
                        ? "bg-white text-gray-900"
                        : "bg-gray-200 text-gray-500"
                    }`}
                    onClick={() => setActiveTab("bills")}
                  >
                    Upcoming Bills
                  </button>
                </div>
                <div className="text-black">
                  {(activeTab === "expenses" ? expenses : bills).map((e) => (
                    <ExpenseItem key={e.id} item={e} />
                  ))}
                </div>
              </motion.div>
            )}

            {screen === "upload" && !isLoading && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center justify-center bg-white"
              >
                <h2 className="text-xl font-semibold mb-4">Upload Receipt</h2>
                <div className="bg-yellow-300 rounded-lg p-4 mb-6">
                  {isCameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="h-[55vh] w-full object-cover rounded-lg"
                    />
                  ) : capturedImage ? (
                    <img
                      src={capturedImage}
                      alt="Captured Receipt"
                      className="h-[55vh] w-full object-cover rounded-lg"
                    />
                  ) : (
                    <img
                      src="/images/components/receipt.svg"
                      alt="Receipt"
                      className="h-[55vh] object-contain"
                    />
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />

                {!isCameraActive && !capturedImage && (
                  <div className="flex flex-col gap-1 mb-3">
                    <button
                      className="border rounded-full px-8 py-2 text-[#429690] font-semibold mb-2"
                      onClick={() => setIsCameraActive(true)}
                    >
                      Scan Receipt
                    </button>
                    <button
                      className="border rounded-full px-8 py-2 text-[#429690] font-semibold"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose File
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}

                {isCameraActive && (
                  <div>
                    <button
                      className="border rounded-full px-8 py-2 text-white font-semibold mb-4 bg-teal-600 hover:bg-teal-800 transition-colors"
                      onClick={handleCapture}
                    >
                      Capture
                    </button>
                  </div>
                )}

                {capturedImage && (
                  <div>
                    <button
                      className="border rounded-full px-8 py-2 text-white font-semibold mb-4 bg-teal-600 hover:bg-teal-800 transition-colors"
                      onClick={handleUpload}
                    >
                      Upload
                    </button>

                    <button
                      className="border rounded-full px-8 py-2 text-white font-semibold mb-4 bg-teal-600 hover:bg-teal-800 transition-colors"
                      onClick={handleReset}
                    >
                      Reset
                    </button>
                  </div>
                )}

                <button
                  className="border rounded-full px-8 py-2 text-[#429690] font-semibold"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </motion.div>
            )}

            {screen === "result" && !isLoading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col bg-white"
              >
                <h2 className="text-2xl font-semibold mb-6 text-black text-center">
                  Receipt Summary
                </h2>

                {/* Receipt Preview */}
                <div className="bg-gray-100 rounded-lg p-4 mb-6 max-h-48 overflow-y-auto">
                  {capturedImage && (
                    <img
                      src={capturedImage}
                      alt="Receipt Preview"
                      className="w-full object-contain rounded-lg"
                    />
                  )}
                </div>

                {/* OCR Results */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-black mb-4">
                    OCR Results
                  </h3>
                  {ocrError && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-4">
                      <p className="text-sm text-red-700">Error: {ocrError}</p>
                    </div>
                  )}
                  {ocrLoading && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700">Processing OCR...</p>
                    </div>
                  )}
                  {ocrResult && !ocrLoading && (
                    <>
                      <pre className="text-xs text-gray-600 overflow-auto max-h-64 bg-white p-2 rounded border border-gray-200 whitespace-pre-wrap break-words">
                        {typeof ocrResult === "string"
                          ? JSON.stringify(JSON.parse(ocrResult), null, 2)
                          : JSON.stringify(
                              updatedOCRResult ?? ocrResult,
                              null,
                              2
                            )}
                      </pre>
                    </>
                  )}
                </div>

                {/* Chat to Augment */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-black mb-2">
                    Chat to Augment
                  </h3>
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="e.g. Add: Apple 2x 200 or Remove: Apple"
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-lg mb-2 text-gray-700"
                  />
                  <button
                    onClick={handleChatSubmit}
                    disabled={chatLoading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold mb-2"
                  >
                    {chatLoading ? "Processing..." : "Send to Assistant"}
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleSaveTransaction}
                    disabled={saveLoading}
                    className="w-full border-2 border-[#429690] text-[#429690] font-semibold py-3 rounded-lg hover:bg-[#429690] hover:text-white transition-colors disabled:opacity-50"
                  >
                    {saveLoading
                      ? "Saving..."
                      : saveSuccess
                      ? "✓ Saved!"
                      : "Confirm & Save"}
                  </button>
                  <button
                    className="w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setScreen("upload")}
                  >
                    Back to Upload
                  </button>
                </div>
              </motion.div>
            )}

            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center justify-center min-h-[400px] bg-white"
              >
                <div className="text-center">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#429690] border-t-transparent"></div>
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold text-black mb-2">
                    Scanning Receipt
                  </h2>
                  <p className="text-gray-500 mb-8">
                    Please wait while we process your receipt...
                  </p>
                  <div className="flex justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#429690] animate-bounce"></div>
                    <div
                      className="w-2 h-2 rounded-full bg-[#429690] animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-[#429690] animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
