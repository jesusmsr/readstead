'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface ImportedBook {
  file: File;
  id: string;
  format: 'epub' | 'pdf';
}

interface BookImportContextType {
  currentBook: ImportedBook | null;
  setCurrentBook: (book: ImportedBook | null) => void;
  importBook: (file: File) => ImportedBook;
  clearCurrentBook: () => void;
}

const BookImportContext = createContext<BookImportContextType | undefined>(undefined);

/**
 * Hook to access the current book import state
 * @returns The book import context with current book and import functions
 */
export function useBookImport() {
  const context = useContext(BookImportContext);
  if (!context) {
    throw new Error('useBookImport must be used within a BookImportProvider');
  }
  return context;
}

/**
 * Generate a unique book ID
 */
function generateBookId(): string {
  return `book_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Determine file format from extension or MIME type
 * @param file - The file to check
 * @returns 'epub' | 'pdf' - defaults to epub if unable to determine
 */
function getFileFormat(file: File): 'epub' | 'pdf' {
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (extension === '.epub') return 'epub';
  if (extension === '.pdf') return 'pdf';
  // Fallback to MIME type
  if (file.type === 'application/epub+zip') return 'epub';
  if (file.type === 'application/pdf') return 'pdf';
  return 'epub'; // Default fallback
}

export function BookImportProvider({ children }: { children: React.ReactNode }) {
  const [currentBook, setCurrentBookState] = useState<ImportedBook | null>(null);

  const setCurrentBook = useCallback((book: ImportedBook | null) => {
    setCurrentBookState(book);
  }, []);

  const importBook = useCallback((file: File): ImportedBook => {
    const book: ImportedBook = {
      file,
      id: generateBookId(),
      format: getFileFormat(file),
    };
    setCurrentBookState(book);
    return book;
  }, []);

  const clearCurrentBook = useCallback(() => {
    setCurrentBookState(null);
  }, []);

  return (
    <BookImportContext.Provider
      value={{
        currentBook,
        setCurrentBook,
        importBook,
        clearCurrentBook,
      }}
    >
      {children}
    </BookImportContext.Provider>
  );
}
