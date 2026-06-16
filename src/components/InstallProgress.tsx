import type { InstallLog } from '../types';
import Terminal from './Terminal';

interface InstallProgressProps {
  logs: InstallLog[];
  status: 'idle' | 'installing' | 'success' | 'error';
  progress: number;
  onRetry?: () => void;
}

const STATUS_META = {
  idle: {
    label: '准备安装',
    color: 'var(--text-tertiary)',
    barColor: 'transparent',
  },
  installing: {
    label: '安装中',
    color: '#89b4fa',
    barColor: 'linear-gradient(90deg, #2b7bff 0%, #60a5fa 60%, #93c5fd 100%)',
  },
  success: {
    label: '安装完成',
    color: '#a6e3a1',
    barColor: 'linear-gradient(90deg, #22c55e 0%, #4ade80 50%, #86efac 100%)',
  },
  error: {
    label: '安装失败',
    color: '#f38ba8',
    barColor: 'linear-gradient(90deg, #ef4444 0%, #f87171 60%, #fca5a5 100%)',
  },
};

function StatusIcon({ status }: { status: InstallProgressProps['status'] }) {
  if (status === 'installing') {
    return (
      <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="rgba(43,123,255,0.2)" strokeWidth="3" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#2b7bff" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (status === 'success') {
    return (
      <div
        className="flex items-center justify-center rounded-full animate-scale-in"
        style={{
          width: 20,
          height: 20,
          background: 'rgba(34,197,94,0.15)',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: 20,
          height: 20,
          background: 'rgba(239,68,68,0.12)',
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
    );
  }
  // idle
  return (
    <div
      className="rounded-full"
      style={{
        width: 18,
        height: 18,
        border: '2px solid var(--border-secondary)',
      }}
    />
  );
}

export default function InstallProgress({ logs, status, progress, onRetry }: InstallProgressProps) {
  const meta = STATUS_META[status];
  const pct = Math.round(progress);

  return (
    <div className="space-y-4">
      {/* ── Header Row ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusIcon status={status} />
          <span
            className="text-sm font-semibold tracking-wide"
            style={{ color: meta.color }}
          >
            {meta.label}
            {status === 'installing' && (
              <span
                className="ml-2 font-mono text-xs tabular-nums"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {pct}%
              </span>
            )}
          </span>
        </div>

        {status === 'error' && onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: 'rgba(239,68,68,0.08)',
              color: '#f38ba8',
              border: '1px solid rgba(239,68,68,0.15)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)';
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            重试
          </button>
        )}
      </div>

      {/* ── Progress Bar ── */}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="安装进度"
        className="relative h-2 rounded-full overflow-hidden"
        style={{ background: 'var(--bg-tertiary)' }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: meta.barColor,
            boxShadow: status === 'installing'
              ? '0 0 12px rgba(43,123,255,0.5)'
              : status === 'success'
              ? '0 0 12px rgba(34,197,94,0.4)'
              : status === 'error'
              ? '0 0 12px rgba(239,68,68,0.4)'
              : 'none',
          }}
        />
        {/* Shimmer overlay for installing state */}
        {status === 'installing' && (
          <div
            className="absolute inset-0 shimmer"
            style={{ opacity: 0.15, borderRadius: '9999px' }}
          />
        )}
      </div>

      {/* ── Embedded Terminal ── */}
      <Terminal logs={logs} title="install-process" maxHeight="360px" />
    </div>
  );
}
