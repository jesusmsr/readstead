/**
 * File validation utilities for Readstead
 * Handles EPUB and PDF file validation before import
 */

import { FileValidationResult, FileValidationError } from '@/types';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_TYPES = ['application/epub+zip', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['.epub', '.pdf'];

const ERROR_MESSAGES: Record<FileValidationError, string> = {
  INVALID_TYPE: 'Only EPUB and PDF files are supported.',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 500MB.',
  CORRUPT_FILE: 'The file appears to be corrupted.',
  UNSUPPORTED_FORMAT: 'This file format is not supported.',
};

function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf('.')).toLowerCase();
}

/**
 * Validate a single file for import
 */
export function validateFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'FILE_TOO_LARGE',
      message: ERROR_MESSAGES.FILE_TOO_LARGE,
    };
  }

  // Check file extension
  const extension = getFileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: 'UNSUPPORTED_FORMAT',
      message: `File extension "${extension}" is not supported. Only .epub and .pdf files are allowed.`,
    };
  }

  // Check MIME type (if available)
  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    // Some EPUB files may have incorrect MIME types, so we allow
    // if the extension is correct but warn
    if (extension === '.epub' || extension === '.pdf') {
      // Extension is valid, accept even if MIME type is wrong
      return { valid: true };
    }
    return {
      valid: false,
      error: 'INVALID_TYPE',
      message: ERROR_MESSAGES.INVALID_TYPE,
    };
  }

  // Check for zero-byte files (likely corrupt)
  if (file.size === 0) {
    return {
      valid: false,
      error: 'CORRUPT_FILE',
      message: ERROR_MESSAGES.CORRUPT_FILE,
    };
  }

  return { valid: true };
}

/**
 * Validate multiple files and return results
 */
export function validateFiles(files: File[]): {
  valid: File[];
  errors: { file: File; result: FileValidationResult }[];
} {
  const valid: File[] = [];
  const errors: { file: File; result: FileValidationResult }[] = [];

  for (const file of files) {
    const result = validateFile(file);
    if (result.valid) {
      valid.push(file);
    } else {
      errors.push({ file, result });
    }
  }

  return { valid, errors };
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: FileValidationError): string {
  return ERROR_MESSAGES[error];
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
