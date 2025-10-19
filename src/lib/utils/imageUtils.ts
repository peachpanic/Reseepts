const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validate if file is an allowed image type
 */
export const isValidImageType = (mimeType: string): boolean => {
  return ALLOWED_MIME_TYPES.includes(mimeType);
};

/**
 * Validate file size
 */
export const isValidFileSize = (size: number): boolean => {
  return size <= MAX_FILE_SIZE;
};

/**
 * Validate complete image file
 */
export const validateImageFile = (
  file: File
): { valid: boolean; error?: string } => {
  if (!isValidImageType(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
    };
  }

  if (!isValidFileSize(file.size)) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
};

/**
 * Get file extension
 */
export const getFileExtension = (filename: string): string => {
  return filename.substring(filename.lastIndexOf(".")).toLowerCase();
};

/**
 * Get MIME type from file extension
 */
export const getMimeTypeFromExtension = (filename: string): string => {
  const ext = getFileExtension(filename).toLowerCase();

  const mimeTypeMap: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".jfif": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };

  return mimeTypeMap[ext] || "image/jpeg";
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};
