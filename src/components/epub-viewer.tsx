'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import ePub from 'epubjs';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/loading-spinner';
import { cn } from '@/lib/utils';

interface EpubViewerProps {
  file: File;
  className?: string;
}

type ViewerState = 
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; message: string };

export function EpubViewer({ file, className }: EpubViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<ePub.Book | null>(null);
  const renditionRef = useRef<ePub.Rendition | null>(null);
  const [viewerState, setViewerState] = useState<ViewerState>({ status: 'loading' });
  const [retryKey, setRetryKey] = useState(0);

  // Main effect: read file and initialize epub.js
  useEffect(() => {
    if (!containerRef.current) return;

    let isMounted = true;

    const initBook = async () => {
      try {
        // Read file as ArrayBuffer - this is more reliable than blob URLs
        const arrayBuffer = await file.arrayBuffer();
        
        if (!isMounted) return;

        // Pass ArrayBuffer directly to epub.js
        const book = ePub(arrayBuffer);
        bookRef.current = book;

        await book.ready;
        if (!isMounted || !containerRef.current) return;

        const rendition = book.renderTo(containerRef.current, {
          width: '100%',
          height: '100%',
          spread: 'auto',
        });
        renditionRef.current = rendition;

        await rendition.display();
        if (isMounted) {
          setViewerState({ status: 'ready' });
        }
      } catch (err) {
        if (isMounted) {
          console.error('EPUB error:', err);
          setViewerState({ 
            status: 'error', 
            message: err instanceof Error 
              ? err.message 
              : 'Failed to open this EPUB file. It may be corrupted or password-protected.' 
          });
        }
      }
    };

    initBook();

    return () => {
      isMounted = false;
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

  const isLoading = viewerState.status === 'loading';

  return (
    <div className={cn('relative w-full h-full', className)}>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
          <LoadingSpinner message="Opening book..." size="lg" />
        </div>
      )}
      <div 
        ref={containerRef} 
        className="w-full h-full min-h-[500px]"
        style={{ 
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease'
        }}
      />
    </div>
  );
}
