'use client';

import { useEffect, useState } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useOCR } from '@/hooks/useOCR';
import { FileUploadInput } from '@/components/FileUploadInput';
import { FileNameInput } from '@/components/FileNameInput';
import { OCRButton } from '@/components/OCRButton';
import { ResultsDisplay } from '@/components/ResultsDisplay';

export default function GeminiPage() {
  const [imageRecognitionResponse, setImageRecognitionResponse] = useState<string | null>(null);
  const [imageRecognitionError, setImageRecognitionError] = useState<string | null>(null);

  const { filename, loading: uploadLoading, error: uploadError, handleFileUpload } = useFileUpload();
  const { result: ocrResult, loading: ocrLoading, error: ocrError, performOCROnImage } = useOCR();
  const [manualFilename, setManualFilename] = useState('');

  // Fetch initial image recognition on mount
  useEffect(() => {
    const fetchImageRecognition = async () => {
      try {
        const res = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'What is in this image?' },
                  {
                    type: 'image_url',
                    image_url: {
                      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg',
                    },
                  },
                ],
              },
            ],
          }),
        });
        const data = await res.json();
        setImageRecognitionResponse(JSON.stringify(data, null, 2));
      } catch (err) {
        setImageRecognitionError((err as Error).message);
      }
    };
    fetchImageRecognition();
  }, []);

  // Handle OCR submission
  const handleOCRSubmit = async () => {
    const targetFilename = filename || manualFilename;
    if (!targetFilename) {
      return;
    }
    await performOCROnImage(targetFilename);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🖼️ Image Recognition & OCR Tool</h1>

      {/* Image Recognition Section */}
      <section style={{ marginBottom: '30px', borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
        <h2>Image Recognition</h2>
        <p style={{ color: '#666', fontSize: '14px' }}>Analyzes what's in an image</p>
        <ResultsDisplay
          result={imageRecognitionResponse}
          error={imageRecognitionError}
          title="Recognition Results"
        />
      </section>

      {/* OCR Section */}
      <section style={{ marginBottom: '30px' }}>
        <h2>OCR (Optical Character Recognition)</h2>
        <p style={{ color: '#666', fontSize: '14px' }}>Extracts text from images</p>

        <FileUploadInput
          onFileSelect={handleFileUpload}
          loading={uploadLoading || ocrLoading}
          error={uploadError}
        />

        <FileNameInput value={manualFilename} onChange={setManualFilename} />

        <OCRButton
          onClick={handleOCRSubmit}
          loading={ocrLoading}
          disabled={!filename && !manualFilename}
          label={ocrLoading ? 'Processing OCR...' : 'Perform OCR'}
        />

        <ResultsDisplay result={ocrResult} error={ocrError} title="OCR Results" />
      </section>
    </div>
  );
}