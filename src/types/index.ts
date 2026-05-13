export interface BookMetadata {
  id: string;
  title: string;
  author: string;
  format: 'epub' | 'pdf';
  file: ArrayBuffer;
  cover?: string;
  lastOpened: Date;
  dateAdded: Date;
  fileSize: number;
  readingProgress: {
    epub?: {
      spineIndex: number;
      location: string;
      percentage: number;
    };
    pdf?: {
      currentPage: number;
      zoom: number;
      viewingMode: string;
    };
  };
}

export interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  maxWidth: 'narrow' | 'medium' | 'wide';
  theme: 'light' | 'dark' | 'system';
  focusMode: boolean;
  autoHideDelay: number;
}

export interface TocItem {
  label: string;
  href: string;
  subitems?: TocItem[];
}

export type FileValidationError = 
  | 'INVALID_TYPE'
  | 'FILE_TOO_LARGE'
  | 'CORRUPT_FILE'
  | 'UNSUPPORTED_FORMAT';

export interface FileValidationResult {
  valid: boolean;
  error?: FileValidationError;
  message?: string;
}
