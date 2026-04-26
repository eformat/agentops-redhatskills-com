'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import './Search.css';

interface SearchEntry {
  title: string;
  href: string;
  section: string;
}

let fuseInstance: Fuse<SearchEntry> | null = null;
let indexPromise: Promise<void> | null = null;

function loadIndex(): Promise<void> {
  if (!indexPromise) {
    indexPromise = fetch('/search-index.json')
      .then((r) => r.json())
      .then((data: SearchEntry[]) => {
        fuseInstance = new Fuse(data, {
          keys: ['title', 'section'],
          threshold: 0.3,
        });
      });
  }
  return indexPromise;
}

export function Search() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setResults([]);
    setSelected(0);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [close]);

  useEffect(() => {
    if (open) {
      loadIndex();
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelected(0);
      return;
    }
    if (fuseInstance) {
      setResults(fuseInstance.search(query, { limit: 10 }).map((r) => r.item));
      setSelected(0);
    }
  }, [query]);

  function navigate(href: string) {
    close();
    router.push(href);
  }

  function onKeyDownInput(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter' && results[selected]) {
      navigate(results[selected].href);
    }
  }

  if (!open) return null;

  return (
    <div className="SearchOverlay" onClick={close}>
      <div className="SearchDialog" onClick={(e) => e.stopPropagation()}>
        <div className="SearchInputWrapper">
          <svg className="SearchIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            className="SearchInput"
            placeholder="Search documentation..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDownInput}
          />
          <kbd className="SearchKbd">Esc</kbd>
        </div>
        {results.length > 0 && (
          <ul className="SearchResults">
            {results.map((r, i) => (
              <li key={r.href}>
                <button
                  className="SearchResult"
                  data-selected={i === selected ? '' : undefined}
                  onClick={() => navigate(r.href)}
                  onMouseEnter={() => setSelected(i)}
                >
                  <span className="SearchResultTitle">{r.title}</span>
                  {r.section && (
                    <span className="SearchResultSection">{r.section}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
        {query.trim() && results.length === 0 && (
          <div className="SearchEmpty">No results found.</div>
        )}
      </div>
    </div>
  );
}

export function SearchTrigger() {
  return (
    <button
      className="SearchTrigger"
      onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <span>Search</span>
      <kbd className="SearchTriggerKbd">Ctrl + K</kbd>
    </button>
  );
}
