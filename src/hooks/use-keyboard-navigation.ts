'use client';

import { useRef, useEffect } from 'react';

interface KeyboardNavigationProps {
  onNext: () => void;
  onPrev: () => void;
  disabled?: boolean;
}

/**
 * Hook that adds keyboard navigation support
 * ArrowRight/ArrowLeft for next/prev
 * Also Space/Enter for next page
 */
export function useKeyboardNavigation({
  onNext,
  onPrev,
  disabled = false,
}: KeyboardNavigationProps) {
  const onNextRef = useRef(onNext);
  const onPrevRef = useRef(onPrev);
  const disabledRef = useRef(disabled);

  // Keep refs up to date
  useEffect(() => {
    onNextRef.current = onNext;
    onPrevRef.current = onPrev;
    disabledRef.current = disabled;
  }, [onNext, onPrev, disabled]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabledRef.current) return;

      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          onNextRef.current();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          onPrevRef.current();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
