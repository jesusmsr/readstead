'use client';

import { ToastProvider } from '@/components/ui/toast-provider';
import { BookImportProvider } from '@/context/book-import-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BookImportProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </BookImportProvider>
  );
}
