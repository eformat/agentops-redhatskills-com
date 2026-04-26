'use client';

import { useState, useCallback, useRef } from 'react';
import './CodeBlock.css';

interface CodeBlockProps {
  title?: string;
  children: string;
  language?: string;
}

export function CodeBlock({ title, children, language = 'tsx' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  const handleCopy = useCallback(() => {
    const text = codeRef.current?.textContent ?? children;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [children]);

  return (
    <div className="CodeBlockRoot">
      {title && (
        <div className="CodeBlockPanel">
          <span className="CodeBlockPanelTitle">{title}</span>
          <button className="CodeBlockCopyButton" onClick={handleCopy} aria-label="Copy code">
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            )}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      )}
      <div className="CodeBlockContent">
        <pre className="CodeBlockPre">
          <code ref={codeRef} className={`language-${language}`} dangerouslySetInnerHTML={{ __html: children }} />
        </pre>
      </div>
    </div>
  );
}
