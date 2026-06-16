import { useEffect, useRef } from 'react';
import type { InstallLog } from '../types';

interface TerminalProps {
  logs: InstallLog[];
  title?: string;
  maxHeight?: string;
}

const LEVEL_CONFIG = {
  info:    { icon: '>',  color: '#89b4fa', label: 'INFO'  },
  warn:    { icon: '!',  color: '#f9e2af', label: 'WARN'  },
  error:   { icon: 'x',  color: '#f38ba8', label: 'ERROR' },
  success: { icon: '~',  color: '#a6e3a1', label: 'OK'    },
};

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function Terminal({ logs, title = 'terminal', maxHeight = '400px' }: TerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
      }}
    >
      {/* ── Title Bar ── */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 select-none"
        style={{
          background: 'linear-gradient(180deg, #1e2030 0%, #181926 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        {/* macOS traffic lights */}
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background: '#f38ba8',
              boxShadow: '0 0 6px rgba(243,139,168,0.4)',
            }}
          />
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background: '#f9e2af',
              boxShadow: '0 0 6px rgba(249,226,175,0.4)',
            }}
          />
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background: '#a6e3a1',
              boxShadow: '0 0 6px rgba(166,227,161,0.4)',
            }}
          />
        </div>

        {/* Divider */}
        <div className="w-px h-3.5" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* Terminal icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6c7086" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>

        <span
          className="text-xs font-mono font-medium tracking-wide"
          style={{ color: '#6c7086' }}
        >
          {title}
        </span>

        {/* Right-side badge */}
        <div className="ml-auto">
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded"
            style={{
              background: 'rgba(137,180,250,0.08)',
              color: '#6c7086',
            }}
          >
            {logs.length} lines
          </span>
        </div>
      </div>

      {/* ── Terminal Body ── */}
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label={title}
        className="overflow-y-auto font-mono text-[13px] leading-relaxed"
        style={{
          background: '#0c0e14',
          maxHeight,
          scrollBehavior: 'smooth',
        }}
      >
        <div className="p-4 space-y-px">
          {/* Empty state */}
          {logs.length === 0 && (
            <div className="flex items-center gap-3 py-1">
              <span style={{ color: '#45475a' }} className="shrink-0 select-none opacity-60">
                {formatTime(Date.now())}
              </span>
              <span className="terminal-cursor" style={{ color: '#559eff' }} />
              <span style={{ color: '#45475a' }} className="text-xs">
                waiting for output...
              </span>
            </div>
          )}

          {/* Log entries */}
          {logs.map((log, i) => {
            const cfg = LEVEL_CONFIG[log.level];
            return (
              <div
                key={i}
                className="flex items-start gap-3 py-[3px] animate-fade-in group"
                style={{ animationDelay: `${Math.min(i * 20, 200)}ms` }}
              >
                {/* Timestamp */}
                <span
                  className="shrink-0 select-none tabular-nums"
                  style={{ color: '#45475a', fontSize: '11px', lineHeight: '20px' }}
                >
                  {formatTime(log.timestamp)}
                </span>

                {/* Level icon */}
                <span
                  className="shrink-0 font-bold select-none"
                  style={{
                    color: cfg.color,
                    width: '14px',
                    textAlign: 'center',
                    lineHeight: '20px',
                    fontSize: '12px',
                  }}
                >
                  {cfg.icon}
                </span>

                {/* Message */}
                <span
                  className="flex-1 break-all"
                  style={{
                    color: cfg.color,
                    lineHeight: '20px',
                    opacity: log.level === 'info' ? 0.85 : 1,
                  }}
                >
                  {log.message}
                </span>
              </div>
            );
          })}

          {/* Active cursor */}
          {logs.length > 0 && (
            <div className="flex items-center gap-3 pt-1 mt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
              <span className="terminal-cursor" style={{ color: '#559eff' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
