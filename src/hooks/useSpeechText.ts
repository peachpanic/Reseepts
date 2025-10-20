import { useState, useRef, useEffect } from "react";

// lib/speechToText.ts
export interface SpeechToTextOptions {
  language?: string; // e.g., 'en-US', 'es-ES', 'fr-FR'
  continuous?: boolean; // Keep listening until stopped
  interimResults?: boolean; // Get results while speaking
}

export const useSpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
    }
  }, []);

  const startListening = (options: SpeechToTextOptions = {}) => {
    if (!recognitionRef.current) {
      setError("Speech Recognition not supported");
      return;
    }

    setTranscript("");
    setInterimTranscript("");
    setError(null);

    const recognition = recognitionRef.current;

    // Set options
    recognition.language = options.language || "en-US";
    recognition.continuous = options.continuous || false;
    recognition.interimResults = options.interimResults !== false;

    // Handle results
    recognition.onresult = (event: any) => {
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + transcriptSegment + " ");
        } else {
          interim += transcriptSegment;
        }
      }

      setInterimTranscript(interim);
    };

    // Handle errors
    recognition.onerror = (event: any) => {
      setError(`Error: ${event.error}`);
      console.error("Speech recognition error", event.error);
    };

    // Handle end
    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const resetTranscript = () => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  };

  const abortListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setIsListening(false);
    }
  };

  return {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
    abortListening,
  };
};
