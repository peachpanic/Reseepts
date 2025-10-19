/**
 * Custom hook for handling OCR operations
 */

import { useState } from 'react';
import { performOCR, extractOCRText } from '@/lib/services/ocrService';

interface UseOCRState {
  result: string | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export const useOCR = (): UseOCRState & {
  performOCROnImage: (imagePath: string) => Promise<void>;
} => {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performOCROnImage = async (imagePath: string) => {
    if (!imagePath.trim()) {
      setError('Please provide an image filename');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await performOCR(imagePath);
      const extractedText = extractOCRText(response);
      setResult(JSON.stringify(response, null, 2));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return {
    result,
    loading,
    error,
    reset,
    performOCROnImage,
  };
};
