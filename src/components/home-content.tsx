'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';
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
    // Validate file first
    const validation = validateFile(file);
    if (!validation.valid) {
      showToast(validation.message || 'Invalid file', 'error');
      return;
    }

    // Prevent duplicate imports
    if (isImporting) {
      showToast('Already importing a book. Please wait...', 'info');
      return;
    }

    setIsImporting(true);
    showToast(`Opening "${file.name}"...`, 'success');

    try {
      // Import the book to context
      const book = importBook(file);

      // Navigate to appropriate reader
      const route = book.format === 'pdf' ? '/reader/pdf' : '/reader/epub';
      
      // Small delay to show loading state
      setTimeout(() => {
        router.push(route);
      }, 500);
    } catch (error) {
      console.error('Import failed:', error);
      showToast('Failed to import book. Please try again.', 'error');
      setIsImporting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 py-12">
      {isImporting && (
        <LoadingSpinner 
          message="Opening book..." 
          fullScreen 
        />
      )}

      <div className={cn('flex flex-col items-center gap-8 max-w-lg w-full', isImporting && 'opacity-50 pointer-events-none')}>
        {/* Hero Section */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <BookOpen className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Your Personal Library
            </h1>
            <p className="text-muted-foreground text-lg max-w-md">
              Read EPUB and PDF books locally in your browser. No cloud, no tracking, just reading.
            </p>
          </div>
        </div>

        {/* Import Section */}
        <div className="flex flex-col items-center gap-6 w-full">
          <FileDropZone 
            onFileDrop={handleFileSelect} 
            disabled={isImporting}
            className="w-full"
          />
          
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          <FileInputButton 
            onFileSelect={handleFileSelect}
            disabled={isImporting}
          />
        </div>

        {/* Footer Note */}
        <p className="text-sm text-muted-foreground text-center">
          Your books stay on your device. We never upload them to any server.
        </p>
      </div>
    </div>
  );
}
