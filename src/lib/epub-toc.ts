/**
 * EPUB Table of Contents extraction utilities
 */

import { TocItem } from '@/types';

/**
 * Raw navigation item from epub.js
 */
interface EpubNavItem {
  label: string;
  href: string;
  subitems?: EpubNavItem[];
}

/**
 * Extract table of contents from an epub.js book instance
 * @param navigation - The book.navigation object from epub.js
 * @returns Array of TOC items with nested structure
 */
export function extractToc(navigation: { toc: EpubNavItem[] }): TocItem[] {
  if (!navigation || !navigation.toc || navigation.toc.length === 0) {
    return [];
  }

  return navigation.toc.map((item) => normalizeTocItem(item));
}

/**
 * Normalize a single epub.js navigation item to our TocItem format
 */
function normalizeTocItem(item: EpubNavItem): TocItem {
  return {
    label: cleanLabel(item.label),
    href: item.href,
    subitems: item.subitems?.map((subitem) => normalizeTocItem(subitem)),
  };
}

/**
 * Clean up chapter labels by removing extra whitespace and HTML entities
 */
function cleanLabel(label: string): string {
  if (!label) return 'Untitled Chapter';
  
  return label
    .replace(/\s+/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Flatten nested TOC into a single-level array for simple list views
 */
export function flattenToc(items: TocItem[]): TocItem[] {
  const result: TocItem[] = [];

  for (const item of items) {
    result.push(item);
    if (item.subitems && item.subitems.length > 0) {
      result.push(...flattenToc(item.subitems));
    }
  }

  return result;
}

/**
 * Find a TOC item by href
 */
export function findTocItemByHref(items: TocItem[], href: string): TocItem | undefined {
  for (const item of items) {
    if (item.href === href) return item;
    if (item.subitems) {
      const found = findTocItemByHref(item.subitems, href);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Get chapter count from TOC (including nested items)
 */
export function getTotalChapterCount(items: TocItem[]): number {
  let count = 0;
  for (const item of items) {
    count++;
    if (item.subitems) {
      count += getTotalChapterCount(item.subitems);
    }
  }
  return count;
}
