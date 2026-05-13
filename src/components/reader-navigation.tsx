'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReaderNavigationProps {
  onNext: () => void;
  onPrev: () => void;
  canGoNext?: boolean;
  canGoPrev?: boolean;
  currentChapter?: number;
  totalChapters?: number;
  className?: string;
}

export function ReaderNavigation({
  onNext,
  onPrev,
  canGoNext = true,
  canGoPrev = true,
  currentChapter = 0,
  totalChapters = 0,
  className,
}: ReaderNavigationProps) {
  const hasProgress = totalChapters > 0;

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 sm:gap-4 px-2 sm:px-4 py-2 sm:py-3 border-t border-border bg-background',
        className
      )}
    >
      <Button
        variant="outline"
        size="lg"
        onClick={onPrev}
        disabled={!canGoPrev}
        className="gap-1 sm:gap-2 min-w-[100px] sm:min-w-[120px] touch-manipulation h-11 sm:h-10"
        aria-label="Previous chapter"
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      {hasProgress && (
        <div className="text-xs sm:text-sm text-muted-foreground min-w-[100px] sm:min-w-[140px] text-center">
          <span className="font-medium text-foreground">
            {currentChapter + 1}
          </span>
          <span className="mx-1">/</span>
          <span className="font-medium text-foreground">{totalChapters}</span>
          <span className="hidden sm:inline ml-1">chapters</span>
        </div>
      )}

      <Button
        variant="outline"
        size="lg"
        onClick={onNext}
        disabled={!canGoNext}
        className="gap-1 sm:gap-2 min-w-[100px] sm:min-w-[120px] touch-manipulation h-11 sm:h-10"
        aria-label="Next chapter"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
