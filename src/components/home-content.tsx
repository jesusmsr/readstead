'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Download } from 'lucide-react';
import { FileDropZone } from '@/components/file-drop-zone';
import { FileInputButton } from '@/components/file-input-button';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useToast } from '@/components/ui/toast-provider';
import { useBookImport } from '@/context/book-import-context';
import { validateFile } from '@/lib/file-validation';
import { cn } from '@/lib/utils';

export function HomeContent() {
  const [isImporting, setIsImporting] = useState(false);
  const { showToast } = useToast();
  const { importBook } = useBookImport();
  const router = useRouter();

  const handleFileSelect = async (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      showToast(validation.message || 'Invalid file', 'error');
      return;
    }

    if (isImporting) {
      showToast('Already importing a book. Please wait...', 'info');
      return;
    }

    setIsImporting(true);
    showToast(`Opening "${file.name}"...`, 'success');

    try {
      const book = importBook(file);
      const route = book.format === 'pdf' ? '/reader/pdf' : '/reader/epub';
      setTimeout(() => {
        router.push(route);
      }, 500);
    } catch {
      showToast('Failed to import book. Please try again.', 'error');
      setIsImporting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 sm:px-6 py-8 sm:py-12">
      {isImporting && (
        <LoadingSpinner message="Opening book..." fullScreen />
      )}

      <div className={cn(
        'flex flex-col items-center gap-6 sm:gap-8 max-w-lg w-full',
        isImporting && 'opacity-50 pointer-events-none'
      )}>
        {/* Hero Section */}
        <div className="flex flex-col items-center gap-3 sm:gap-4 text-center">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-primary/10">
            <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Your Personal Library
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-md">
              Read EPUB and PDF books locally. No cloud, no tracking.
            </p>
          </div>
        </div>

        {/* Import Section */}
        <div className="flex flex-col items-center gap-4 sm:gap-6 w-full">
          {/* Drag & Drop - Hidden on mobile */}
          <div className="hidden sm:block w-full">
            <FileDropZone
              onFileDrop={handleFileSelect}
              disabled={isImporting}
              className="w-full"
            />
          </div>

          {/* Divider - Desktop only */}
          <div className="hidden sm:block relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          {/* File Picker - Always visible, very prominent on mobile */}
          <div className="flex flex-col items-center gap-3 w-full">
            <FileInputButton
              onFileSelect={handleFileSelect}
              disabled={isImporting}
              className="w-full sm:w-auto"
            />
          </div>
        </div>

        {/* Tips Section - Mobile friendly */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-start gap-3 text-sm text-muted-foreground max-w-xs">
            <Download className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              Get free EPUB books from{' '}
              <a
                href="https://www.gutenberg.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Project Gutenberg
              </a>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-xs sm:text-sm text-muted-foreground text-center">
          Your books stay on your device. We never upload them to any server.
        </p>
      </div>
    </div>
  );
}
