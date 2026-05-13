'use client';

import React, { useState, useCallback } from 'react';
import { Upload, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateFile, formatFileSize } from '@/lib/file-validation';
import { useToast } from '@/components/ui/toast-provider';

interface FileDropZoneProps {
  onFileDrop?: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

export function FileDropZone({
  onFileDrop,
  disabled = false,
  className,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const { showToast } = useToast();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we're leaving the zone (not entering a child)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Filter to first valid EPUB or PDF file
    const validFiles = files.filter((file) => {
      const result = validateFile(file);
      return result.valid;
    });

    if (validFiles.length === 0) {
      // Show error for the first invalid file
      const firstFile = files[0];
      const result = validateFile(firstFile);
      showToast(result.message || 'Invalid file type', 'error');
      return;
    }

    // Use only the first valid file
    const file = validFiles[0];
    setDroppedFile(file);
    onFileDrop?.(file);

    // Show warning if there were multiple files
    if (files.length > 1) {
      showToast(`Only imported "${file.name}". Multiple file import coming soon.`, 'info');
    }
  }, [disabled, onFileDrop, showToast]);

  return (
    <div
      className={cn('w-full', className)}
      onDragEnter={handleDragEnter}
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-all duration-200',
          'hover:border-primary/50 hover:bg-muted/50',
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border bg-card',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {droppedFile ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-medium">{droppedFile.name}</span>
              <span className="text-sm text-muted-foreground">
                {formatFileSize(droppedFile.size)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Drop another file to replace
            </p>
          </div>
        ) : (
          <>
            <div
              className={cn(
                'flex h-20 w-20 items-center justify-center rounded-2xl transition-transform duration-200',
                isDragging ? 'bg-primary/20 scale-110' : 'bg-primary/10'
              )}
            >
              <Upload
                className={cn(
                  'h-10 w-10 transition-colors duration-200',
                  isDragging ? 'text-primary' : 'text-primary/80'
                )}
              />
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-lg font-medium">
                {isDragging ? 'Drop your book here' : 'Drag & drop your ebook'}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports EPUB and PDF files up to 500MB
              </p>
            </div>
          </>
        )}

        {/* Hidden overlay for full drop area coverage */}
        <div
          className={cn(
            'absolute inset-0 rounded-2xl transition-opacity duration-200 pointer-events-none',
            isDragging ? 'bg-primary/5' : 'bg-transparent'
          )}
        />
      </div>
    </div>
  );
}
