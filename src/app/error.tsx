'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw, AlertTriangle, Bug } from 'lucide-react';

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
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">
              We encountered an unexpected error. This could be due to a corrupted book file, 
              browser compatibility issue, or a temporary glitch.
            </p>
          </div>

          {error.digest && (
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              <Bug className="h-3 w-3" />
              <span>Error ID: {error.digest}</span>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={reset} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button asChild className="gap-2">
              <Link href="/">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            If this keeps happening, try a different book file or check that your browser is up to date.
          </p>
        </div>
      </body>
    </html>
  );
}
