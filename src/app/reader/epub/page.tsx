'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/loading-spinner';
import { EpubViewer, EpubViewerHandle } from '@/components/epub-viewer';
import { EpubErrorBoundary } from '@/components/epub-error-boundary';
import { TocSidebar } from '@/components/toc-sidebar';
import { ReaderNavigation } from '@/components/reader-navigation';
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation';
import { useBookImport } from '@/context/book-import-context';
import { useToast } from '@/components/ui/toast-provider';
import { TocItem } from '@/types';

export default function EpubReaderPage() {
  const { currentBook, clearCurrentBook } = useBookImport();
  const [isRouting, setIsRouting] = useState(true);
  const [chapterProgress, setChapterProgress] = useState({ current: 0, total: 0 });
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [currentHref, setCurrentHref] = useState('');
  const [viewerKey, setViewerKey] = useState(0);
  const viewerRef = React.useRef<EpubViewerHandle>(null);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (!currentBook) {
      router.push('/');
      return;
    }

    if (currentBook.format !== 'epub') {
      showToast('This book is not an EPUB file', 'error');
      router.push('/');
      return;
    }

    const timer = setTimeout(() => {
      setIsRouting(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [currentBook, router, showToast]);

  // Update progress from viewer
  useEffect(() => {
    if (!viewerRef.current || isRouting) return;

    const interval = setInterval(() => {
      const location = viewerRef.current?.getCurrentLocation();
      if (location) {
        setChapterProgress({
          current: location.index,
          total: location.total,
        });
        setCurrentHref(location.href);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isRouting, viewerKey]);

  const handleNext = React.useCallback(() => {
    viewerRef.current?.next();
  }, []);

  const handlePrev = React.useCallback(() => {
    viewerRef.current?.prev();
  }, []);

  const handleTocItemClick = React.useCallback((href: string) => {
    viewerRef.current?.goTo(href);
    setIsTocOpen(false);
  }, []);

  // Keyboard navigation
  useKeyboardNavigation({
    onNext: handleNext,
    onPrev: handlePrev,
    disabled: isRouting,
  });

  // 'T' key to toggle TOC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 't' || e.key === 'T') {
        // Don't trigger if typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
        }
        e.preventDefault();
        setIsTocOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGoHome = () => {
    clearCurrentBook();
    router.push('/');
  };

  const handleResetViewer = () => {
    setViewerKey((prev) => prev + 1);
  };

  const handleTocLoaded = React.useCallback((toc: TocItem[]) => {
    setTocItems(toc);
  }, []);

  if (!currentBook) {
    return <LoadingSpinner message="Loading..." fullScreen />;
  }

  if (isRouting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <LoadingSpinner message="Opening EPUB..." size="lg" />
        <p className="mt-4 text-sm text-muted-foreground">{currentBook.file.name}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Reader Header */}
      <div className="flex items-center justify-between border-b border-border px-3 sm:px-4 py-3 shrink-0">
        <Button onClick={handleGoHome} variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>

        <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
          <BookOpen className="h-4 w-4 shrink-0" />
          <span className="truncate max-w-[150px] sm:max-w-[200px] md:max-w-[300px]">
            {currentBook.file.name}
          </span>
        </div>

        <Button
          onClick={() => setIsTocOpen(!isTocOpen)}
          variant="ghost"
          size="sm"
          className="gap-2"
          aria-label="Toggle table of contents"
        >
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">Contents</span>
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* TOC Sidebar */}
        <div className="sm:relative absolute z-30">
          <TocSidebar
            items={tocItems}
            currentHref={currentHref}
            onItemClick={handleTocItemClick}
            isOpen={isTocOpen}
            onClose={() => setIsTocOpen(false)}
          />
        </div>

        {/* EPUB Viewer */}
        <div className="flex-1 overflow-hidden">
          <EpubErrorBoundary onReset={handleResetViewer}>
            <EpubViewer
              key={viewerKey}
              ref={viewerRef}
              file={currentBook.file}
              className="h-full"
              onTocLoaded={handleTocLoaded}
            />
          </EpubErrorBoundary>
        </div>
      </div>

      {/* Navigation */}
      <ReaderNavigation
        onNext={handleNext}
        onPrev={handlePrev}
        canGoNext={chapterProgress.current < chapterProgress.total - 1}
        canGoPrev={chapterProgress.current > 0}
        currentChapter={chapterProgress.current}
        totalChapters={chapterProgress.total}
      />
    </div>
  );
}
