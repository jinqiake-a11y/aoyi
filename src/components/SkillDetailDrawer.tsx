import { useState, useEffect, useRef } from 'react';
import type { SkillMeta } from '../types';
import { fetchGitHubRepo } from '../utils/github';
import {
  Star, Calendar, User, GitFork,
  ExternalLink, X, Package,
  Clock, ArrowUpRight, Beaker,
} from 'lucide-react';
import { generateChineseContent, getPopularityLevel, formatCount, TAG_EXPLANATIONS } from '../utils/skill-content';
import { renderContentLine } from './SkillContentRenderer';
import SkillTestView from './SkillTestView';

interface SkillDetailDrawerProps {
  skill: SkillMeta | null;
  open: boolean;
  onClose: () => void;
}

/* ═══════════════════════════════════════════════════
   Main Drawer Component
   ═══════════════════════════════════════════════════ */
export default function SkillDetailDrawer({ skill, open, onClose }: SkillDetailDrawerProps) {
  const [detailedSkill, setDetailedSkill] = useState<SkillMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch detailed info when a skill is selected
  useEffect(() => {
    if (!skill || !open) return;
    setLoading(true);
    setReadmeContent(null);
    setDetailedSkill(null);

    (async () => {
      try {
        const full = await fetchGitHubRepo(skill.id);
        if (full) {
          setDetailedSkill(full);
          if (full.readme) setReadmeContent(full.readme);
        } else {
          setDetailedSkill(skill);
        }
      } catch {
        setDetailedSkill(skill);
      } finally {
        setLoading(false);
      }
    })();

    // Scroll to top when opening
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [skill?.id, open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const current = detailedSkill || skill;
  if (!current) return null;

  const sections = generateChineseContent(current, readmeContent || undefined);
  const accentColor = 'var(--text-accent)';
  const popLevel = getPopularityLevel(current.downloadCount);

  return (
    <>
      {/* ── Overlay ── */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 998,
            animation: 'fadeIn 0.25s ease',
          }}
        />
      )}

      {/* ── Centered Modal ── */}
      <div
        ref={drawerRef}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          width: 'min(760px, 92vw)',
          maxWidth: '100vw',
          maxHeight: 'min(85vh, 800px)',
          background: 'var(--bg-card-solid)',
          border: '1px solid var(--border-glow)',
          boxShadow: 'var(--shadow-lg), 0 0 60px rgba(var(--accent-rgb), 0.08)',
          borderRadius: 20,
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.92)',
          opacity: open ? 1 : 0,
          transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease',
          overflow: 'hidden',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {/* ═══ Fixed Header ═══ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-primary)',
            flexShrink: 0,
            background: 'var(--bg-glass-strong)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: popLevel.color,
                boxShadow: `0 0 12px ${popLevel.color}`,
              }}
            />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '0.01em',
              }}
            >
              Skill 详情
            </span>
            {loading && (
              <div className="shimmer" style={{ width: 60, height: 14, borderRadius: 4 }} />
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: '1px solid var(--border-primary)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.1)';
              e.currentTarget.style.color = 'var(--text-accent)';
              e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb), 0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--bg-secondary)';
              e.currentTarget.style.color = 'var(--text-tertiary)';
              e.currentTarget.style.borderColor = 'var(--border-primary)';
            }}
          >
            <X style={{ width: 17, height: 17 }} />
          </button>
        </div>

        {/* ═══ Scrollable Content ═══ */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px 32px',
          }}
        >
          {/* ── Skill Header Card ── */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginBottom: 20,
              padding: 16,
              borderRadius: 16,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #d4a574, #c49564)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 0 24px rgba(var(--accent-rgb),0.2)',
              }}
            >
              {current.icon ? (
                <img src={current.icon} alt="" style={{ width: 56, height: 56, borderRadius: 14 }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <Package style={{ width: 26, height: 26, color: 'var(--text-accent)' }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 4,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                wordBreak: 'break-word',
              }}>
                {current.name}
              </h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                color: '#8a7e74',
                flexWrap: 'wrap',
              }}>
                <User style={{ width: 13, height: 13 }} />
                <span>{current.author}</span>
                <span style={{ opacity: 0.3 }}>|</span>
                <GitFork style={{ width: 13, height: 13 }} />
                <span style={{ textTransform: 'capitalize' }}>{current.source}</span>
                <span style={{ opacity: 0.3 }}>|</span>
                <span style={{
                  padding: '1px 6px',
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 600,
                  background: `${popLevel.color}18`,
                  color: popLevel.color,
                  border: `1px solid ${popLevel.color}30`,
                }}>
                  {popLevel.label}
                </span>
              </div>
            </div>
          </div>

          {/* ── Popularity Bar ── */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            }}>
              <span style={{ fontSize: 11, color: '#6b5f55', fontWeight: 500 }}>社区热度</span>
              <span style={{ fontSize: 11, color: popLevel.color, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                {popLevel.pct}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: 4,
              borderRadius: 4,
              background: 'rgba(42,34,32,0.6)',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${popLevel.pct}%`,
                height: '100%',
                borderRadius: 4,
                background: `linear-gradient(90deg, ${popLevel.color}88, ${popLevel.color})`,
                transition: 'width 0.8s ease',
              }} />
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
            marginBottom: 24,
          }}>
            {[
              { icon: Star, label: 'Star', value: formatCount(current.downloadCount), color: '#fbbf24' },
              { icon: GitFork, label: 'Fork', value: formatCount(Math.floor(current.downloadCount * 0.12)), color: '#5ec4d4' },
              { icon: Calendar, label: '创建', value: new Date(current.createdAt).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }), color: '#a78bfa' },
              { icon: Clock, label: '更新', value: new Date(current.updatedAt).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }), color: '#4ade80' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} style={{
                  padding: '10px 8px',
                  borderRadius: 10,
                  background: 'rgba(42,34,32,0.35)',
                  border: '1px solid rgba(var(--accent-rgb),0.06)',
                  textAlign: 'center',
                }}>
                  <Icon style={{ width: 15, height: 15, color: stat.color, marginBottom: 4, display: 'inline-block' }} />
                  <div style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: '-0.02em',
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 10, color: '#6b5f55', marginTop: 1, fontWeight: 500 }}>
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Tags ── */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            marginBottom: 24,
          }}>
            {current.tags.slice(0, 12).map((tag, i) => {
              const colors = [
                { bg: 'rgba(var(--accent-rgb),0.1)', text: '#d4a574', border: 'rgba(var(--accent-rgb),0.2)' },
                { bg: 'rgba(94,196,212,0.1)', text: '#5ec4d4', border: 'rgba(94,196,212,0.2)' },
                { bg: 'rgba(74,222,128,0.1)', text: '#4ade80', border: 'rgba(74,222,128,0.2)' },
                { bg: 'rgba(248,113,113,0.1)', text: '#f87171', border: 'rgba(248,113,113,0.2)' },
                { bg: 'rgba(167,139,250,0.1)', text: '#a78bfa', border: 'rgba(167,139,250,0.2)' },
              ];
              const c = colors[i % colors.length];
              return (
                <span key={tag} style={{
                  padding: '3px 10px',
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                  background: c.bg,
                  color: c.text,
                  border: `1px solid ${c.border}`,
                  letterSpacing: '0.01em',
                  transition: 'all 0.15s ease',
                  cursor: 'default',
                }}
                  title={TAG_EXPLANATIONS[tag.toLowerCase()] || tag}>
                  {tag}
                </span>
              );
            })}
            {current.tags.length > 12 && (
              <span style={{ fontSize: 11, padding: '3px 7px', color: '#6b5f55', fontFamily: "'JetBrains Mono', monospace" }}>
                +{current.tags.length - 12}
              </span>
            )}
          </div>

          {/* ── Loading State ── */}
          {loading ? (
            <div>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ marginBottom: 20 }}>
                  <div className="shimmer" style={{ height: 16, width: '30%', borderRadius: 4, marginBottom: 12 }} />
                  <div className="shimmer" style={{ height: 12, width: '100%', borderRadius: 4, marginBottom: 6 }} />
                  <div className="shimmer" style={{ height: 12, width: '85%', borderRadius: 4, marginBottom: 6 }} />
                  <div className="shimmer" style={{ height: 12, width: '60%', borderRadius: 4 }} />
                </div>
              ))}
            </div>
          ) : testMode ? (
            /* ════ Test View ════ */
            <SkillTestView
              skill={current}
              onBack={() => setTestMode(false)}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {sections.map((section, idx) => (
                <div key={idx}
                  className="animate-fade-in"
                  style={{ animationDelay: `${idx * 60}ms` }}>
                  {/* Section title */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 10,
                    paddingBottom: 8,
                    borderBottom: '1px solid rgba(var(--accent-rgb),0.08)',
                  }}>
                    {section.icon && (
                      <span style={{ color: accentColor, opacity: 0.8 }}>
                        {section.icon}
                      </span>
                    )}
                    <h3 style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      letterSpacing: '0.02em',
                    }}>
                      {section.title}
                    </h3>
                    <div style={{ flex: 1 }} />
                    <div style={{
                      width: 3,
                      height: 3,
                      borderRadius: '50%',
                      background: accentColor,
                      opacity: 0.4,
                    }} />
                  </div>

                  {/* Section content */}
                  <div style={{
                    fontFamily: "'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif",
                  }}>
                    {section.content.map((line, li) => renderContentLine(line, li, accentColor))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═══ Fixed Footer with Actions ═══ */}
        <div style={{
          display: 'flex',
          gap: 8,
          padding: '12px 20px',
          borderTop: '1px solid rgba(var(--accent-rgb),0.1)',
          background: 'rgba(26,20,18,0.9)',
          backdropFilter: 'blur(16px)',
          flexShrink: 0,
        }}>
          <a href={current.sourceUrl}
            target="_blank" rel="noopener noreferrer"
            className="capsule-btn"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              textDecoration: 'none',
              fontSize: 13,
              cursor: 'pointer',
              height: 38,
              padding: '0 12px',
            }}>
            <ExternalLink style={{ width: 14, height: 14 }} />
            源码
          </a>
          <button
            onClick={() => {
              setTestMode(!testMode);
              if (scrollRef.current) scrollRef.current.scrollTop = 0;
            }}
            className="capsule-btn-primary"
            style={{
              flex: 1.2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontSize: 13,
              cursor: 'pointer',
              height: 38,
              padding: '0 12px',
              background: testMode
                ? 'linear-gradient(135deg, #5ec4d4, #4ab0c0)'
                : 'linear-gradient(135deg, #d4a574, #c49564)',
              boxShadow: testMode
                ? '0 0 24px rgba(94,196,212,0.3), 4px 4px 10px #14100e'
                : '0 0 24px rgba(var(--accent-rgb),0.3), 4px 4px 10px #14100e',
            }}>
            <Beaker style={{ width: 15, height: 15 }} />
            {testMode ? '详情' : '功能测试'}
          </button>
          <button className="capsule-btn" style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: 13,
            cursor: 'pointer',
            height: 38,
            padding: '0 12px',
          }} onClick={onClose}>
            <ArrowUpRight style={{ width: 14, height: 14 }} />
            安装
          </button>
        </div>
      </div>
    </>
  );
}
