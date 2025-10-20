"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import ExpenseItem from "@/components/expenses/ExpenseItem";
import CategoryDialog from "@/components/CategoryDialog";
import { useOCR } from "@/hooks/useOCR";
import { uploadImage } from "@/lib/services/ocrService";

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

  // Use OCR hook
  const {
    result: ocrResult,
    loading: ocrLoading,
    error: ocrError,
    performOCROnImage,
  } = useOCR();

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

    // Cleanup: stop the camera when deactivated
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

  const handleUpload = () => {
    if (capturedImage) {
      setIsLoading(true);
      // TODO: Send capturedImage to API or process it
      console.log("Uploading captured image:", capturedImage);

      // Wait 5 seconds then navigate to results
      setTimeout(() => {
        setIsLoading(false);
        setScreen("result");
      }, 5000);
    }
  };

  const handleCancel = () => {
    // Stop camera explicitly
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);

        // Upload file and trigger OCR
        setIsLoading(true);
        try {
          const uploadResponse = await uploadImage(file);
          if (uploadResponse.success) {
            // Perform OCR on the uploaded file
            await performOCROnImage(uploadResponse.filename);
          }
        } catch (error) {
          console.error("Error uploading or processing file:", error);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
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
                {/* Removed Go to Upload Receipt button; Add button now triggers upload screen */}
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

                {/* Transcribed Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-black mb-4">
                    Detected Items
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
                  {ocrResult && !ocrLoading ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-700 font-medium mb-2">
                          OCR Results:
                        </p>
                        <pre className="text-xs text-gray-600 overflow-auto max-h-64 bg-white p-2 rounded border border-gray-200 whitespace-pre-wrap break-words">
                          {typeof ocrResult === "string"
                            ? ocrResult
                            : JSON.stringify(ocrResult, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <p className="font-medium text-black">Item 1</p>
                          <p className="text-sm text-gray-500">
                            Category: Food
                          </p>
                        </div>
                        <p className="font-semibold text-[#429690]">$25.50</p>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <p className="font-medium text-black">Item 2</p>
                          <p className="text-sm text-gray-500">
                            Category: Beverages
                          </p>
                        </div>
                        <p className="font-semibold text-[#429690]">$8.99</p>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <p className="font-medium text-black">Item 3</p>
                          <p className="text-sm text-gray-500">
                            Category: Snacks
                          </p>
                        </div>
                        <p className="font-semibold text-[#429690]">$12.75</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="bg-[#429690] text-white rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold">$47.24</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    className="w-full border-2 border-[#429690] text-[#429690] font-semibold py-3 rounded-lg hover:bg-[#429690] hover:text-white transition-colors"
                    onClick={() => {
                      setScreen("main");
                      setCapturedImage(null);
                    }}
                  >
                    Confirm & Save
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
