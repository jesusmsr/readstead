'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ReaderSettings, getDefaultSettings, sanitizeSettings } from '@/types';

interface ReaderSettingsContextType {
  settings: ReaderSettings;
  updateSettings: (updates: Partial<ReaderSettings>) => void;
  resetSettings: () => void;
}

const ReaderSettingsContext = createContext<ReaderSettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'readstead:reader-settings';

/**
 * Load settings from localStorage
 */
function loadSettings(): ReaderSettings | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return sanitizeSettings(parsed);
    }
  } catch {
    // Storage read failed, will fall back to defaults
  }
  return null;
}

/**
 * Save settings to localStorage
 */
function saveSettings(settings: ReaderSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage write failed (quota exceeded, etc.)
    // Silently ignore - settings will still work in memory
  }
}

export function useReaderSettings() {
  const context = useContext(ReaderSettingsContext);
  if (!context) {
    throw new Error('useReaderSettings must be used within a ReaderSettingsProvider');
  }
  return context;
}

export function ReaderSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    // Initialize from localStorage synchronously
    const stored = loadSettings();
    return stored ?? getDefaultSettings();
  });
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const sanitized = sanitizeSettings(parsed);
          setSettings(sanitized);
        } catch {
          // Invalid data received from other tab
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateSettings = useCallback((updates: Partial<ReaderSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...updates };
      const sanitized = sanitizeSettings(merged);

      // Debounce save (300ms)
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = setTimeout(() => {
        saveSettings(sanitized);
      }, 300);

      return sanitized;
    });
  }, []);

  const resetSettings = useCallback(() => {
    const defaults = getDefaultSettings();
    setSettings(defaults);
    saveSettings(defaults);
  }, []);

  // Cleanup save timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return (
    <ReaderSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
      }}
    >
      {children}
    </ReaderSettingsContext.Provider>
  );
}
