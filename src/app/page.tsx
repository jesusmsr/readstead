import { BookOpen, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 py-12">
      <div className="flex flex-col items-center gap-8 max-w-md text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <BookOpen className="h-10 w-10 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Your Personal Library
          </h1>
          <p className="text-muted-foreground text-lg">
            Read EPUB and PDF books locally in your browser. No cloud, no tracking, just reading.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Button size="lg" className="gap-2">
            <Upload className="h-4 w-4" />
            Add Your First Book
          </Button>
          <p className="text-sm text-muted-foreground">
            Drop EPUB or PDF files anywhere to get started
          </p>
        </div>
      </div>
    </div>
  );
}
