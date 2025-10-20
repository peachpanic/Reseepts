"use client";

import CategoryDialog from "@/components/CategoryDialog";
import ExpenseItem from "@/components/expenses/ExpenseItem";
import ExpenseItemSkeleton from "@/components/expenses/ExpenseItemSkeleton";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useOCR } from "@/hooks/useOCR";
import useOCRData from "@/hooks/useTransaction";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useSpeechToText } from "@/hooks/useSpeechText"; // or your actual hook path
import { Mic, MicOff } from "lucide-react";

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

// ... (keep all existing helper functions and component code the same until return statement)

export default function ExpensePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"expenses" | "bills">("expenses");
  const [screen, setScreen] = useState<"main" | "upload" | "result">("main");
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrResults, setOcrResults] = useState<unknown>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isManualInputOpen, setIsManualInputOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add these states to your component
  const [isSpeechInputOpen, setIsSpeechInputOpen] = useState(false);
  const [showSpeechJsonReview, setShowSpeechJsonReview] = useState(false);
  const [processedSpeechData, setProcessedSpeechData] = useState<unknown>(null);
  const [speechTranscript, setSpeechTranscript] = useState("");
  // Add these states to your component
  const [processedManualData, setProcessedManualData] = useState<unknown>(null);
  const [showManualJsonReview, setShowManualJsonReview] = useState(false);

  // Manual input form state
  const [manualFormData, setManualFormData] = useState({
    description: "",
    amount: "",
    category_id: "",
    payment_method: "cash",
    expense_date: new Date().toISOString().split("T")[0],
  });

  const mutation = useOCRData();

  const [expenses, setExpenses] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [expensesLoading, setExpensesLoading] = useState(true);

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

  // Initialize the speech hook
  const {
    transcript,
    interimTranscript,
    isListening,
    isSupported: isSpeechSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
    abortListening,
  } = useSpeechToText();

  // Handle speech input submission
  const handleSpeechInputSubmit = async () => {
    if (!transcript.trim()) {
      alert("Please provide a voice input");
      return;
    }

    setSpeechTranscript(transcript);
    setChatLoading(true);

    try {
      const categoriesList = categories.map((cat) => cat.category_name);

      // Create a prompt from the speech transcript
      const systemInstruction = `You are an expense assistant that converts natural language voice input into a structured expense JSON.
Parse the spoken expense information and return ONLY a single valid JSON object (no markdown, no code fences, no explanation).

The JSON must match the database schema exactly:
- transactions table: expense_id, user_id, category_id, amount, description, payment_method, expense_date, created_at
- transaction_item table: id, item_name, amount, subcategory, expense_id, created_at

Available categories from database:
${JSON.stringify(categories, null, 2)}

Category ID mapping:
${JSON.stringify(categoryMapping, null, 2)}

Important rules:
1) Extract the expense amount, description/items, category, and date from the speech.
2) The 'subcategory' field in transaction_items MUST be exactly one of: ${JSON.stringify(
        categoriesList
      )}.
3) The 'category_id' MUST be the integer ID matching the expense type.
4) NEVER return subcategory:null. Use the closest match if uncertain.
5) Match category names EXACTLY as they appear (case-sensitive).
6) Output only the complete JSON object and nothing else.
7) **CRITICAL: Recalculate the top-level "amount" as the SUM of all transaction_items amounts.**
8) Do NOT add extra fields. Only use: item_name, amount, subcategory for transaction_items.
9) Keep user_id as 1 and use ISO 8601 timestamp format for created_at.
10) Use today's date if no date is mentioned.
11) Default payment_method to "cash" if not specified.`;

      const userMessage = `Voice transcription:\n"${transcript}"\n\nPlease parse this spoken expense input and return a properly structured expense JSON object.`;

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

      // Store processed data and show JSON review screen
      setProcessedSpeechData(parsed);
      setShowSpeechJsonReview(true);
      setChatLoading(false);
    } catch (err) {
      alert("Error: " + (err as Error).message);
      setChatLoading(false);
    }
  };

  // Save from speech review

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

  // Fetch expenses on mount
  useEffect(() => {
    const fetchExpenses = async () => {
      setExpensesLoading(true);
      try {
        const res = await fetch("/api/expenses?id=1");
        if (res.ok) {
          const data = await res.json();
          const transactions = data.transactions || [];

          const total = transactions.reduce(
            (sum: number, t: any) => sum + Number(t.amount),
            0
          );
          setTotalExpense(total);

          setExpenses(transactions);
        }
      } catch (err) {
        console.error("Failed to fetch expenses:", err);
      } finally {
        setExpensesLoading(false);
      }
    };
    fetchExpenses();
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
        const base64Data = capturedImage.split(",")[1];
        const blob = new Blob([atob(base64Data)], { type: "image/png" });
        const file = new File([blob], "receipt.png", { type: "image/png" });

        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();

        if (uploadData.filename) {
          console.log("File uploaded:", uploadData.filename);
          await performOCROnImage(uploadData.filename);
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
          await fileUploadHandler(file);
        } catch (error) {
          console.error("Error uploading file:", error);
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
  }, [filename]);

  const handleSaveTransaction = async () => {
    try {
      console.log("=== SAVING TRANSACTION ===");

      // Use updatedOCRResult if available, otherwise use ocrResult
      const dataToSave = updatedOCRResult || ocrResult;
      console.log("Data to save:", JSON.stringify(dataToSave, null, 2));

      if (!dataToSave) {
        throw new Error("No OCR data available");
      }

      // Parse the OCR data - it might be a string or already an object
      let parsedData;
      try {
        if (typeof dataToSave === "string") {
          const cleanedText = stripCodeFences(dataToSave);
          console.log("Cleaned text:", cleanedText);
          parsedData = JSON.parse(cleanedText);
        } else {
          parsedData = dataToSave;
        }
        console.log("Parsed data:", JSON.stringify(parsedData, null, 2));
      } catch (parseError) {
        console.error("Failed to parse OCR data:", parseError);
        console.error("Raw OCR data was:", dataToSave);
        throw new Error("Failed to parse receipt data");
      }

      // Ensure the data has the required structure
      const transactionToSave = {
        user_id: 1,
        category_id: parsedData.category_id || null,
        amount: parsedData.amount || 0,
        description: parsedData.description || parsedData.merchant_name || "",
        payment_method: parsedData.payment_method || "cash",
        expense_date:
          parsedData.expense_date ||
          parsedData.date ||
          new Date().toISOString(),
        created_at: new Date().toISOString(),
        transaction_items:
          parsedData.transaction_items || parsedData.items || [],
      };

      console.log(
        "Transaction to save:",
        JSON.stringify(transactionToSave, null, 2)
      );

      setSaveLoading(true);
      await mutation.mutateAsync(transactionToSave);

      setSaveSuccess(true);
      setTimeout(() => {
        setScreen("main");
        setUpdatedOCRResult(null);
        setUserInput("");
        setCapturedImage(null);
        setSaveSuccess(false);
      }, 1500);
    } catch (error: any) {
      console.error("=== SAVE TRANSACTION ERROR ===");
      console.error("Error:", error);
      console.error("Error message:", error?.message);

      alert(
        "Failed to save transaction: " + (error?.message || "Unknown error")
      );
    } finally {
      setSaveLoading(false);
    }

    setSaveLoading(true);
    setSaveSuccess(false);

    console.log("this is the data to save", dataToSave);

    mutation.mutate(dataToSave, {
      onSuccess: (result) => {
        setSaveSuccess(true);
        setSaveLoading(false);
        try {
          const tx = (result as any)?.transaction ?? result;
          if (tx) setUpdatedOCRResult(tx);
        } catch (e) {}

        setTimeout(() => {
          setScreen("main");
          setCapturedImage(null);
        }, 1500);
      },
      onError: (err: any) => {
        console.error("Save error:", err);
        alert("Failed to save transaction: " + (err?.message || String(err)));
        setSaveLoading(false);
      },
    });
  };

  // Replace the old handleManualInputSubmit with this
  const handleManualInputSubmit = async () => {
    if (
      !manualFormData.description ||
      !manualFormData.amount ||
      !manualFormData.category_id
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setSaveLoading(true);
    setChatLoading(true);

    try {
      const categoriesList = categories.map((cat) => cat.category_name);

      // Create initial expense data from manual input
      const manualExpenseData = {
        description: manualFormData.description,
        amount: parseFloat(manualFormData.amount),
        category_id: parseInt(manualFormData.category_id),
        payment_method: manualFormData.payment_method,
        expense_date: manualFormData.expense_date,
        transaction_items: [
          {
            item_name: manualFormData.description,
            amount: parseFloat(manualFormData.amount),
            subcategory:
              categories.find(
                (c) => c.category_id === parseInt(manualFormData.category_id)
              )?.category_name || "Other",
          },
        ],
      };

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
        manualExpenseData,
        null,
        2
      )}\n\nUser instruction: Transcribe and structure this manually entered expense data. Ensure all fields are properly formatted and categorized.`;

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

      // Store processed data and show JSON review screen
      setProcessedManualData(parsed);
      setShowManualJsonReview(true);
      setSaveLoading(false);
      setChatLoading(false);
    } catch (err) {
      alert("Error: " + (err as Error).message);
      setSaveLoading(false);
      setChatLoading(false);
    }
  };

  // Save speech transaction with robust error handling (like OCR handleSaveTransaction)
  const handleSaveSpeechFromReview = async ({
    processedSpeechData,
    mutation,
    setSaveLoading,
    setSaveSuccess,
    setShowSpeechJsonReview,
    setIsSpeechInputOpen,
    setProcessedSpeechData,
    setSpeechTranscript,
    resetTranscript,
  }: any) => {
    if (!processedSpeechData) return;

    try {
      console.log("=== SAVING SPEECH TRANSACTION ===");
      console.log(
        "Data to save:",
        JSON.stringify(processedSpeechData, null, 2)
      );

      // Parse the data - it might be a string or already an object
      let parsedData;
      try {
        if (typeof processedSpeechData === "string") {
          const cleanedText = stripCodeFences(processedSpeechData);
          console.log("Cleaned text:", cleanedText);
          parsedData = JSON.parse(cleanedText);
        } else {
          parsedData = processedSpeechData;
        }
        console.log("Parsed data:", JSON.stringify(parsedData, null, 2));
      } catch (parseError) {
        console.error("Failed to parse speech data:", parseError);
        console.error("Raw speech data was:", processedSpeechData);
        throw new Error("Failed to parse expense data");
      }

      // Ensure the data has the required structure
      const transactionToSave = {
        user_id: 1,
        category_id: parsedData.category_id || null,
        amount: parsedData.amount || 0,
        description: parsedData.description || "",
        payment_method: parsedData.payment_method || "cash",
        expense_date:
          parsedData.expense_date ||
          parsedData.date ||
          new Date().toISOString(),
        created_at: new Date().toISOString(),
        transaction_items:
          parsedData.transaction_items || parsedData.items || [],
      };

      console.log(
        "Transaction to save:",
        JSON.stringify(transactionToSave, null, 2)
      );

      setSaveLoading(true);
      await mutation.mutateAsync(transactionToSave);

      setSaveSuccess(true);
      alert("Expense saved successfully!");

      setTimeout(() => {
        setShowSpeechJsonReview(false);
        setIsSpeechInputOpen(false);
        setProcessedSpeechData(null);
        setSpeechTranscript("");
        resetTranscript();
        setSaveSuccess(false);
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("=== SAVE SPEECH TRANSACTION ERROR ===");
      console.error("Error:", error);
      console.error("Error message:", error?.message);

      alert(
        "Failed to save transaction: " + (error?.message || "Unknown error")
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveManualFromReview = async () => {
    if (!processedManualData) return;

    try {
      console.log("=== SAVING MANUAL TRANSACTION ===");
      console.log(
        "Data to save:",
        JSON.stringify(processedManualData, null, 2)
      );

      // Parse the data - it might be a string or already an object
      let parsedData;
      try {
        if (typeof processedManualData === "string") {
          const cleanedText = stripCodeFences(processedManualData);
          console.log("Cleaned text:", cleanedText);
          parsedData = JSON.parse(cleanedText);
        } else {
          parsedData = processedManualData;
        }
        console.log("Parsed data:", JSON.stringify(parsedData, null, 2));
      } catch (parseError) {
        console.error("Failed to parse manual data:", parseError);
        console.error("Raw manual data was:", processedManualData);
        throw new Error("Failed to parse expense data");
      }

      // Ensure the data has the required structure
      const transactionToSave = {
        user_id: 1,
        category_id: parsedData.category_id || null,
        amount: parsedData.amount || 0,
        description: parsedData.description || "",
        payment_method: parsedData.payment_method || "cash",
        expense_date:
          parsedData.expense_date ||
          parsedData.date ||
          new Date().toISOString(),
        created_at: new Date().toISOString(),
        transaction_items:
          parsedData.transaction_items || parsedData.items || [],
      };

      console.log(
        "Transaction to save:",
        JSON.stringify(transactionToSave, null, 2)
      );

      setSaveLoading(true);
      await mutation.mutateAsync(transactionToSave);

      setSaveSuccess(true);
      alert("Expense saved successfully!");

      setTimeout(() => {
        setShowManualJsonReview(false);
        setIsManualInputOpen(false);
        setProcessedManualData(null);
        setManualFormData({
          description: "",
          amount: "",
          category_id: "",
          payment_method: "cash",
          expense_date: new Date().toISOString().split("T")[0],
        });
        setSaveSuccess(false);
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("=== SAVE MANUAL TRANSACTION ERROR ===");
      console.error("Error:", error);
      console.error("Error message:", error?.message);

      alert(
        "Failed to save transaction: " + (error?.message || "Unknown error")
      );
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

  return (
    <div className="relative min-h-screen bg-[#429690]">
      <div className="flex justify-between items-center p-4 font-bold text-white text-2xl">
        <button
          onClick={() => router.push("/home")}
          className="flex items-center gap-2 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all active:scale-95 cursor-pointer group"
          aria-label="Go back to home"
        >
          <ArrowLeft
            size={24}
            className="text-white group-hover:text-teal-600 transition-colors"
          />
        </button>
        <h2 className="text-white text-3xl flex-1 text-center">Expenses</h2>
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

      {isManualInputOpen && !showManualJsonReview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-50 flex items-center justify-center p-4"
          onClick={() => setIsManualInputOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                Add Expense Manually
              </h3>
              <button
                onClick={() => setIsManualInputOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={manualFormData.description}
                  onChange={(e) =>
                    setManualFormData({
                      ...manualFormData,
                      description: e.target.value,
                    })
                  }
                  placeholder="e.g., Grocery shopping"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#429690] focus:border-transparent cursor-text placeholder-gray-400"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-600 font-semibold">
                    ₱
                  </span>
                  <input
                    type="number"
                    value={manualFormData.amount}
                    onChange={(e) =>
                      setManualFormData({
                        ...manualFormData,
                        amount: e.target.value,
                      })
                    }
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#429690] focus:border-transparent cursor-text placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={manualFormData.category_id}
                  onChange={(e) =>
                    setManualFormData({
                      ...manualFormData,
                      category_id: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#429690] focus:border-transparent cursor-pointer bg-white"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={manualFormData.payment_method}
                  onChange={(e) =>
                    setManualFormData({
                      ...manualFormData,
                      payment_method: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#429690] focus:border-transparent cursor-pointer bg-white"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="online">Online</option>
                  <option value="check">Check</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={manualFormData.expense_date}
                  onChange={(e) =>
                    setManualFormData({
                      ...manualFormData,
                      expense_date: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#429690] focus:border-transparent cursor-pointer"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsManualInputOpen(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all cursor-pointer active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleManualInputSubmit}
                disabled={chatLoading}
                className="flex-1 px-4 py-2 bg-[#429690] text-white font-semibold rounded-lg hover:bg-[#357a75] disabled:opacity-50 disabled:cursor-not-allowed enabled:cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {chatLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  "Review & Continue"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      {showManualJsonReview && processedManualData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowManualJsonReview(false);
            setProcessedManualData(null);
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Review Expense
              </h3>
              <button
                onClick={() => {
                  setShowManualJsonReview(false);
                  setProcessedManualData(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* JSON Preview */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Extracted Data
                </h4>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full cursor-default">
                  Ready
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-2 border-b border-gray-200 cursor-default">
                  <span className="text-xs font-mono text-gray-600">JSON</span>
                </div>
                <pre className="text-xs text-gray-800 overflow-auto max-h-80 p-4 font-mono leading-relaxed cursor-text select-all">
                  {JSON.stringify(processedManualData, null, 2)}
                </pre>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowManualJsonReview(false);
                  setProcessedManualData(null);
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all cursor-pointer active:scale-95"
              >
                Back to Edit
              </button>
              <button
                onClick={handleSaveManualFromReview}
                disabled={saveLoading}
                className="flex-1 px-4 py-2 bg-[#429690] text-white font-semibold rounded-lg hover:bg-[#357a75] disabled:opacity-50 disabled:cursor-not-allowed enabled:cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {saveLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  "Confirm & Save"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
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
                  <h1 className="text-black text-4xl font-bold">
                    ₱{totalExpense.toFixed(2)}
                  </h1>
                </div>
                <div className="flex gap-8 justify-center p-8">
                  {/* Scan Receipt Button */}
                  <div className="flex flex-col items-center text-[#429690] font-bold">
                    <button
                      className="border-2 border-[#429690] rounded-full p-2 px-4 text-xl text-[#429690] focus:outline-none hover:bg-[#429690] hover:text-white hover:scale-110 transition-all active:scale-95 cursor-pointer"
                      onClick={() => setScreen("upload")}
                    >
                      +
                    </button>
                    <label className="cursor-default mt-2">Scan Receipt</label>
                  </div>

                  {/* Manual Input Button */}
                  <div className="flex flex-col items-center text-[#429690] font-bold">
                    <button
                      className="border-2 border-[#429690] rounded-full p-2 px-4 text-xl text-[#429690] focus:outline-none hover:bg-[#429690] hover:text-white hover:scale-110 transition-all active:scale-95 cursor-pointer"
                      onClick={() => setIsManualInputOpen(true)}
                    >
                      ✎
                    </button>
                    <label className="cursor-default mt-2">Manual Entry</label>
                  </div>

                  {/* Voice Entry Button */}
                  <div className="flex flex-col items-center text-[#429690] font-bold">
                    <button
                      className="border-2 border-[#429690] rounded-full p-2 px-4 text-xl text-[#429690] focus:outline-none hover:bg-[#429690] hover:text-white hover:scale-110 transition-all active:scale-95 cursor-pointer"
                      onClick={() => {
                        setIsSpeechInputOpen(true);
                        resetTranscript();
                      }}
                      disabled={!isSpeechSupported}
                      title={
                        !isSpeechSupported
                          ? "Speech not supported"
                          : "Add by voice"
                      }
                    >
                      🎤
                    </button>
                    <label className="cursor-default mt-2">Voice Entry</label>
                  </div>
                </div>
                <div className="bg-gray-200 flex p-2 gap-1 justify-around mb-4 rounded-xl">
                  <button
                    className={`w-full rounded-lg font-medium transition-all cursor-pointer hover:shadow-md active:scale-95 ${
                      activeTab === "expenses"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                    }`}
                    onClick={() => setActiveTab("expenses")}
                  >
                    Expenses
                  </button>
                  <button
                    className={`w-full rounded-lg font-medium transition-all cursor-pointer hover:shadow-md active:scale-95 ${
                      activeTab === "bills"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                    }`}
                    onClick={() => setActiveTab("bills")}
                  >
                    Upcoming Bills
                  </button>
                </div>

                <div className="text-black">
                  {expensesLoading ? (
                    <>
                      <ExpenseItemSkeleton />
                      <ExpenseItemSkeleton />
                      <ExpenseItemSkeleton />
                      <ExpenseItemSkeleton />
                    </>
                  ) : (activeTab === "expenses" ? expenses : bills).length >
                    0 ? (
                    (activeTab === "expenses" ? expenses : bills).map((e) => (
                      <ExpenseItem key={e.expense_id} item={e} />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="p-4 bg-gray-100 rounded-full mb-4">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">
                        No {activeTab} yet
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Start tracking your spending
                      </p>
                    </div>
                  )}
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
                <div className="bg-yellow-300 rounded-lg p-4 mb-6 shadow-md hover:shadow-lg transition-shadow">
                  {isCameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="h-[55vh] w-full object-cover rounded-lg cursor-default"
                    />
                  ) : capturedImage ? (
                    <img
                      src={capturedImage}
                      alt="Captured Receipt"
                      className="h-[55vh] w-full object-cover rounded-lg cursor-pointer"
                    />
                  ) : (
                    <img
                      src="/images/components/receipt.svg"
                      alt="Receipt"
                      className="h-[55vh] object-contain cursor-pointer"
                    />
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />

                {!isCameraActive && !capturedImage && (
                  <div className="flex flex-col gap-1 mb-3">
                    <button
                      className="border-2 border-[#429690] rounded-full px-8 py-2 text-[#429690] font-semibold mb-2 hover:bg-[#429690] hover:text-white transition-all active:scale-95 cursor-pointer hover:shadow-md"
                      onClick={() => setIsCameraActive(true)}
                    >
                      Scan Receipt
                    </button>
                    <button
                      className="border-2 border-[#429690] rounded-full px-8 py-2 text-[#429690] font-semibold hover:bg-[#429690] hover:text-white transition-all active:scale-95 cursor-pointer hover:shadow-md"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose File
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden cursor-pointer"
                    />
                  </div>
                )}

                {isCameraActive && (
                  <div>
                    <button
                      className="border-2 border-teal-600 rounded-full px-8 py-2 text-white font-semibold mb-4 bg-teal-600 hover:bg-teal-700 hover:shadow-md transition-all active:scale-95 cursor-pointer"
                      onClick={handleCapture}
                    >
                      Capture
                    </button>
                  </div>
                )}

                {capturedImage && (
                  <div className="flex flex-col gap-2">
                    <button
                      className="border-2 border-teal-600 rounded-full px-8 py-2 text-white font-semibold bg-teal-600 hover:bg-teal-700 hover:shadow-md transition-all active:scale-95 cursor-pointer"
                      onClick={handleUpload}
                    >
                      Upload
                    </button>

                    <button
                      className="border-2 border-teal-600 rounded-full px-8 py-2 text-white font-semibold bg-teal-600 hover:bg-teal-700 hover:shadow-md transition-all active:scale-95 cursor-pointer"
                      onClick={handleReset}
                    >
                      Reset
                    </button>
                  </div>
                )}

                <button
                  className="border-2 border-[#429690] rounded-full px-8 py-2 text-[#429690] font-semibold mt-4 hover:bg-[#429690] hover:text-white transition-all active:scale-95 cursor-pointer hover:shadow-md"
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
                className="w-full flex flex-col bg-white p-4"
              >
                <h2 className="text-2xl font-semibold mb-6 text-black text-center">
                  Receipt Summary
                </h2>

                {/* Receipt Preview */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Receipt Image
                  </h3>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 shadow-inner border border-gray-200 hover:shadow-md transition-shadow">
                    {capturedImage && (
                      <div className="relative">
                        <img
                          src={capturedImage}
                          alt="Receipt Preview"
                          className="w-full max-h-64 object-contain rounded-lg shadow-md hover:shadow-lg transition-shadow"
                        />
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                          Scanned
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* OCR Results */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">
                      {updatedOCRResult ? "Updated Results" : "Extracted Data"}
                    </h3>
                    {(updatedOCRResult || ocrResult) && !ocrLoading && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full cursor-default">
                        Ready
                      </span>
                    )}
                  </div>

                  {ocrError && (
                    <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400 mb-4">
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 text-red-400 mr-2 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-sm text-red-700 font-medium cursor-default">
                          Error: {ocrError}
                        </p>
                      </div>
                    </div>
                  )}

                  {ocrLoading && (
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mr-3 flex-shrink-0"></div>
                        <p className="text-sm text-blue-700 font-medium cursor-default">
                          Processing OCR...
                        </p>
                      </div>
                    </div>
                  )}

                  {(updatedOCRResult || ocrResult) && !ocrLoading && (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-2 border-b border-gray-200 cursor-default">
                        <span className="text-xs font-mono text-gray-600">
                          JSON
                        </span>
                      </div>
                      <pre className="text-xs text-gray-800 overflow-auto max-h-64 p-4 font-mono leading-relaxed cursor-text select-all">
                        {JSON.stringify(
                          updatedOCRResult ??
                            (typeof ocrResult === "string"
                              ? JSON.parse(ocrResult)
                              : ocrResult),
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Chat to Augment */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Modify Transaction
                  </h3>
                  <div className="space-y-3">
                    <div className="relative">
                      <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="e.g., Add Apple 2x 200 or Remove Apple"
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-[#429690] focus:border-transparent transition-all resize-none placeholder-gray-400 cursor-text hover:border-gray-400"
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-gray-400 cursor-default">
                        {userInput.length}/500
                      </div>
                    </div>
                    <button
                      onClick={handleChatSubmit}
                      disabled={chatLoading || !userInput.trim()}
                      className="w-full px-4 py-3 bg-[#429690] text-white rounded-lg hover:bg-[#357a75] disabled:opacity-50 disabled:cursor-not-allowed enabled:cursor-pointer font-semibold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 active:scale-95 enabled:hover:scale-105"
                    >
                      {chatLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          <span>Update with AI</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSaveTransaction}
                    disabled={saveLoading}
                    className="w-full bg-[#429690] text-white font-semibold py-3.5 rounded-lg hover:bg-[#357a75] transition-all disabled:opacity-50 disabled:cursor-not-allowed enabled:cursor-pointer shadow-sm hover:shadow-md flex items-center justify-center gap-2 active:scale-95 enabled:hover:scale-105"
                  >
                    {saveLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Saving...</span>
                      </>
                    ) : saveSuccess ? (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Saved Successfully!</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Confirm & Save</span>
                      </>
                    )}
                  </button>
                  <button
                    className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-all cursor-pointer active:scale-95 hover:scale-105 hover:border-gray-400"
                    onClick={() => {
                      setScreen("upload");
                      setUpdatedOCRResult(null);
                      setUserInput("");
                    }}
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
            // Speech Input Modal
            {isSpeechInputOpen && !showSpeechJsonReview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-50 flex items-center justify-center p-4"
                onClick={() => {
                  if (!isListening) {
                    setIsSpeechInputOpen(false);
                    resetTranscript();
                  }
                }}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Add Expense by Voice
                    </h3>
                    <button
                      onClick={() => {
                        if (isListening) abortListening();
                        setIsSpeechInputOpen(false);
                        resetTranscript();
                      }}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <X size={24} className="text-gray-500" />
                    </button>
                  </div>

                  {!isSpeechSupported ? (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-700">
                        Speech recognition is not supported in your browser.
                        Please try Chrome, Edge, or Safari.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Microphone Section */}
                      <div className="mb-6">
                        <div className="flex flex-col items-center gap-4">
                          <button
                            onClick={
                              isListening
                                ? stopListening
                                : () =>
                                    startListening({
                                      continuous: false,
                                      interimResults: true,
                                    })
                            }
                            className={`p-8 rounded-full transition-all active:scale-95 ${
                              isListening
                                ? "bg-red-500 hover:bg-red-600 shadow-lg animate-pulse"
                                : "bg-[#429690] hover:bg-[#357a75] shadow-md"
                            }`}
                          >
                            {isListening ? (
                              <MicOff size={40} className="text-white" />
                            ) : (
                              <Mic size={40} className="text-white" />
                            )}
                          </button>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-700">
                              {isListening
                                ? "Listening..."
                                : "Click to start recording"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {isListening
                                ? "Say your expense details"
                                : "Speak your expense naturally"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Error Display */}
                      {speechError && (
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200 mb-4">
                          <p className="text-sm text-red-700">{speechError}</p>
                        </div>
                      )}

                      {/* Transcript Display */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Transcript
                        </label>
                        <div className="bg-gray-50 rounded-lg border border-gray-300 p-4 min-h-24 max-h-40 overflow-y-auto">
                          <p className="text-sm text-gray-700">
                            {transcript || (
                              <span className="text-gray-400 italic">
                                Your speech will appear here...
                              </span>
                            )}
                          </p>
                          {interimTranscript && (
                            <p className="text-sm text-gray-500 italic mt-2">
                              {interimTranscript}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            if (isListening) abortListening();
                            setIsSpeechInputOpen(false);
                            resetTranscript();
                          }}
                          className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all cursor-pointer active:scale-95"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSpeechInputSubmit}
                          disabled={!transcript.trim() || chatLoading}
                          className="flex-1 px-4 py-2 bg-[#429690] text-white font-semibold rounded-lg hover:bg-[#357a75] disabled:opacity-50 disabled:cursor-not-allowed enabled:cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          {chatLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span>Processing...</span>
                            </>
                          ) : (
                            "Review & Continue"
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
            {showSpeechJsonReview && processedSpeechData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-50 flex items-center justify-center p-4"
                onClick={() => {
                  setShowSpeechJsonReview(false);
                  setProcessedSpeechData(null);
                }}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Review Voice Expense
                    </h3>
                    <button
                      onClick={() => {
                        setShowSpeechJsonReview(false);
                        setProcessedSpeechData(null);
                      }}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <X size={24} className="text-gray-500" />
                    </button>
                  </div>

                  {/* Transcript */}
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-medium text-blue-900 mb-2">
                      Voice Input:
                    </p>
                    <p className="text-sm text-blue-800 italic">
                      "{speechTranscript}"
                    </p>
                  </div>

                  {/* JSON Preview */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">
                        Extracted Expense Data
                      </h4>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full cursor-default">
                        Ready
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-2 border-b border-gray-200 cursor-default">
                        <span className="text-xs font-mono text-gray-600">
                          JSON
                        </span>
                      </div>
                      <pre className="text-xs text-gray-800 overflow-auto max-h-80 p-4 font-mono leading-relaxed cursor-text select-all">
                        {JSON.stringify(processedSpeechData, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowSpeechJsonReview(false);
                        setProcessedSpeechData(null);
                      }}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all cursor-pointer active:scale-95"
                    >
                      Back to Voice
                    </button>
                    <button
                      onClick={handleSaveSpeechFromReview}
                      disabled={saveLoading}
                      className="flex-1 px-4 py-2 bg-[#429690] text-white font-semibold rounded-lg hover:bg-[#357a75] disabled:opacity-50 disabled:cursor-not-allowed enabled:cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      {saveLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        "Confirm & Save"
                      )}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
