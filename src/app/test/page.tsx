// app/speech/page.tsx
"use client";

import React, { useState } from "react";
import { Mic, MicOff, RotateCcw, Copy, Check } from "lucide-react";
import { useSpeechToText } from "@/hooks/useSpeechText";

export default function SpeechToTextPage() {
  const {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechToText();

  const [language, setLanguage] = useState("en-US");
  const [copied, setCopied] = useState(false);

  const handleStart = () => {
    startListening({ language, continuous: true, interimResults: true });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript + interimTranscript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-semibold">
            Speech-to-Text is not supported in your browser
          </p>
          <p className="text-red-700 text-sm mt-2">
            Try using Chrome, Firefox, Safari, or Edge
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎤 Speech-to-Text
          </h1>
          <p className="text-gray-600">
            Speak and watch your words appear in real-time
          </p>
        </div>

        {/* Language Selection */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-teal-200">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isListening}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-50 font-medium"
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="es-ES">Spanish</option>
            <option value="es-MX">Spanish (Mexico)</option>
            <option value="fr-FR">French</option>
            <option value="de-DE">German</option>
            <option value="it-IT">Italian</option>
            <option value="ja-JP">Japanese</option>
            <option value="zh-CN">Chinese (Simplified)</option>
            <option value="ko-KR">Korean</option>
            <option value="pt-BR">Portuguese (Brazil)</option>
            <option value="ru-RU">Russian</option>
          </select>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-semibold">{error}</p>
          </div>
        )}

        {/* Recording Status */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6 border border-teal-200">
          <div className="flex items-center gap-4 mb-6">
            {isListening ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-semibold text-red-600">
                  Recording...
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                <span className="text-lg font-semibold text-gray-600">
                  Ready to listen
                </span>
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3 mb-6">
            {!isListening ? (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold shadow-md hover:shadow-lg"
              >
                <Mic className="w-5 h-5" />
                Start Listening
              </button>
            ) : (
              <button
                onClick={stopListening}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md hover:shadow-lg"
              >
                <MicOff className="w-5 h-5" />
                Stop
              </button>
            )}

            <button
              onClick={resetTranscript}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              <RotateCcw className="w-5 h-5" />
              Clear
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Transcript Display */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-teal-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Transcript
          </h2>

          {/* Final Transcript */}
          <div className="mb-4 p-4 bg-teal-50 rounded-lg border border-teal-200 min-h-20">
            <p className="text-gray-800 text-lg leading-relaxed">
              {transcript || (
                <span className="text-gray-400">
                  Your transcript will appear here...
                </span>
              )}
            </p>
          </div>

          {/* Interim Transcript */}
          {interimTranscript && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
              <p className="text-gray-600 italic">
                {interimTranscript}
                <span className="animate-pulse">|</span>
              </p>
            </div>
          )}

          {/* Character Count */}
          <div className="mt-4 text-sm text-gray-600">
            <p>
              Characters:{" "}
              <span className="font-semibold">
                {(transcript + interimTranscript).length}
              </span>
            </p>
            <p>
              Words:{" "}
              <span className="font-semibold">
                {(transcript + interimTranscript).trim().split(/\s+/).length}
              </span>
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-900 text-sm">
            💡 <strong>Tips:</strong> Speak clearly and naturally. The system
            works best in quiet environments. Your transcript will appear in
            real-time as you speak.
          </p>
        </div>
      </div>
    </div>
  );
}
