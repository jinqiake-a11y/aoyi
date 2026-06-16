import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SkillMeta } from '../types';
import { Star, Download, ExternalLink, GitFork, Package, ArrowUpRight } from 'lucide-react';

interface SkillCardProps {
  skill: SkillMeta;
  compact?: boolean;
  onSkillClick?: (skill: SkillMeta) => void;
}

const statusLabel: Record<string, string> = {
  not_downloaded: '未下载',
  downloaded: '已下载',
  installing: '安装中',
  installed: '已安装',
  testing: '测试中',
  tested: '已测试',
  error: '错误',
};

const statusColor: Record<string, string> = {
  not_downloaded: '#94a3b8',
  downloaded: '#3b82f6',
  installing: 'var(--color-warning-400)',
  installed: 'var(--color-success-500)',
  testing: '#8b5cf6',
  tested: 'var(--color-neon-400)',
  error: 'var(--color-danger-500)',
};

const isActiveStatus: Record<string, boolean> = {
  not_downloaded: false,
  downloaded: false,
  installing: true,
  installed: false,
  testing: true,
  tested: false,
  error: false,
};

const sourceIcon = {
  github: GitFork,
  npm: Package,
  local: Package,
  url: ExternalLink,
};

/* ── Unique color palette per skill ── */
const SKILL_COLORS: Record<string, { accent: string; gradient: string; glow: string; tagBg: string }> = {
  'langchain-tools': {
    accent: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
    glow: 'rgba(59,130,246,0.25)',
    tagBg: 'rgba(59,130,246,0.08)',
  },
  'autogen-skill': {
    accent: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    glow: 'rgba(139,92,246,0.25)',
    tagBg: 'rgba(139,92,246,0.08)',
  },
  'crew-ai-skill': {
    accent: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    glow: 'rgba(245,158,11,0.25)',
    tagBg: 'rgba(245,158,11,0.08)',
  },
  'semantic-kernel': {
    accent: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
    glow: 'rgba(6,182,212,0.25)',
    tagBg: 'rgba(6,182,212,0.08)',
  },
  'dify-platform': {
    accent: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #818cf8)',
    glow: 'rgba(99,102,241,0.25)',
    tagBg: 'rgba(99,102,241,0.08)',
  },
  'llama-index': {
    accent: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #f97316)',
    glow: 'rgba(239,68,68,0.25)',
    tagBg: 'rgba(239,68,68,0.08)',
  },
  'pdf-parser-skill': {
    accent: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #34d399)',
    glow: 'rgba(16,185,129,0.25)',
    tagBg: 'rgba(16,185,129,0.08)',
  },
  'web-scraper-skill': {
    accent: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #f472b6)',
    glow: 'rgba(236,72,153,0.25)',
    tagBg: 'rgba(236,72,153,0.08)',
  },
};

const DEFAULT_COLOR = {
  accent: '#3b82f6',
  gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)',
  glow: 'rgba(59,130,246,0.25)',
  tagBg: 'rgba(59,130,246,0.08)',
};

