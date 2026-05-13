import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <BookOpen className="h-10 w-10 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold">404</h1>
          <h2 className="text-xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you are looking for does not exist. It might have been moved or deleted.
          </p>
        </div>

        <Button asChild className="gap-2">
          <Link href="/">
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
