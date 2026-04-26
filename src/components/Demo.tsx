'use client';

import { useState, useCallback, useRef } from 'react';
import './Demo.css';

interface DemoFile {
  name: string;
  content: string;
  language?: string;
}

interface DemoProps {
  children: React.ReactNode;
  files: DemoFile[];
  defaultCollapsed?: boolean;
}

export function Demo({ children, files, defaultCollapsed = true }: DemoProps) {
  const [activeFile, setActiveFile] = useState(0);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  const activeContent = files[activeFile];
  const lineCount = activeContent.content.split('\n').length;
  const shouldCollapse = lineCount > 12;

  const handleCopy = useCallback(() => {
    const text = codeRef.current?.textContent ?? activeContent.content;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [activeContent.content]);

  return (
    <div className="DemoRoot">
      <div className="DemoPlayground">
        <div className="DemoPlaygroundInner">{children}</div>
      </div>
      <div className="DemoToolbar">
        <div className="DemoFileSelector">
          {files.length === 1 ? (
            <span className="DemoFilename">{files[0].name}</span>
          ) : (
            <div className="DemoTabsList">
              {files.map((file, i) => (
                <button
                  key={file.name}
                  className="DemoTab"
                  data-active={i === activeFile ? '' : undefined}
                  onClick={() => setActiveFile(i)}
                >
                  {file.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="DemoToolbarActions">
          <button className="DemoActionButton" onClick={handleCopy} aria-label="Copy code">
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
      </div>
      <div
        className="DemoCodeBlockRoot"
        data-closed={collapsed && shouldCollapse ? '' : undefined}
      >
        <div
          className="DemoCodeBlockViewport"
          data-closed={collapsed && shouldCollapse ? '' : undefined}
        >
          <div className="DemoSourceBrowser">
            <pre>
              <code
                ref={codeRef}
                className={`language-${activeContent.language ?? 'tsx'}`}
                dangerouslySetInnerHTML={{ __html: activeContent.content }}
              />
            </pre>
          </div>
        </div>
      </div>
      {shouldCollapse && (
        <button
          className="DemoCollapseButton"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? 'Show code' : 'Hide code'}
        </button>
      )}
    </div>
  );
}
