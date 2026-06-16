import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSkillStore } from '../store/useSkillStore';
import { DEMO_SKILLS } from '../utils/mockData';
import type { SkillMeta } from '../types';
import {
  Search, Download, FlaskConical, Star,
  Layers, Zap, Code2, Palette, Globe,
  ChevronRight, ExternalLink,
} from 'lucide-react';

/* ════════════════════════════════════════
   中国神兽四象 — 核心操作按钮
   ════════════════════════════════════════ */
const MYTH_BUTTONS = [
  {
    id: 'search',
    name: '青龙',
    title: '搜索发现',
    subtitle: 'Search & Discover',
    element: '木',
    direction: '东',
    color: '#2dd4bf',
    colorDark: '#0d9488',
    bgGradient: 'linear-gradient(135deg, rgba(45,212,191,0.12), rgba(13,148,136,0.06))',
    borderGlow: 'rgba(45,212,191,0.3)',
    pattern: 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M30 5 L35 15 L45 18 L35 21 L30 31 L25 21 L15 18 L25 15 Z" fill="none" stroke="rgba(45,212,191,0.08)" stroke-width="1"/%3E%3C/svg%3E',
    mythDesc: '东方青龙，万物生发。掌搜索之道，洞察天下 Skill。',
    icon: Search,
    navigate: '/',
  },
  {
    id: 'install',
    name: '朱雀',
    title: '下载安装',
    subtitle: 'Download & Install',
    element: '火',
    direction: '南',
    color: '#f87171',
    colorDark: '#dc2626',
    bgGradient: 'linear-gradient(135deg, rgba(248,113,113,0.12), rgba(220,38,38,0.06))',
    borderGlow: 'rgba(248,113,113,0.3)',
    pattern: 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M30 8 L34 22 L48 26 L34 30 L30 44 L26 30 L12 26 L26 22 Z" fill="none" stroke="rgba(248,113,113,0.08)" stroke-width="1"/%3E%3C/svg%3E',
    mythDesc: '南方朱雀，烈焰升腾。掌下载之力，纳 Skill 于掌中。',
    icon: Download,
    navigate: null,
  },
  {
    id: 'test',
    name: '白虎',
    title: '功能测试',
    subtitle: 'Feature Testing',
    element: '金',
    direction: '西',
    color: '#e2e8f0',
    colorDark: '#94a3b8',
    bgGradient: 'linear-gradient(135deg, rgba(226,232,240,0.10), rgba(148,163,184,0.05))',
    borderGlow: 'rgba(226,232,240,0.2)',
    pattern: 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M30 5 L36 18 L50 22 L36 26 L30 39 L24 26 L10 22 L24 18 Z" fill="none" stroke="rgba(226,232,240,0.08)" stroke-width="1"/%3E%3C/svg%3E',
    mythDesc: '西方白虎，锐金断物。掌测试之锋，验 Skill 之真伪。',
    icon: FlaskConical,
    navigate: null,
  },
  {
    id: 'rate',
    name: '玄武',
    title: '评价反馈',
    subtitle: 'Rating & Review',
    element: '水',
    direction: '北',
    color: '#818cf8',
    colorDark: '#6366f1',
    bgGradient: 'linear-gradient(135deg, rgba(129,140,248,0.12), rgba(99,102,241,0.06))',
    borderGlow: 'rgba(129,140,248,0.3)',
    pattern: 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M30 10 L34 24 L48 28 L34 32 L30 46 L26 32 L12 28 L26 24 Z" fill="none" stroke="rgba(129,140,248,0.08)" stroke-width="1"/%3E%3C/svg%3E',
    mythDesc: '北方玄武，厚德载物。掌评价之衡，定 Skill 之高下。',
    icon: Star,
    navigate: null,
  },
];

/* ════════════════════════════════════════
   Skill 数据 → 结构化中文介绍
   ════════════════════════════════════════ */
