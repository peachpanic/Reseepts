/**
 * ResultsDisplay Component - Reusable component for displaying results
 */

import { FC } from 'react';

interface ResultsDisplayProps {
  result?: string | null;
  error?: string | null;
  title?: string;
}

export const ResultsDisplay: FC<ResultsDisplayProps> = ({
  result = null,
  error = null,
  title = 'Results',
}) => {
  if (!result && !error) {
    return null;
  }

  return (
    <div style={{ marginTop: '15px' }}>
      <h3>{title}</h3>
      {error && (
        <p style={{ color: 'red', marginTop: '10px' }}>
          <strong>Error:</strong> {error}
        </p>
      )}
      {result && (
        <pre
          style={{
            background: '#f5f5f5',
            padding: '10px',
            overflow: 'auto',
            maxHeight: '400px',
            borderRadius: '4px',
            marginTop: '10px',
            fontSize: '12px',
          }}
        >
          {result}
        </pre>
      )}
    </div>
  );
};
