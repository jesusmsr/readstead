'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, BookOpen, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TocItem } from '@/types';

interface TocSidebarProps {
  items: TocItem[];
  currentHref?: string;
  onItemClick?: (href: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function TocSidebar({
  items,
  currentHref,
  onItemClick,
  isOpen,
  onClose,
}: TocSidebarProps) {
  return (
    <>
      {/* Backdrop on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed sm:sticky top-0 left-0 z-50 sm:z-auto',
          'h-full w-80 max-w-[85vw]',
          'bg-background border-r border-border',
          'flex flex-col',
          'transition-transform duration-300 ease-in-out',
          'sm:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Contents</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors sm:hidden"
            aria-label="Close table of contents"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* TOC List */}
        <nav className="flex-1 overflow-y-auto p-2">
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No table of contents available
            </div>
          ) : (
            <ul className="space-y-0.5">
              {items.map((item, index) => (
                <TocTreeItem
                  key={`${item.href}-${index}`}
                  item={item}
                  currentHref={currentHref}
                  onItemClick={onItemClick}
                  level={0}
                />
              ))}
            </ul>
          )}
        </nav>
      </aside>
    </>
  );
}

interface TocTreeItemProps {
  item: TocItem;
  currentHref?: string;
  onItemClick?: (href: string) => void;
  level: number;
}

function TocTreeItem({ item, currentHref, onItemClick, level }: TocTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasSubitems = item.subitems && item.subitems.length > 0;
  const isActive = item.href === currentHref;

  const handleClick = () => {
    if (hasSubitems) {
      setIsExpanded(!isExpanded);
    }
    onItemClick?.(item.href);
  };

  return (
    <li>
      <button
        onClick={handleClick}
        className={cn(
          'w-full flex items-center gap-1 px-3 py-2 rounded-md text-sm text-left transition-colors',
          'hover:bg-muted',
          isActive && 'bg-primary/10 text-primary font-medium',
          level > 0 && 'ml-4'
        )}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        {hasSubitems && (
          <span
            className="shrink-0 p-0.5 rounded hover:bg-muted-foreground/10"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </span>
        )}
        <span className="truncate">{item.label}</span>
      </button>

      {hasSubitems && isExpanded && (
        <ul className="space-y-0.5">
          {item.subitems!.map((subitem, index) => (
            <TocTreeItem
              key={`${subitem.href}-${index}`}
              item={subitem}
              currentHref={currentHref}
              onItemClick={onItemClick}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