function getSkillColor(id: string) {
  return SKILL_COLORS[id] || DEFAULT_COLOR;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCount(count: number): string {
  if (count >= 10000) return `${(count / 1000).toFixed(1)}k`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

export default function SkillCard({ skill, compact, onSkillClick }: SkillCardProps) {
  const navigate = useNavigate();
  const [iconError, setIconError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const SourceIcon = sourceIcon[skill.source] || ExternalLink;
  const color = statusColor[skill.status];
  const active = isActiveStatus[skill.status];
  const palette = getSkillColor(skill.id);

  const handleNavigate = () => {
    if (onSkillClick) {
      onSkillClick(skill);
    } else {
      navigate(`/skill/${encodeURIComponent(skill.id)}`);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleNavigate}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNavigate();
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 20,
        padding: 0,
        cursor: 'pointer',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${hovered ? `rgba(${palette.accent.match(/\w{2}/g)!.map(h => parseInt(h, 16)).join(',')}, 0.2)` : 'var(--border-primary)'}`,
        boxShadow: hovered
          ? `var(--shadow-lg), 0 0 30px rgba(${palette.accent.match(/\w{2}/g)!.map(h => parseInt(h, 16)).join(',')}, 0.08)`
          : 'var(--shadow-card)',
        transform: hovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
        transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        overflow: 'hidden',
      }}
    >
      {/* ── Top accent gradient bar ── */}
      <div
        style={{
          height: compact ? 3 : 4,
          background: palette.gradient,
          opacity: hovered ? 1 : 0.6,
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* ── Inner content ── */}
      <div style={{ padding: compact ? '14px 16px 14px' : '20px 22px 18px' }}>

        {/* ── Header: Icon + Name + Status ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: compact ? 10 : 14 }}>

          {/* Icon with neumorphic ring */}
          <div
            style={{
              position: 'relative',
              flexShrink: 0,
            }}
          >
            {skill.icon && !iconError ? (
              <img
                src={skill.icon}
                alt={skill.name}
                style={{
                  width: compact ? 40 : 50,
                  height: compact ? 40 : 50,
                  borderRadius: compact ? 12 : 14,
                  flexShrink: 0,
                }}
                onError={() => setIconError(true)}
              />
            ) : (
              <div
                style={{
                  width: compact ? 40 : 50,
                  height: compact ? 40 : 50,
                  borderRadius: compact ? 12 : 14,
                  background: palette.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: hovered
                    ? `0 6px 20px ${palette.glow}`
                    : `0 4px 14px ${palette.glow}`,
                  transition: 'box-shadow 0.4s ease',
                }}
              >
                <SourceIcon
                  style={{
                    width: compact ? 18 : 24,
                    height: compact ? 18 : 24,
                    color: 'white',
                    filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.25))',
                  }}
                />
              </div>
            )}
            {/* Neumorphic outer ring */}
            <div
              style={{
                position: 'absolute',
                inset: -4,
                borderRadius: compact ? 16 : 18,
                border: `2px solid ${hovered ? palette.accent + '40' : 'transparent'}`,
                boxShadow: hovered
                  ? `var(--shadow-sm), 0 0 14px ${palette.glow}`
                  : 'var(--shadow-sm)',
                transition: 'all 0.35s ease',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Title block */}
          <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h3
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  fontSize: compact ? 15 : 17,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {skill.name}
              </h3>

              {/* Arrow icon on hover */}
              <ArrowUpRight
                style={{
                  width: 16,
                  height: 16,
                  color: palette.accent,
                  opacity: hovered ? 0.8 : 0,
                  transform: hovered ? 'translate(0, 0)' : 'translate(-4px, 4px)',
                  transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                  flexShrink: 0,
                }}
              />
            </div>

            {/* Author + Version */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: 'var(--text-tertiary)',
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              <span style={{ fontWeight: 500 }}>{skill.author}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  padding: '1px 6px',
                  borderRadius: 4,
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  letterSpacing: '0.02em',
                }}
              >
                v{skill.version}
              </span>

              {/* Status badge with colored glass effect */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  marginLeft: 'auto',
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: `${color}14`,
                  border: `1px solid ${color}22`,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: color,
                    display: 'inline-block',
                    boxShadow: active ? `0 0 8px ${color}` : 'none',
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color,
                    fontFamily: "'Outfit', sans-serif",
                    letterSpacing: '0.03em',
                  }}
                >
                  {statusLabel[skill.status]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Description ── */}
        {!compact && (
          <p
            style={{
              fontSize: 13.5,
              lineHeight: 1.72,
              color: 'var(--text-secondary)',
              marginBottom: 16,
              fontFamily: "'IBM Plex Sans', sans-serif",
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              letterSpacing: '0.005em',
            }}
          >
            {skill.description}
          </p>
        )}

        {/* ── Tags ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: compact ? 10 : 14 }}>
          {skill.tags.slice(0, compact ? 2 : 4).map(tag => (
            <span
              key={tag}
              style={{
                padding: compact ? '3px 8px' : '4px 11px',
                borderRadius: 8,
                fontSize: 11.5,
                fontWeight: 500,
                fontFamily: "'IBM Plex Sans', sans-serif",
                background: hovered ? `rgba(${palette.accent.match(/\w{2}/g)!.map(h => parseInt(h, 16)).join(',')}, 0.08)` : 'var(--bg-tertiary)',
                color: hovered ? 'var(--text-accent)' : 'var(--text-secondary)',
                border: `1px solid ${hovered ? `rgba(${palette.accent.match(/\w{2}/g)!.map(h => parseInt(h, 16)).join(',')}, 0.2)` : 'var(--border-primary)'}`,
                letterSpacing: '0.01em',
                transition: 'all 0.35s ease',
              }}
            >
              {tag}
            </span>
          ))}
          {skill.tags.length > (compact ? 2 : 4) && (
            <span
              style={{
                fontSize: 11,
                padding: '3px 7px',
                color: 'var(--text-tertiary)',
                fontFamily: "'JetBrains Mono', monospace",
                opacity: 0.6,
                alignSelf: 'center',
              }}
            >
              +{skill.tags.length - (compact ? 2 : 4)}
            </span>
          )}
        </div>

        {/* ── Footer: Stats ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: compact ? 10 : 14,
            borderTop: '1px solid var(--border-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

            {/* Star rating */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Star
                style={{
                  width: 14,
                  height: 14,
                  color: '#fbbf24',
                  fill: '#fbbf24',
                  filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.35))',
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                {skill.rating.toFixed(1)}
              </span>
            </div>

            {/* Separator - vertical accent line */}
            <div
              style={{
                width: 1,
                height: 12,
                background: 'rgba(var(--accent-rgb), 0.1)',
                borderRadius: 1,
              }}
            />

            {/* Download count */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                color: 'var(--text-tertiary)',
              }}
            >
              <Download style={{ width: 13, height: 13 }} />
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 500,
                }}
              >
                {formatCount(skill.downloadCount)}
              </span>
            </div>
          </div>

          {/* Updated date */}
          <span
            style={{
              fontSize: 11.5,
              color: 'var(--text-tertiary)',
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            {formatDate(skill.updatedAt)}
          </span>
        </div>
      </div>

      {/* ── Hover overlay: subtle radial gradient ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 30% 0%, rgba(${palette.accent.match(/\w{2}/g)!.map(h => parseInt(h, 16)).join(',')}, 0.04), transparent 60%)`,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
          borderRadius: 20,
        }}
      />
    </div>
  );
}
