/**
 * Custom hook for handling file uploads
 */

import { useState } from 'react';
import { uploadImage } from '@/lib/services/ocrService';
import { validateImageFile } from '@/lib/utils/imageUtils';

interface UseFileUploadState {
  filename: string;
  loading: boolean;
  error: string | null;
  setFilename: (name: string) => void;
  reset: () => void;
}

export const useFileUpload = (): UseFileUploadState & {
  handleFileUpload: (file: File) => Promise<void>;
} => {
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const result = await uploadImage(file);
      setFilename(result.filename);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFilename('');
    setError(null);
  };

  return {
    filename,
    loading,
    error,
    setFilename,
    reset,
    handleFileUpload,
  };
};
