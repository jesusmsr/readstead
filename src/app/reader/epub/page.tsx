"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { EpubViewer } from "@/components/epub-viewer";
import { useBookImport } from "@/context/book-import-context";
import { useToast } from "@/components/ui/toast-provider";

export default function EpubReaderPage() {
  const { currentBook, clearCurrentBook } = useBookImport();
  const [isRouting, setIsRouting] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (!currentBook) {
      // No book imported, redirect to home
      router.push("/");
      return;
    }

    if (currentBook.format !== "epub") {
      showToast("This book is not an EPUB file", "error");
      router.push("/");
      return;
    }

    // Small delay to show loading state
    const timer = setTimeout(() => {
      setIsRouting(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [currentBook, router, showToast]);

  const handleGoHome = () => {
    clearCurrentBook();
    router.push("/");
  };

  if (!currentBook) {
    return <LoadingSpinner message="Loading..." fullScreen />;
  }

  if (isRouting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <LoadingSpinner message="Opening EPUB..." size="lg" />
        <p className="mt-4 text-sm text-muted-foreground">
          {currentBook.file.name}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Reader Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <Button
          onClick={handleGoHome}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span className="truncate max-w-[200px]">
            {currentBook.file.name}
          </span>
        </div>
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      {/* EPUB Viewer */}
      <div className="flex-1 overflow-hidden">
        <EpubViewer file={currentBook.file} className="h-[calc(100vh-7rem)]" />
      </div>
    </div>
  );
}
