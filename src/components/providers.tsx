'use client';

import { ToastProvider } from '@/components/ui/toast-provider';
import { BookImportProvider } from '@/context/book-import-context';
import { ReaderSettingsProvider } from '@/context/reader-settings-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BookImportProvider>
      <ReaderSettingsProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ReaderSettingsProvider>
    </BookImportProvider>
  );
}
