'use client';

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import ePub from 'epubjs';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/loading-spinner';
import { cn } from '@/lib/utils';
import { TocItem } from '@/types';
import { extractToc } from '@/lib/epub-toc';

export interface EpubViewerHandle {
  next: () => void;
  prev: () => void;
  goTo: (href: string) => void;
  getCurrentLocation: () => { index: number; total: number; href: string } | null;
}

interface EpubViewerProps {
  file: File;
  className?: string;
  onTocLoaded?: (toc: TocItem[]) => void;
  fontSize?: number;
  lineHeight?: number;
  maxWidth?: 'narrow' | 'medium' | 'wide';
}

export type ViewerState =
  | { status: 'loading' }
  | { status: 'slow' }
  | { status: 'ready' }
  | { status: 'error'; message: string };

// Timeout after which we show a "taking longer" message
const SLOW_LOAD_THRESHOLD = 8000; // 8 seconds
// Absolute timeout after which we give up
const MAX_LOAD_TIMEOUT = 30000; // 30 seconds

export const EpubViewer = forwardRef<EpubViewerHandle, EpubViewerProps>(
  function EpubViewer({ file, className, onTocLoaded, fontSize = 16, lineHeight = 1.6, maxWidth = 'medium' }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const bookRef = useRef<ePub.Book | null>(null);
    const renditionRef = useRef<ePub.Rendition | null>(null);
    const [viewerState, setViewerState] = useState<ViewerState>({ status: 'loading' });
    const [retryKey, setRetryKey] = useState(0);
    const spineLengthRef = useRef(0);
    const currentIndexRef = useRef(0);
    const currentHrefRef = useRef('');

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
      goTo: (href: string) => {
        if (renditionRef.current) {
          renditionRef.current.display(href);
        }
      },
      getCurrentLocation: () => {
        if (!bookRef.current) return null;
        return {
          index: currentIndexRef.current,
          total: spineLengthRef.current,
          href: currentHrefRef.current,
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
          const arrayBuffer = await file.arrayBuffer();

          if (!isMounted) return;

          if (arrayBuffer.byteLength < 100) {
            throw new Error('File appears to be empty or corrupted.');
          }

          const book = ePub(arrayBuffer);
          bookRef.current = book;

          await book.ready;
          if (!isMounted || !containerRef.current) return;

          spineLengthRef.current = book.spine.length;

          if (spineLengthRef.current === 0) {
            throw new Error('This EPUB file has no readable content. It may be corrupted or have an invalid structure.');
          }

          // Extract TOC
          try {
            const toc = extractToc(book.navigation);
            if (isMounted) {
              onTocLoaded?.(toc);
            }
          } catch {
            // TOC extraction failed but book can still be read
            if (isMounted) {
              onTocLoaded?.([]);
            }
          }

          const rendition = book.renderTo(containerRef.current, {
            width: '100%',
            height: '100%',
            spread: 'auto',
          });
          renditionRef.current = rendition;

          // Track location changes
          rendition.on('relocated', (location: { start: { index: number; href: string } }) => {
            currentIndexRef.current = location.start.index;
            currentHrefRef.current = location.start.href;
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
    }, [file, retryKey, onTocLoaded]);

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

    // Apply reader settings to the rendition
    useEffect(() => {
      if (!renditionRef.current || viewerState.status !== 'ready') return;

      const rendition = renditionRef.current;

      // Apply font size
      rendition.themes.fontSize(`${fontSize}px`);

      // Apply line height via CSS override
      rendition.themes.override('line-height', `${lineHeight}`);

      // Apply max width by adjusting the rendition's layout
      // We use CSS on the iframe's body through the theme system
      const maxWidthPixels = {
        narrow: '600px',
        medium: '800px',
        wide: '1000px',
      }[maxWidth];

      rendition.themes.override('max-width', maxWidthPixels, true);

      // Force resize to apply changes
      rendition.resize();
    }, [fontSize, lineHeight, maxWidth, viewerState.status]);

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