function structuredChineseIntro(skill: SkillMeta) {
  const statusMap: Record<string, string> = {
    not_downloaded: '未下载', downloaded: '已下载', installing: '安装中',
    installed: '已安装', testing: '测试中', tested: '已测试', error: '错误',
  };
  const sourceMap: Record<string, string> = {
    github: 'GitHub 仓库', npm: 'npm 包', local: '本地', url: '远程链接',
  };
  const tagLabels: Record<string, string> = {
    AI: '人工智能', LLM: '大语言模型', Agent: '智能体', Python: 'Python 语言',
    'Multi-Agent': '多智能体', Microsoft: '微软生态', Automation: '自动化',
    SDK: '开发工具包', 'C#': 'C# 语言', Plugin: '插件系统', Platform: '开发平台',
    RAG: '检索增强生成', 'Low-Code': '低代码', Data: '数据处理', Indexing: '索引构建',
    PDF: '文档解析', OCR: '文字识别', Document: '文档处理', Web: '网页相关',
    Scraping: '数据采集', Orchestration: '任务编排', 'Role-Play': '角色扮演',
    Chain: '链式计算', Vue: '前端框架',
  };

  const intro = {
    name: skill.name,
    chineseTags: skill.tags.map(t => tagLabels[t] || t),
    category: skill.tags.includes('AI') || skill.tags.includes('LLM') ? 'AI 智能' :
              skill.tags.includes('Data') || skill.tags.includes('PDF') ? '数据处理' :
              skill.tags.includes('Web') || skill.tags.includes('Scraping') ? '网络工具' : '开发工具',
    source: sourceMap[skill.source] || '未知来源',
    status: statusMap[skill.status] || '未知状态',
    ratingLevel: skill.rating >= 4.5 ? '极优' : skill.rating >= 4.0 ? '优秀' : skill.rating >= 3.5 ? '良好' : '一般',
  };
  return intro;
}

/* ════════════════════════════════════════
   神话按钮组件
   ════════════════════════════════════════ */
