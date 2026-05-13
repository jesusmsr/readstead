'use client';

import React, { useRef, useState } from 'react';
import { BookPlus, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { validateFile, formatFileSize } from '@/lib/file-validation';
import { useToast } from '@/components/ui/toast-provider';

interface FileInputButtonProps {
  onFileSelect?: (file: File) => void;
  disabled?: boolean;
  accept?: string;
  className?: string;
}

export function FileInputButton({
  onFileSelect,
  disabled = false,
  accept = '.epub,.pdf',
  className,
}: FileInputButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { showToast } = useToast();

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const result = validateFile(file);

    if (!result.valid) {
      showToast(result.message || 'Invalid file', 'error');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      return;
    }

    setSelectedFile(file);
    onFileSelect?.(file);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-3 w-full sm:w-auto', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
        aria-label="Select ebook file"
      />

      {!selectedFile ? (
        <Button
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          size="lg"
          className="gap-2 w-full sm:w-auto h-14 sm:h-11 text-base"
          role="button"
          tabIndex={0}
        >
          <BookPlus className="h-5 w-5 sm:h-4 sm:w-4" />
          <span className="sm:hidden">Select a Book</span>
          <span className="hidden sm:inline">Select a Book from Device</span>
        </Button>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 w-full sm:w-auto">
          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate flex-1">{selectedFile.name}</span>
          <span className="text-xs text-muted-foreground shrink-0">
            ({formatFileSize(selectedFile.size)})
          </span>
          {!disabled && (
            <button
              onClick={clearSelection}
              className="ml-1 p-1 rounded hover:bg-muted transition-colors"
              aria-label="Clear selection"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      {!selectedFile && (
        <p className="text-xs text-muted-foreground text-center">
          Supports EPUB and PDF
        </p>
      )}
    </div>
  );
}
