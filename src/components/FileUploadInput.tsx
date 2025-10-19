/**
 * FileUploadInput Component - Reusable file upload input
 */

import { ChangeEvent, FC } from 'react';
import { formatFileSize } from '@/lib/utils/imageUtils';

interface FileUploadInputProps {
  onFileSelect: (file: File) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  supportedFormats?: string[];
  maxSizeMB?: number;
}

export const FileUploadInput: FC<FileUploadInputProps> = ({
  onFileSelect,
  loading = false,
  error = null,
  supportedFormats = ['JPEG', 'PNG', 'GIF', 'WebP', 'JFIF'],
  maxSizeMB = 5,
}) => {
  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onFileSelect(file);
    }
    // Reset input
    e.target.value = '';
  };

  return (
    <div style={{ marginBottom: '15px' }}>
      <h3>Upload Image</h3>
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,.jfif"
        onChange={handleChange}
        disabled={loading}
        style={{ padding: '5px' }}
      />
      <p style={{ fontSize: '12px', color: '#666' }}>
        Supported formats: {supportedFormats.join(', ')} (Max {maxSizeMB}MB)
      </p>
      {error && <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{error}</p>}
    </div>
  );
};
