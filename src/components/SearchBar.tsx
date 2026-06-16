import { useState, useRef } from 'react';
import { Search, Link as LinkIcon, Loader2, Sparkles, MoreHorizontal } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onUrlSubmit: (url: string) => void;
  onShowHot?: () => void;
  loading?: boolean;
}

export default function SearchBar({ onSearch, onUrlSubmit, onShowHot, loading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'search' | 'url'>('search');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSearchActive = mode === 'search';

  const handleSubmit = () => {
    if (loading) return;
    if (mode === 'url' || query.includes('github.com') || query.includes('npmjs.com')) {
      onUrlSubmit(query.trim());
    } else if (query.trim()) {
      onSearch(query.trim());
    } else if (onShowHot) {
      onShowHot();
    }
  };

  const handleModeClick = (newMode: 'search' | 'url') => {
    setMode(newMode);
    if (newMode === 'search' && query.trim()) {
      onSearch(query.trim());
    } else if (newMode === 'search' && !query.trim() && onShowHot) {
      onShowHot();
    }
    inputRef.current?.focus();
  };

  return (
    <div className="w-full mx-auto flex flex-col items-center" style={{ maxWidth: 800 }}>
      {/* ═══════════ Mode Buttons Row ═══════════ */}
      <div className="flex items-center gap-3">
        {/* 关键词搜索 — Bright gold filled capsule (default active) */}
        <button
          onClick={() => handleModeClick('search')}
          className="flex items-center gap-2.5 rounded-full transition-all duration-300"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 15,
            fontWeight: 700,
            padding: '11px 30px',
            background: isSearchActive
              ? 'linear-gradient(135deg, #f0d4b0 0%, #d4a574 50%, #c49564 100%)'
              : 'var(--bg-secondary)',
            color: isSearchActive ? '#1a1412' : 'var(--text-tertiary)',
            border: isSearchActive
              ? '1px solid rgba(240,212,176,0.3)'
              : '1px solid var(--border-primary)',
            boxShadow: isSearchActive
              ? '0 0 40px rgba(212,165,116,0.5), 0 0 80px rgba(212,165,116,0.15), 0 4px 15px rgba(0,0,0,0.35)'
              : 'var(--shadow-inset)',
            textShadow: isSearchActive ? '0 1px 2px rgba(0,0,0,0.15)' : 'none',
            cursor: 'pointer',
            letterSpacing: '0.02em',
          }}
        >
          <Sparkles style={{ width: 17, height: 17 }} />
          <span>关键词搜索</span>
        </button>

        {/* 链接导入 — Brighter outline capsule (secondary) */}
        <button
          onClick={() => handleModeClick('url')}
          className="flex items-center gap-2.5 rounded-full transition-all duration-300"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 15,
            fontWeight: 600,
            padding: '11px 30px',
            background: !isSearchActive
              ? 'rgba(var(--accent-rgb), 0.08)'
              : 'var(--bg-secondary)',
            color: !isSearchActive ? 'var(--text-accent)' : 'var(--text-tertiary)',
            border: '1px solid',
            borderColor: !isSearchActive
              ? 'rgba(var(--accent-rgb), 0.55)'
              : 'var(--border-primary)',
            boxShadow: !isSearchActive
              ? '0 0 16px rgba(var(--accent-rgb), 0.15), inset 0 0 8px rgba(var(--accent-rgb), 0.04)'
              : 'var(--shadow-inset)',
            cursor: 'pointer',
            letterSpacing: '0.02em',
          }}
        >
          <LinkIcon style={{ width: 17, height: 17 }} />
          <span>链接导入</span>
        </button>
      </div>

      {/* ═══════════ Search Input with Strong Cyan Glow ═══════════ */}
      <div
        className="relative flex items-center w-full mt-6 transition-all duration-300"
        style={{
          background: 'var(--bg-card)',
          border: '1.5px solid',
          borderColor: isFocused || isSearchActive
            ? 'rgba(94,196,212,0.7)'
            : 'var(--border-primary)',
          borderRadius: 20,
          height: 58,
          boxShadow: isFocused || isSearchActive
            ? '0 0 30px rgba(94,196,212,0.35), 0 0 60px rgba(94,196,212,0.12), inset 0 0 16px rgba(94,196,212,0.06)'
            : 'var(--shadow-inset), 0 0 8px rgba(var(--accent-rgb), 0.06)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Search icon */}
        <div
          className="pl-5 transition-all duration-300 flex-shrink-0"
          style={{ color: isFocused || isSearchActive ? '#5ec4d4' : 'var(--text-tertiary)' }}
        >
          {loading ? (
            <Loader2 style={{ width: 20, height: 20 }} className="animate-spin" />
          ) : (
            <Search style={{ width: 20, height: 20 }} />
          )}
        </div>

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
          placeholder={
            mode === 'url'
              ? '输入 GitHub 仓库链接或 npm 包地址...'
              : '热门推荐'
          }
          className="flex-1 bg-transparent outline-none px-3 min-w-0"
          style={{
            color: 'var(--text-primary)',
            fontFamily: "'Inter', sans-serif",
            fontSize: 15,
            fontWeight: query ? 400 : 500,
            letterSpacing: '-0.01em',
          }}
        />

        {/* Right side: submit / more button */}
        <button
          type="button"
          onClick={handleSubmit}
          className="flex items-center justify-center mr-2 rounded-full transition-all duration-200 hover:scale-110 flex-shrink-0"
          style={{
            width: 34,
            height: 34,
            color: isFocused || isSearchActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
            background: isFocused || isSearchActive
              ? 'rgba(94,196,212,0.12)'
              : 'var(--bg-tertiary)',
            border: '1px solid',
            borderColor: isFocused || isSearchActive
              ? 'rgba(94,196,212,0.3)'
              : 'var(--border-primary)',
            cursor: 'pointer',
          }}
          aria-label={loading ? '搜索中...' : '搜索'}
        >
          <MoreHorizontal style={{ width: 18, height: 18 }} />
        </button>
      </div>
    </div>
  );
}
