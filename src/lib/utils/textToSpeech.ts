"use client";

import React from "react";

export interface TextToSpeechOptions {
  rate?: number; // 0.1 to 10, default 1
  pitch?: number; // 0 to 2, default 1
  volume?: number; // 0 to 1, default 1
  language?: string; // e.g., 'en-US', 'es-ES', 'fr-FR'
}

export const useTextToSpeech = () => {
  const speak = (text: string, options: TextToSpeechOptions = {}) => {
    // Check browser support
    const SpeechSynthesis =
      window.speechSynthesis || (window as any).webkitSpeechSynthesis;

    if (!SpeechSynthesis) {
      console.error("Text-to-Speech not supported in this browser");
      return;
    }

    // Cancel any ongoing speech
    SpeechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Set options
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    utterance.lang = options.language || "en-US";

    // Optional: Handle events
    utterance.onstart = () => console.log("Speech started");
    utterance.onend = () => console.log("Speech ended");
    utterance.onerror = (error) => console.error("Speech error:", error.error);

    SpeechSynthesis.speak(utterance);
  };

  const stop = () => {
    const SpeechSynthesis =
      window.speechSynthesis || (window as any).webkitSpeechSynthesis;
    if (SpeechSynthesis) {
      SpeechSynthesis.cancel();
    }
  };

  const pause = () => {
    const SpeechSynthesis =
      window.speechSynthesis || (window as any).webkitSpeechSynthesis;
    if (SpeechSynthesis) {
      SpeechSynthesis.pause();
    }
  };

  const resume = () => {
    const SpeechSynthesis =
      window.speechSynthesis || (window as any).webkitSpeechSynthesis;
    if (SpeechSynthesis) {
      SpeechSynthesis.resume();
    }
  };

  const isSupported = () => {
    return !!(window.speechSynthesis || (window as any).webkitSpeechSynthesis);
  };

  return { speak, stop, pause, resume, isSupported };
};

// Hook to get available voices
export const useAvailableVoices = () => {
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([]);

  React.useEffect(() => {
    const SpeechSynthesis =
      window.speechSynthesis || (window as any).webkitSpeechSynthesis;

    if (!SpeechSynthesis) return;

    const updateVoices = () => {
      setVoices(SpeechSynthesis.getVoices());
    };

    updateVoices();

    // Some browsers load voices asynchronously
    SpeechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      SpeechSynthesis.onvoiceschanged = null;
    };
  }, []);

  return voices;
};
