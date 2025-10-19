/**
 * Service for calling OCR API
 */

export interface OCRRequest {
  imagePath: string;
}

export interface OCRResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: string;
}

/**
 * Perform OCR on an image
 */
export const performOCR = async (imagePath: string): Promise<OCRResponse> => {
  const response = await fetch('/api/ocr', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imagePath }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'OCR request failed');
  }

  return response.json();
};

/**
 * Upload image file
 */
export const uploadImage = async (file: File): Promise<{ filename: string; success: boolean }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Upload failed');
  }

  return response.json();
};

/**
 * Extract text from OCR response
 */
export const extractOCRText = (response: OCRResponse): string => {
  return response.choices?.[0]?.message?.content || 'No text extracted';
};
