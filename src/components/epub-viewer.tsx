'use client';

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import ePub from 'epubjs';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/loading-spinner';
import { cn } from '@/lib/utils';

export interface EpubViewerHandle {
  next: () => void;
  prev: () => void;
  getCurrentLocation: () => { index: number; total: number } | null;
}

interface EpubViewerProps {
  file: File;
  className?: string;
}

type ViewerState = 
  | { status: 'loading' }
  | { status: 'slow' }
  | { status: 'ready' }
  | { status: 'error'; message: string };

// Timeout after which we show a "taking longer" message
const SLOW_LOAD_THRESHOLD = 8000; // 8 seconds
// Absolute timeout after which we give up
const MAX_LOAD_TIMEOUT = 30000; // 30 seconds

export const EpubViewer = forwardRef<EpubViewerHandle, EpubViewerProps>(
  function EpubViewer({ file, className }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const bookRef = useRef<ePub.Book | null>(null);
    const renditionRef = useRef<ePub.Rendition | null>(null);
    const [viewerState, setViewerState] = useState<ViewerState>({ status: 'loading' });
    const [retryKey, setRetryKey] = useState(0);
    const spineLengthRef = useRef(0);
    const currentIndexRef = useRef(0);

    // Expose navigation methods via ref
    useImperativeHandle(ref, () => ({
      next: () => {
        if (renditionRef.current) {
          renditionRef.current.next();
        }
      },
      prev: () => {
        if (renditionRef.current) {
          renditionRef.current.prev();
        }
      },
      getCurrentLocation: () => {
        if (!bookRef.current) return null;
        return {
          index: currentIndexRef.current,
          total: spineLengthRef.current,
        };
      },
    }), []);

    // Main effect: read file and initialize epub.js
    useEffect(() => {
      if (!containerRef.current) return;

      let isMounted = true;
      const slowTimer = setTimeout(() => {
        if (isMounted) {
          setViewerState((prev) => prev.status === 'loading' ? { status: 'slow' } : prev);
        }
      }, SLOW_LOAD_THRESHOLD);

      const maxTimer = setTimeout(() => {
        if (isMounted) {
          setViewerState({
            status: 'error',
            message: 'This book is taking too long to open. It may be too large or corrupted.',
          });
        }
      }, MAX_LOAD_TIMEOUT);

      const initBook = async () => {
        try {
          // For very large files (>50MB), warn but still try
          if (file.size > 50 * 1024 * 1024) {
            console.warn('Large EPUB file detected:', (file.size / 1024 / 1024).toFixed(1), 'MB');
          }

          const arrayBuffer = await file.arrayBuffer();
          
          if (!isMounted) return;

          // Check for empty or near-empty files (likely corrupt)
          if (arrayBuffer.byteLength < 100) {
            throw new Error('File appears to be empty or corrupted.');
          }

          const book = ePub(arrayBuffer);
          bookRef.current = book;

          await book.ready;
          if (!isMounted || !containerRef.current) return;

          // Store spine length for progress
          spineLengthRef.current = book.spine.length;

          // If spine is empty, the EPUB has no readable content
          if (spineLengthRef.current === 0) {
            throw new Error('This EPUB file has no readable content. It may be corrupted or have an invalid structure.');
          }

          const rendition = book.renderTo(containerRef.current, {
            width: '100%',
            height: '100%',
            spread: 'auto',
          });
          renditionRef.current = rendition;

          // Track location changes
          rendition.on('relocated', (location: { start: { index: number } }) => {
            currentIndexRef.current = location.start.index;
          });

          await rendition.display();
          if (isMounted) {
            clearTimeout(slowTimer);
            clearTimeout(maxTimer);
            setViewerState({ status: 'ready' });
          }
        } catch (err) {
          if (isMounted) {
            clearTimeout(slowTimer);
            clearTimeout(maxTimer);
            console.error('EPUB error:', err);
            
            let message = 'Failed to open this EPUB file.';
            if (err instanceof Error) {
              if (err.message.includes('password') || err.message.includes('encrypted')) {
                message = 'This EPUB is password-protected or encrypted and cannot be opened.';
              } else if (err.message.includes('No such file') || err.message.includes('container.xml')) {
                message = 'This file is not a valid EPUB. It may be corrupted or have an invalid structure.';
              } else if (err.message.includes('too large')) {
                message = 'This book is very large and could not be processed.';
              } else {
                message = err.message;
              }
            }
            
            setViewerState({ status: 'error', message });
          }
        }
      };

      initBook();

      return () => {
        isMounted = false;
        clearTimeout(slowTimer);
        clearTimeout(maxTimer);
        if (renditionRef.current) {
          renditionRef.current.destroy();
          renditionRef.current = null;
        }
        if (bookRef.current) {
          bookRef.current.destroy();
          bookRef.current = null;
        }
      };
    }, [file, retryKey]);

    // Handle window resize
    useEffect(() => {
      const handleResize = () => {
        if (renditionRef.current) {
          renditionRef.current.resize();
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleRetry = useCallback(() => {
      setViewerState({ status: 'loading' });
      setRetryKey((prev) => prev + 1);
    }, []);

    if (viewerState.status === 'error') {
      return (
        <div className={cn('flex flex-col items-center justify-center gap-4 p-8', className)}>
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center max-w-md">
            <h3 className="text-lg font-semibold mb-2">Failed to Open Book</h3>
            <p className="text-muted-foreground text-sm">{viewerState.message}</p>
          </div>
          <Button onClick={handleRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      );
    }

    const isLoading = viewerState.status === 'loading' || viewerState.status === 'slow';
    const isSlow = viewerState.status === 'slow';

    return (
      <div className={cn('relative w-full h-full', className)}>
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 gap-3">
            <LoadingSpinner message={isSlow ? 'This may take a moment...' : 'Opening book...'} size="lg" />
            {isSlow && (
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Large or complex books may take longer to open.
              </p>
            )}
          </div>
        )}
        <div 
          ref={containerRef} 
          className="w-full h-full min-h-[300px] md:min-h-[500px]"
          style={{ 
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease'
          }}
        />
      </div>
    );
  }
);
