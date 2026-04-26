'use client';

import { usePathname } from 'next/navigation';
import './MarkdownLink.css';

export function MarkdownLink() {
  const pathname = usePathname();

  return (
    <a
      className="MarkdownLinkRoot"
      href={`${pathname}.md`}
      aria-label="View markdown source"
      rel="alternate"
      type="text/markdown"
    >
      <svg
        className="MarkdownLinkIcon"
        width="20"
        height="14"
        viewBox="0 0 20 14"
        fill="currentColor"
        aria-hidden
      >
        <rect x="0" y="0" width="20" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 11V3h2l2 2.5L9 3h2v8H9V6.5L7 9 5 6.5V11H3zm10 0L10 7h2V3h2v4h2l-3 4z" />
      </svg>
      <span>View as Markdown</span>
    </a>
  );
}
