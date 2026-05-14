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
  fontSize: number;        // 12-24px (default: 16)
  lineHeight: number;      // 1.4-2.0 (default: 1.6)
  maxWidth: 'narrow' | 'medium' | 'wide'; // 600, 800, 1000px (default: medium)
  theme: 'light' | 'dark' | 'system';      // default: system
  focusMode: boolean;       // default: false
  autoHideDelay: number;    // seconds (default: 3)
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

/**
 * Valid ranges for reader settings
 */
export const SETTINGS_RANGES = {
  fontSize: { min: 12, max: 24, step: 1, default: 16 },
  lineHeight: { min: 1.4, max: 2.0, step: 0.1, default: 1.6 },
  maxWidth: { options: ['narrow', 'medium', 'wide'] as const, default: 'medium' as const },
  theme: { options: ['light', 'dark', 'system'] as const, default: 'system' as const },
  focusMode: { default: false },
  autoHideDelay: { min: 1, max: 10, step: 1, default: 3 },
};

/**
 * Pixel values for maxWidth options
 */
export const MAX_WIDTH_PIXELS: Record<string, number> = {
  narrow: 600,
  medium: 800,
  wide: 1000,
};

/**
 * Default reader settings
 */
export function getDefaultSettings(): ReaderSettings {
  return {
    fontSize: SETTINGS_RANGES.fontSize.default,
    lineHeight: SETTINGS_RANGES.lineHeight.default,
    maxWidth: SETTINGS_RANGES.maxWidth.default,
    theme: SETTINGS_RANGES.theme.default,
    focusMode: SETTINGS_RANGES.focusMode.default,
    autoHideDelay: SETTINGS_RANGES.autoHideDelay.default,
  };
}

/**
 * Validate and sanitize reader settings
 */
export function sanitizeSettings(partial: Partial<ReaderSettings>): ReaderSettings {
  const defaults = getDefaultSettings();

  return {
    fontSize: clamp(
      partial.fontSize ?? defaults.fontSize,
      SETTINGS_RANGES.fontSize.min,
      SETTINGS_RANGES.fontSize.max
    ),
    lineHeight: clamp(
      partial.lineHeight ?? defaults.lineHeight,
      SETTINGS_RANGES.lineHeight.min,
      SETTINGS_RANGES.lineHeight.max
    ),
  maxWidth: SETTINGS_RANGES.maxWidth.options.includes(partial.maxWidth as 'narrow' | 'medium' | 'wide')
    ? (partial.maxWidth as ReaderSettings['maxWidth'])
    : defaults.maxWidth,
  theme: SETTINGS_RANGES.theme.options.includes(partial.theme as 'light' | 'dark' | 'system')
    ? (partial.theme as ReaderSettings['theme'])
    : defaults.theme,
    focusMode: partial.focusMode ?? defaults.focusMode,
    autoHideDelay: clamp(
      partial.autoHideDelay ?? defaults.autoHideDelay,
      SETTINGS_RANGES.autoHideDelay.min,
      SETTINGS_RANGES.autoHideDelay.max
    ),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
