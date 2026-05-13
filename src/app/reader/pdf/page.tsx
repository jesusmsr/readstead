'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useBookImport } from '@/context/book-import-context';
import { useToast } from '@/components/ui/toast-provider';

export default function PdfReaderPage() {
  const { currentBook, clearCurrentBook } = useBookImport();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (!currentBook) {
      // No book imported, redirect to home
      router.push('/');
      return;
    }

    if (currentBook.format !== 'pdf') {
      showToast('This book is not a PDF file', 'error');
      router.push('/');
      return;
    }

    // Simulate loading the PDF
    const timer = setTimeout(() => {
      setIsLoading(false);
      showToast(`Opened "${currentBook.file.name}"`, 'success');
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentBook, router, showToast]);

  const handleGoHome = () => {
    clearCurrentBook();
    router.push('/');
  };

  if (!currentBook) {
    return <LoadingSpinner message="Loading..." fullScreen />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <LoadingSpinner message="Opening PDF..." size="lg" />
        <p className="mt-4 text-sm text-muted-foreground">{currentBook.file.name}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Reader Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <Button onClick={handleGoHome} variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span className="truncate max-w-[200px]">{currentBook.file.name}</span>
        </div>
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      {/* Reader Content Placeholder */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <FileText className="h-16 w-16 text-muted-foreground/50" />
          <div>
            <h2 className="text-xl font-semibold">PDF Reader</h2>
            <p className="text-muted-foreground mt-1">
              PDF rendering will be implemented in the upcoming days.
            </p>
          </div>
          <div className="mt-4 p-4 rounded-lg bg-muted text-sm text-muted-foreground max-w-md">
            <p>Book: {currentBook.file.name}</p>
            <p>Size: {(currentBook.file.size / 1024 / 1024).toFixed(2)} MB</p>
            <p>Format: {currentBook.format.toUpperCase()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
