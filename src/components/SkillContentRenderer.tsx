import React from 'react';
import { Zap, ExternalLink, ArrowUpRight } from 'lucide-react';
import type { ContentLine } from '../utils/skill-content';

/* ═══════════════════════════════════════════════════
   Content Renderer Functions
   ═══════════════════════════════════════════════════ */

export function renderContentLine(line: ContentLine, idx: number, accentColor: string) {
  switch (line.type) {
    case 'paragraph':
      return (
        <div key={idx} style={{ fontSize: 13, lineHeight: 1.8, color: 'rgba(200,190,180,0.8)', marginBottom: 2 }}>
          {formatInlineMarkdown(line.text)}
        </div>
      );

    case 'spacer':
      return <div key={idx} style={{ height: 6 }} />;

    case 'header':
      return (
        <div key={idx} style={{
          fontSize: 13.5,
          fontWeight: 700,
          color: 'var(--text-primary)',
          fontFamily: "'Inter', sans-serif",
          letterSpacing: '0.01em',
          padding: '4px 0',
        }}>
          {line.text}
        </div>
      );

    case 'feature':
      return (
        <div key={idx} style={{
          padding: '10px 12px',
          borderRadius: 10,
          background: 'linear-gradient(135deg, rgba(var(--accent-rgb),0.06), rgba(94,196,212,0.04))',
          border: '1px solid rgba(var(--accent-rgb),0.08)',
          marginBottom: 2,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap style={{ width: 13, height: 13, color: accentColor }} />
            {line.name}
          </div>
          <div style={{ fontSize: 12.5, lineHeight: 1.7, color: 'rgba(200,190,180,0.75)' }}>
            {line.text}
          </div>
        </div>
      );

    case 'numbered': {
      const text = line.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <div key={idx} style={{
          display: 'flex',
          gap: 10,
          marginBottom: 6,
          padding: '6px 0',
        }}>
          <div style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--bg-body)',
            flexShrink: 0,
            marginTop: 1,
          }}>
            {line.num}
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(200,190,180,0.8)', flex: 1 }}
            dangerouslySetInnerHTML={{ __html: text }} />
        </div>
      );
    }

    case 'tagLine':
      return (
        <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 4, padding: '4px 0' }}>
          <span style={{
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 600,
            fontFamily: "'JetBrains Mono', monospace",
            background: `${accentColor}18`,
            color: accentColor,
            border: `1px solid ${accentColor}30`,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}>
            {line.label}
          </span>
          <span style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(200,190,180,0.75)' }}>
            {line.text}
          </span>
        </div>
      );

    case 'stat': {
      const statIcons: Record<string, string> = { star: '⭐', fork: '⑂', eye: '👁', trend: '📈' };
      return (
        <div key={idx} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '7px 12px',
          borderRadius: 8,
          background: 'rgba(42,34,32,0.3)',
          border: '1px solid rgba(var(--accent-rgb),0.06)',
          marginBottom: 4,
        }}>
          <span style={{ fontSize: 12.5, color: 'rgba(200,190,180,0.7)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{statIcons[line.icon] || '•'}</span>
            {line.label}
          </span>
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '-0.02em',
          }}>
            {line.value}
          </span>
        </div>
      );
    }

    case 'detailRow':
      return (
        <div key={idx} style={{
          display: 'flex',
          alignItems: 'center',
          padding: '5px 0',
          borderBottom: '1px solid rgba(var(--accent-rgb),0.04)',
        }}>
          <span style={{
            fontSize: 12,
            color: 'rgba(200,190,180,0.5)',
            width: 80,
            flexShrink: 0,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
          }}>
            {line.label}
          </span>
          <span style={{
            fontSize: 13,
            color: 'var(--text-primary)',
            fontWeight: 500,
            fontFamily: "'Inter', sans-serif",
          }}>
            {line.value}
          </span>
        </div>
      );

    case 'code':
      return (
        <div key={idx} style={{
          padding: '10px 14px',
          borderRadius: 10,
          background: '#14100e',
          border: '1px solid rgba(var(--accent-rgb),0.1)',
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
          color: 'rgba(200,210,220,0.85)',
          lineHeight: 1.7,
          whiteSpace: 'pre',
          overflowX: 'auto',
        }}>
          {line.text}
        </div>
      );

    case 'link':
      return (
        <a key={idx}
          href={line.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 12px',
            borderRadius: 8,
            background: 'rgba(94,196,212,0.05)',
            border: '1px solid rgba(94,196,212,0.12)',
            color: '#5ec4d4',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 4,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(94,196,212,0.1)';
            e.currentTarget.style.borderColor = 'rgba(94,196,212,0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(94,196,212,0.05)';
            e.currentTarget.style.borderColor = 'rgba(94,196,212,0.12)';
          }}
        >
          <ExternalLink style={{ width: 13, height: 13, flexShrink: 0 }} />
          {line.label}
          <ArrowUpRight style={{ width: 12, height: 12, marginLeft: 'auto', opacity: 0.5 }} />
        </a>
      );

    case 'example':
      return (
        <div key={idx} style={{
          padding: '12px 14px',
          borderRadius: 10,
          background: 'rgba(var(--accent-rgb),0.04)',
          border: '1px solid rgba(var(--accent-rgb),0.1)',
          marginBottom: 8,
          transition: 'all 0.2s ease',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.07)'; e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb),0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.04)'; e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb),0.1)'; }}
        >
          <div style={{
            fontSize: 12,
            lineHeight: 1.6,
            color: 'rgba(200,210,220,0.85)',
            fontFamily: "'JetBrains Mono', 'Inter', monospace",
            marginBottom: 6,
            wordBreak: 'break-all',
          }}>
            {line.command}
          </div>
          <div style={{
            fontSize: 11.5,
            color: '#6b5f55',
            fontFamily: "'Inter', 'PingFang SC', sans-serif",
            lineHeight: 1.5,
          }}>
            {line.description}
          </div>
        </div>
      );

    default:
      return null;
  }
}

export function formatInlineMarkdown(text: string): React.ReactNode {
  // Handle bold (**text**)
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
