'use client';

import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { FileDropZone } from '@/components/file-drop-zone';
import { FileInputButton } from '@/components/file-input-button';
import { useToast } from '@/components/ui/toast-provider';

export function HomeContent() {
  const [isImporting, setIsImporting] = useState(false);
  const { showToast } = useToast();

  const handleFileSelect = (file: File) => {
    setIsImporting(true);
    showToast(`Selected "${file.name}". Opening book...`, 'success');
    
    // TODO: Navigate to reader or process file
    // For now, just simulate a brief loading state
    setTimeout(() => {
      setIsImporting(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 py-12">
      <div className="flex flex-col items-center gap-8 max-w-lg w-full">
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
