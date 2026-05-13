'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body className="min-h-full flex flex-col items-center justify-center bg-background text-foreground p-4">
        <div className="flex flex-col items-center gap-6 max-w-md text-center">
          <h1 className="text-4xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground text-lg">
            We encountered an unexpected error. Please try again or return home.
          </p>
          <div className="flex gap-3">
            <Button onClick={reset} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button asChild className="gap-2">
              <a href="/">
                <Home className="h-4 w-4" />
                Go Home
              </a>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