function MythButton({ btn, index }: { btn: typeof MYTH_BUTTONS[0]; index: number }) {
  const navigate = useNavigate();
  const Icon = btn.icon;
  const [toastVisible, setToastVisible] = useState(false);

  const handleClick = () => {
    if (btn.navigate) {
      navigate(btn.navigate);
    } else {
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    }
  };

  return (
    <div
      className="myth-btn-wrapper"
      style={{
        animation: `slideUp 0.5s ease ${0.1 + index * 0.08}s both`,
        position: 'relative',
      }}
    >
      <button
        onClick={handleClick}
        className="myth-btn group relative"
        style={{
          width: '100%',
          padding: 0,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'transform 0.15s ease',
        }}
        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
        onMouseUp={e => { e.currentTarget.style.transform = ''; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
        onFocus={e => {
          if (e.currentTarget.matches(':focus-visible')) {
            e.currentTarget.style.outline = `2px solid ${btn.color}`;
            e.currentTarget.style.outlineOffset = '3px';
            e.currentTarget.style.borderRadius = '20px';
          }
        }}
        onBlur={e => {
          e.currentTarget.style.outline = '';
          e.currentTarget.style.outlineOffset = '';
        }}
        aria-label={`${btn.name}: ${btn.title} — ${btn.mythDesc}`}
      >
        {/* Outer ring with pattern */}
        <div
          style={{
            position: 'relative',
            borderRadius: 20,
            padding: 2,
            background: `linear-gradient(135deg, ${btn.color}, ${btn.colorDark})`,
            boxShadow: `0 4px 24px ${btn.borderGlow}`,
            transition: 'box-shadow 0.4s ease, transform 0.4s ease',
          }}
          className="group-hover:scale-105"
          onMouseEnter={e => {
            const el = e.currentTarget;
            el.style.boxShadow = `0 8px 40px ${btn.borderGlow}, 0 0 60px ${btn.borderGlow}`;
          }}
          onMouseLeave={e => {
            const el = e.currentTarget;
            el.style.boxShadow = `0 4px 24px ${btn.borderGlow}`;
          }}
        >
          {/* Inner content */}
          <div
            style={{
              borderRadius: 18,
              padding: '24px 16px',
              background: btn.bgGradient,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.06)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Pattern overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.4,
                backgroundImage: `url("${btn.pattern}")`,
                backgroundRepeat: 'repeat',
              }}
            />

            {/* Element badge */}
            <div
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                padding: '2px 10px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                background: `${btn.color}22`,
                border: `1px solid ${btn.color}33`,
                color: btn.color,
                letterSpacing: '0.08em',
              }}
            >
              {btn.element}
            </div>

            {/* Direction indicator */}
            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              {/* Icon */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  margin: '0 auto 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${btn.color}22, ${btn.color}11)`,
                  border: `2px solid ${btn.color}44`,
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                }}
                className="group-hover:border-current"
              >
                <Icon
                  style={{
                    width: 24,
                    height: 24,
                    color: btn.color,
                    filter: `drop-shadow(0 0 8px ${btn.borderGlow})`,
                  }}
                />
              </div>

              {/* Myth name (large) */}
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  color: btn.color,
                  fontFamily: "'Noto Sans SC', sans-serif",
                  textShadow: `0 0 20px ${btn.borderGlow}`,
                  marginBottom: 2,
                }}
              >
                {btn.name}
              </div>

              {/* Operation title */}
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: 2,
                  letterSpacing: '0.02em',
                }}
              >
                {btn.title}
              </div>

              {/* English subtitle */}
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-tertiary)',
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.04em',
                  marginBottom: 10,
                }}
              >
                {btn.subtitle}
              </div>

              {/* Direction + Element badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 12px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  background: `${btn.color}15`,
                  border: `1px solid ${btn.color}22`,
                  color: btn.color,
                }}
              >
                <span>方向 {btn.direction}</span>
                <span style={{ opacity: 0.3 }}>|</span>
                <span>五行 {btn.element}</span>
              </div>

              {/* Myth description */}
              <p
                style={{
                  marginTop: 12,
                  fontSize: 12.5,
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  fontStyle: 'italic',
                }}
              >
                {btn.mythDesc}
              </p>
            </div>
          </div>
        </div>
      </button>

      {/* Toast for unimplemented actions */}
      {toastVisible && (
        <div style={{
          position: 'absolute',
          bottom: -6,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '5px 14px',
          borderRadius: 999,
          fontSize: 11.5,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          zIndex: 10,
          animation: 'slideUp 0.3s ease',
          background: 'rgba(251,191,36,0.15)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(251,191,36,0.3)',
          color: '#fbbf24',
        }}>
          🚧 {btn.title} — 功能开发中
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   Skill 知识卡 — 结构化中文展示
   ════════════════════════════════════════ */
function SkillKnowledgeCard({ skill, index }: { skill: SkillMeta; index: number }) {
  const intro = structuredChineseIntro(skill);
  const navigate = useNavigate();

  return (
    <div
      className="skill-knowledge-card"
      style={{
        animation: `slideUp 0.5s ease ${0.15 + index * 0.06}s both`,
        borderRadius: 20,
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, border-color 0.3s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
      onClick={() => navigate(`/skill/${encodeURIComponent(skill.id)}`)}
    >
      {/* Top accent bar */}
      <div style={{ height: 4, background: `linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)`, opacity: 0.7 }} />

      <div style={{ padding: '24px 28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
          {/* Icon */}
          <div
            style={{
              width: 56, height: 56, borderRadius: 16,
              background: `linear-gradient(135deg, #3b82f622, #8b5cf611)`,
              border: '1px solid rgba(59,130,246,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              fontSize: 24,
            }}
          >
            <Code2 style={{ width: 26, height: 26, color: 'var(--text-accent)' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {skill.name}
              </h3>
              <span style={{
                padding: '2px 10px', borderRadius: 6,
                fontSize: 11, fontWeight: 600,
                fontFamily: "'JetBrains Mono', monospace",
                background: `${intro.ratingLevel === '极优' ? 'rgba(251,191,36,0.15)' : 'var(--bg-tertiary)'}`,
                border: `1px solid ${intro.ratingLevel === '极优' ? 'rgba(251,191,36,0.25)' : 'var(--border)'}`,
                color: intro.ratingLevel === '极优' ? '#fbbf24' : 'var(--text-tertiary)',
              }}>
                {intro.ratingLevel}
              </span>
            </div>

            {/* Meta row */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12.5, color: 'var(--text-tertiary)' }}>
              <span>👤 {skill.author}</span>
              <span>📦 v{skill.version}</span>
              <span>🔗 {intro.source}</span>
              <span>📊 {intro.category}</span>
            </div>
          </div>
        </div>

        {/* Chinese description */}
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: 'rgba(59,130,246,0.04)',
            border: '1px solid rgba(59,130,246,0.08)',
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            {skill.longDescription
              .replace(/^# .+\n\n/, '')
              .replace(/## /g, '')
              .replace(/\*\*/g, '')
              .replace(/\n- /g, '\n')
              .split('\n')
              .filter(l => l.trim())
              .slice(0, 6)
              .join('。')
            }
          </p>
        </div>

        {/* Tags in Chinese */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {intro.chineseTags.map(tag => (
            <span key={tag} style={{
              padding: '4px 14px', borderRadius: 999,
              fontSize: 12, fontWeight: 500,
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Features snippet */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {skill.features.slice(0, 3).map(f => (
            <div key={f.name} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', borderRadius: 10,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{f.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>{f.description}</div>
              </div>
            </div>
          ))}
          {skill.features.length > 3 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              fontSize: 12, color: 'var(--text-tertiary)',
              padding: '8px 12px', borderRadius: 10,
              border: '1px dashed var(--border)',
            }}>
              +{skill.features.length - 3} 项更多特性 <ChevronRight style={{ width: 14, height: 14 }} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 16, paddingTop: 14,
          borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: 20, fontSize: 12.5, color: 'var(--text-tertiary)' }}>
            <span>⭐ {skill.rating.toFixed(1)} 分</span>
            <span>📥 {(skill.downloadCount / 1000).toFixed(1)}k 下载</span>
            <span>📅 {new Date(skill.updatedAt).toLocaleDateString('zh-CN')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: 'var(--text-accent)' }}>
            查看详情 <ExternalLink style={{ width: 13, height: 13 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   主页面
   ════════════════════════════════════════ */
export default function About() {
  const { searchResults } = useSkillStore();
  const navigate = useNavigate();

  // Use search results if available, otherwise demo skills
  const displaySkills = searchResults.length > 0 ? searchResults : DEMO_SKILLS;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 0 48px' }}>
      {/* ════════ Hero Section ════════ */}
      <section
        className="animate-fade-in"
        style={{
          textAlign: 'center',
          padding: '40px 0 36px',
          position: 'relative',
        }}
      >
        {/* Decorative top line */}
        <div
          style={{
            width: 120,
            height: 2,
            margin: '0 auto 24px',
            background: 'linear-gradient(90deg, transparent, #3b82f6, #8b5cf6, #06b6d4, transparent)',
            borderRadius: 2,
          }}
        />

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 16px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.2)',
            color: '#60a5fa',
            marginBottom: 16,
          }}
        >
          <Zap style={{ width: 14, height: 14 }} />
          火眼金睛系列 · 产品白皮书
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 30%, #a78bfa 70%, #60a5fa 100%)',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 12,
          }}
        >
          火眼金睛 Skill
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto 8px', lineHeight: 1.7 }}>
          AI 技能搜索、下载安装、环境测试与评价的一站式管理平台
        </p>
        <p style={{ fontSize: 13.5, color: 'var(--text-tertiary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
          面向 AI 开发者的 Skill 管理与测试平台，为 LLM 生态工具提供从搜索发现到评价反馈的完整闭环体验
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginTop: 28 }}>
          {[
            { num: '8', label: '内置 Demo' },
            { num: '5', label: '页面路由' },
            { num: '6', label: '生命周期状态' },
            { num: '18', label: 'E2E 测试用例' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 28, fontWeight: 900,
                background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {s.num}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          四大神兽 — 中国神话风格核心操作按钮
           ════════════════════════════════════════ */}
      <section style={{ margin: '40px 0 48px' }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            background: 'linear-gradient(135deg, rgba(45,212,191,0.12), rgba(129,140,248,0.08))',
            border: '1px solid rgba(129,140,248,0.2)',
            color: '#818cf8',
            marginBottom: 10,
          }}>
            四 象 神 兽
          </div>
          <h2 style={{
            fontSize: 22, fontWeight: 700, color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}>
            核心操作 · <span style={{ background: 'linear-gradient(135deg, #2dd4bf, #f87171, #e2e8f0, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>四灵护法</span>
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 6 }}>
            东方青龙 · 南方朱雀 · 西方白虎 · 北方玄武 — 四象护持，神通具足
          </p>
        </div>

        {/* Four myth buttons grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
        }}>
          {MYTH_BUTTONS.map((btn, i) => (
            <MythButton key={btn.id} btn={btn} index={i} />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          Skill 知识库 — 结构化中文介绍
           ════════════════════════════════════════ */}
      <section style={{ margin: '40px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.08))',
            border: '1px solid rgba(59,130,246,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Layers style={{ width: 18, height: 18, color: 'var(--text-accent)' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Skill 知识库
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 2 }}>
              共 {displaySkills.length} 个 Skill · 点击卡片查看详情
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {displaySkills.map((skill, i) => (
            <SkillKnowledgeCard key={skill.id} skill={skill} index={i} />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
           技术栈概览
           ════════════════════════════════════════ */}
      <section style={{ margin: '40px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(59,130,246,0.08))',
            border: '1px solid rgba(6,182,212,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Palette style={{ width: 18, height: 18, color: '#06b6d4' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              技术栈全景
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 2 }}>六大核心技术驱动</p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: 16,
        }}>
          {[
            { icon: '⚛️', name: 'React 19 + TypeScript 6', desc: '最新并发特性与严格类型系统，确保代码质量与开发体验' },
            { icon: '⚡', name: 'Vite 8 + Rolldown', desc: '极速构建与原生打包，开发 HMR < 50ms，生产构建 < 1s' },
            { icon: '🎨', name: 'Tailwind CSS v4', desc: 'CSS 自定义属性 + 工具类优先方案，玻璃拟态与霓虹设计系统' },
            { icon: '🌀', name: 'Three.js + Zustand', desc: '沉浸式 3D 粒子背景与轻量状态管理，零样板代码' },
            { icon: '🗺️', name: 'React Router v7', desc: '嵌套路由 + Layout 布局模式，声明式导航与代码分割' },
            { icon: '🔍', name: 'Playwright E2E', desc: '18 个自动化测试用例覆盖全用户流程，通过率 100%' },
          ].map(t => (
            <div key={t.name} style={{
              padding: 20, borderRadius: 16,
              background: 'var(--bg-card)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border)',
              display: 'flex', gap: 14, alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{t.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          页面导航
           ════════════════════════════════════════ */}
      <section style={{ margin: '40px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.08))',
            border: '1px solid rgba(139,92,246,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Globe style={{ width: 18, height: 18, color: '#a78bfa' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              路由地图
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 2 }}>四大核心页面 + 404 兜底</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { path: '/', name: '首页', desc: 'Skill 搜索发现 — 搜索、分类筛选、卡片网格展示', icon: '🏠' },
            { path: '/skill/:id', name: '详情页', desc: '技能详情与全生命周期 — 概览 → 安装 → 环境 → 测试 → 评价', icon: '📋' },
            { path: '/library', name: 'Skill 库', desc: '技能管理中心 — 标签筛选、排序、视图切换', icon: '📚' },
            { path: '/settings', name: '设置', desc: '全局配置 — 外观主题、存储管理、网络设置', icon: '⚙️' },
          ].map(r => (
            <div key={r.path} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '14px 20px', borderRadius: 14,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
              onClick={() => r.path !== '/skill/:id' && navigate(r.path)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <span style={{ fontSize: 24 }}>{r.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {r.name} <code style={{ fontSize: 12, color: '#67e8f9', fontFamily: "'JetBrains Mono', monospace" }}>{r.path}</code>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 2 }}>{r.desc}</div>
              </div>
              <ChevronRight style={{ width: 16, height: 16, color: 'var(--text-tertiary)' }} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
