/**
 * FileNameInput Component - Input for manual filename entry
 */

import { ChangeEvent, FC } from 'react';

interface FileNameInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const FileNameInput: FC<FileNameInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter image name from public/images folder',
}) => {
  return (
    <div style={{ marginBottom: '10px' }}>
      <label>
        Or enter filename:
        <input
          type="text"
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
        />
      </label>
    </div>
  );
};
