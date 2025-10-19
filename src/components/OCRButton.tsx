/**
 * OCRButton Component - Reusable button for OCR operations
 */

import { FC } from 'react';

interface OCRButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

export const OCRButton: FC<OCRButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  label = 'Perform OCR',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        padding: '10px 20px',
        background: loading || disabled ? '#ccc' : '#007bff',
        color: 'white',
        border: 'none',
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        borderRadius: '4px',
        fontWeight: 'bold',
      }}
    >
      {loading ? 'Processing...' : label}
    </button>
  );
};
