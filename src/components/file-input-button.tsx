'use client';

import React, { useRef, useState } from 'react';
import { Upload, FileText } from 'lucide-react';
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
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      return;
    }

    setSelectedFile(file);
    onFileSelect?.(file);
  };

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
        aria-label="Select ebook file"
      />
      <Button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        size="lg"
        className="gap-2"
        role="button"
        tabIndex={0}
      >
        <Upload className="h-4 w-4" />
        Add Your First Book
      </Button>

      {selectedFile && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{selectedFile.name}</span>
          <span className="text-xs text-muted-foreground">
            ({formatFileSize(selectedFile.size)})
          </span>
        </div>
      )}
    </div>
  );
}
