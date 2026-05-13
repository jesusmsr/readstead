/**
 * Centralized error messages for user-friendly error display
 */

import { FileValidationError } from '@/types';

export const FILE_ERROR_MESSAGES: Record<FileValidationError, string> = {
  INVALID_TYPE: 'This file type is not supported. Please use EPUB or PDF files.',
  FILE_TOO_LARGE: 'This file is too large. The maximum file size is 500MB.',
  CORRUPT_FILE: 'This file appears to be corrupted or unreadable.',
  UNSUPPORTED_FORMAT: 'This file format is not supported. Only EPUB and PDF files are allowed.',
};

export const READER_ERROR_MESSAGES = {
  EPUB_LOAD_FAILED: 'Failed to open this EPUB file. It may be corrupted or password-protected.',
  PDF_LOAD_FAILED: 'Failed to open this PDF file. It may be corrupted or password-protected.',
  UNSUPPORTED_FORMAT: 'This book format is not supported by the reader.',
  FILE_NOT_FOUND: 'The book file could not be found. It may have been deleted.',
  STORAGE_FULL: 'Your device storage is full. Please delete some books and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

export const NETWORK_ERROR_MESSAGES = {
  OFFLINE: 'You are currently offline. Some features may not be available.',
  TIMEOUT: 'The operation timed out. Please try again.',
};

/**
 * Get a user-friendly error message
 */
export function getUserFriendlyMessage(
  error: Error | string | FileValidationError
): string {
  if (typeof error === 'string') {
    // Check if it's a file validation error
    if (error in FILE_ERROR_MESSAGES) {
      return FILE_ERROR_MESSAGES[error as FileValidationError];
    }
    return error;
  }

  if (error instanceof Error) {
    // Check for known error patterns
    if (error.message.includes('EPUB') || error.message.includes('epub')) {
      return READER_ERROR_MESSAGES.EPUB_LOAD_FAILED;
    }
    if (error.message.includes('PDF') || error.message.includes('pdf')) {
      return READER_ERROR_MESSAGES.PDF_LOAD_FAILED;
    }
    if (error.message.includes('storage') || error.message.includes('quota')) {
      return READER_ERROR_MESSAGES.STORAGE_FULL;
    }
    if (error.message.includes('offline') || error.message.includes('network')) {
      return NETWORK_ERROR_MESSAGES.OFFLINE;
    }

    return READER_ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  return READER_ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Log error to console with context
 */
export function logError(error: Error, context: string): void {
  console.error(`[${context}]`, error);
}
