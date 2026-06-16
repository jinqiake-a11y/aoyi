import { useState, useEffect, useCallback } from 'react';
import SearchBar from '../components/SearchBar';
import SkillCard from '../components/SkillCard';
import SkillDetailDrawer from '../components/SkillDetailDrawer';
import { useSkillStore } from '../store/useSkillStore';
import { searchGitHubSkills, fetchGitHubRepo, parseGitHubUrl, searchNpmSkills } from '../utils/github';
import { fetchMostStarred, fetchTrending } from '../utils/hotRecommendations';
import { DEMO_SKILLS } from '../utils/mockData';
import type { SkillMeta } from '../types';
import { Sparkles, TrendingUp, Clock, Search as SearchIcon, Layers, Star, Flame, ChevronRight } from 'lucide-react';

export default function Home() {
  const {
    searchResults, searchLoading,
    setSearchLoading, setSearchResults, addSkill,
  } = useSkillStore();

  const [activeCategory, setActiveCategory] = useState<'all' | 'ai' | 'tools' | 'data' | 'web'>('all');

  // ── Hot recommendations state ──
  const [hotResults, setHotResults] = useState<SkillMeta[]>([]);
  const [trendingResults, setTrendingResults] = useState<SkillMeta[]>([]);
  const [hotLoading, setHotLoading] = useState(true);
  const [isHotView, setIsHotView] = useState(true);

  // ── Detail drawer state ──
  const [selectedSkill, setSelectedSkill] = useState<SkillMeta | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSkillClick = useCallback((skill: SkillMeta) => {
    setSelectedSkill(skill);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    // Keep the skill data for exit animation, then clear
    setTimeout(() => setSelectedSkill(null), 350);
  }, []);

  // Fetch hot recommendations on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setHotLoading(true);
      const [hot, trending] = await Promise.all([
        fetchMostStarred(),
        fetchTrending(),
      ]);
      if (!cancelled) {
        setHotResults(hot.length > 0 ? hot : DEMO_SKILLS);
        setTrendingResults(trending.length > 0 ? trending : DEMO_SKILLS.slice(0, 8));
        setHotLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // On first mount, show hot view
  useEffect(() => {
    setIsHotView(true);
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setIsHotView(true);
      return;
    }

    setIsHotView(false);
    setSearchLoading(true);
    try {
      const [githubResults, npmResults] = await Promise.all([
        searchGitHubSkills(query),
        searchNpmSkills(query),
      ]);

      const combined = [...githubResults, ...npmResults];
      if (combined.length > 0) {
        setSearchResults(combined);
        combined.forEach(s => addSkill(s));
      } else {
        const filtered = DEMO_SKILLS.filter(s =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.description.toLowerCase().includes(query.toLowerCase()) ||
          s.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
        );
        setSearchResults(filtered.length > 0 ? filtered : DEMO_SKILLS);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults(DEMO_SKILLS);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleShowHot = () => {
    setIsHotView(true);
  };

  const handleUrlSubmit = async (url: string) => {
    setIsHotView(false);
    setSearchLoading(true);
    try {
      const repoName = parseGitHubUrl(url);
      if (repoName) {
        const skill = await fetchGitHubRepo(repoName);
        if (skill) {
          setSearchResults([skill]);
          addSkill(skill);
          return;
        }
      }
      await handleSearch(url);
    } catch (err) {
      console.error('URL import failed:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const categories = [
    { id: 'all' as const, label: '全部', icon: Layers },
    { id: 'ai' as const, label: 'AI / LLM', icon: Sparkles },
    { id: 'tools' as const, label: '开发工具', icon: SearchIcon },
    { id: 'data' as const, label: '数据工具', icon: TrendingUp },
    { id: 'web' as const, label: 'Web 工具', icon: Clock },
  ];

  const filteredResults = searchResults.filter(skill => {
    if (activeCategory === 'all') return true;
    const tagMap: Record<string, string[]> = {
      ai: ['AI', 'LLM', 'Agent', 'Multi-Agent', 'RAG', 'SDK'],
      tools: ['Python', 'C#', 'Automation', 'Plugin', 'Orchestration'],
      data: ['Data', 'Indexing', 'PDF', 'OCR'],
      web: ['Web', 'Scraping', 'Platform'],
    };
    return skill.tags.some(t => tagMap[activeCategory]?.includes(t));
  });

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {/* ── Content wrapper — all centered ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
        }}
      >

        {/* ═══════════ Hero Section ═══════════ */}
        <section
          className="animate-fade-in"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            paddingTop: 24,
            paddingBottom: 8,
            width: '100%',
          }}
        >
          <h1
            style={{
              fontFamily: "'Orbitron', 'Outfit', sans-serif",
              fontSize: 'clamp(3.2rem, 6vw, 5rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: 24,
              maxWidth: 800,
              background: 'linear-gradient(135deg, #d4a574 0%, #e8c4a0 25%, #5ec4d4 65%, #d4a574 100%)',
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradientShift 6s ease-in-out infinite',
              transform: 'perspective(800px) rotateX(2deg) rotateY(-1deg)',
              textShadow: '0 0 40px rgba(212,165,116,0.3), 0 0 80px rgba(212,165,116,0.15), 0 4px 20px rgba(94,196,212,0.15)',
              filter: 'drop-shadow(0 4px 30px rgba(212,165,116,0.2))',
            }}
          >
            火眼金睛 Skill
          </h1>

          <p
            style={{
              maxWidth: 540,
              fontSize: '1.1rem',
              lineHeight: 1.75,
              color: 'var(--text-secondary)',
              fontWeight: 400,
              margin: '0 auto',
            }}
          >
            搜索、下载、安装和测试各类 AI Skill
          </p>
          <p
            style={{
              maxWidth: 540,
              fontSize: '0.88rem',
              lineHeight: 1.6,
              color: 'var(--text-tertiary)',
              marginTop: 6,
            }}
          >
            支持 GitHub &amp; npm 一键导入 &middot; SKILL.md 通用格式
          </p>

          <div
            style={{
              width: 120,
              height: 2,
              marginTop: 28,
              marginBottom: 20,
              background: 'linear-gradient(90deg, transparent, #d4a574, #5ec4d4, transparent)',
              borderRadius: 2,
            }}
          />

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            {['✨ GitHub', '📦 npm', '🔗 SKILL.md', '🚀 一键导入'].map((tag, i) => (
              <span
                key={tag}
                className="cyber-tag float-anim"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* ═══════════ Search Bar ═══════════ */}
        <section
          className="animate-slide-up w-full"
          style={{ maxWidth: 880, display: 'flex', justifyContent: 'center' }}
        >
          <div className="w-full" style={{ padding: '0 20px' }}>
            <SearchBar
              onSearch={handleSearch}
              onUrlSubmit={handleUrlSubmit}
              onShowHot={handleShowHot}
              loading={searchLoading}
            />
          </div>
        </section>

        {/* ═══════════ Category Filter Pills ═══════════ */}
        {!isHotView && (
          <section
            className="animate-slide-up"
            style={{
              animationDelay: '80ms',
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              maxWidth: 880,
            }}
          >
            <div
              className="rounded-2xl p-1.5"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: 'linear-gradient(145deg, rgba(26,20,18,0.8), rgba(42,34,32,0.6))',
                border: '1px solid rgba(212,165,116,0.15)',
                boxShadow: '3px 3px 8px rgba(20,16,14,0.4), -2px -2px 6px rgba(46,38,34,0.2)',
              }}
            >
              {categories.map((cat, idx) => {
                const Icon = cat.icon;
                const active = activeCategory === cat.id;
                const activeGradients = [
                  'linear-gradient(135deg, #d4a574, #c49564)',
                  'linear-gradient(135deg, #5ec4d4, #4ab0c0)',
                  'linear-gradient(135deg, #d4a574, #b8956a)',
                  'linear-gradient(135deg, #7ed0dd, #5ec4d4)',
                  'linear-gradient(135deg, #e8c4a0, #d4a574)',
                ];
                const activeGlows = [
                  'rgba(212,165,116,0.4)',
                  'rgba(94,196,212,0.4)',
                  'rgba(212,165,116,0.35)',
                  'rgba(94,196,212,0.35)',
                  'rgba(212,165,116,0.35)',
                ];
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-base font-bold whitespace-nowrap transition-all duration-300"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      background: active ? activeGradients[idx] : 'transparent',
                      color: active ? '#1a1412' : 'rgba(139,126,116,0.6)',
                      border: active
                        ? '1px solid rgba(212,165,116,0.2)'
                        : '1px solid transparent',
                      boxShadow: active
                        ? `0 0 24px ${activeGlows[idx]}, 3px 3px 8px rgba(20,16,14,0.3)`
                        : 'none',
                      transform: active ? 'scale(1.05)' : 'scale(1)',
                      letterSpacing: '0.02em',
                      fontWeight: 600,
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        const el = e.currentTarget as HTMLButtonElement;
                        el.style.background = 'rgba(212,165,116,0.08)';
                        el.style.color = 'rgba(232,224,216,0.85)';
                        el.style.borderColor = 'rgba(212,165,116,0.2)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        const el = e.currentTarget as HTMLButtonElement;
                        el.style.background = 'transparent';
                        el.style.color = 'rgba(139,126,116,0.6)';
                        el.style.borderColor = 'transparent';
                      }
                    }}
                  >
                    <Icon style={{
                      width: 18,
                      height: 18,
                      filter: active ? 'drop-shadow(0 0 4px rgba(26,20,18,0.3))' : 'none',
                    }} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ═══════════ Hot / Trending Section ═══════════ */}
        {isHotView ? (
          <section style={{ width: '100%', maxWidth: 1200, paddingTop: 4 }}>
            {hotLoading ? (
              <div style={{ display: 'flex', gap: 32, width: '100%' }}>
                {[0, 1].map(col => (
                  <div key={col} style={{ flex: 1 }}>
                    {/* Header skeleton */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                      <div className="shimmer" style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div className="shimmer" style={{ height: 14, width: '55%', borderRadius: 6, marginBottom: 6 }} />
                        <div className="shimmer" style={{ height: 10, width: '40%', borderRadius: 4 }} />
                      </div>
                    </div>
                    {/* List item skeletons */}
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 16px',
                          marginBottom: 8,
                          borderRadius: 12,
                          background: 'rgba(42,34,32,0.2)',
                        }}
                      >
                        {/* Rank badge */}
                        <div className="shimmer" style={{ width: 26, height: 26, borderRadius: 6, flexShrink: 0 }} />
                        {/* Name + description */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <div className="shimmer" style={{ height: 14, width: '50%', borderRadius: 4 }} />
                            <div className="shimmer" style={{ height: 14, width: 32, borderRadius: 3 }} />
                          </div>
                          <div className="shimmer" style={{ height: 10, width: '75%', borderRadius: 3 }} />
                        </div>
                        {/* Stars */}
                        <div className="shimmer" style={{ width: 48, height: 14, borderRadius: 4, flexShrink: 0 }} />
                        {/* Chevron */}
                        <div className="shimmer" style={{ width: 14, height: 14, borderRadius: 4, flexShrink: 0 }} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 32, width: '100%' }}>
                {/* ── Left Column: Most Starred ── */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    className="animate-fade-in"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 18,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        background: 'linear-gradient(135deg, #d4a574, #c49564)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Star style={{ width: 17, height: 17, color: '#1a1412', fill: '#1a1412' }} />
                    </div>
                    <div>
                      <h2
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '1rem',
                          fontWeight: 600,
                          color: '#e8e0d8',
                          letterSpacing: '0.01em',
                        }}
                      >
                        热门 Star 排行
                      </h2>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 1, lineHeight: 1.4 }}>
                        按 GitHub Star 数排序，前 15 条
                      </p>
                    </div>
                  </div>

                  <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {hotResults.slice(0, 15).map((skill, idx) => (
                      <HotListItem key={skill.id} skill={skill} rank={idx + 1} type="star" onSelect={handleSkillClick} />
                    ))}
                  </div>
                </div>

                {/* ── Right Column: Trending ── */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    className="animate-fade-in"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 18,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        background: 'linear-gradient(135deg, #5ec4d4, #4ab0c0)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Flame style={{ width: 17, height: 17, color: '#1a1412', fill: '#1a1412' }} />
                    </div>
                    <div>
                      <h2
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '1rem',
                          fontWeight: 600,
                          color: '#e8e0d8',
                          letterSpacing: '0.01em',
                        }}
                      >
                        7 日热度飙升
                      </h2>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 1, lineHeight: 1.4 }}>
                        近 7 天上线，热度提升最快的前 15 条
                      </p>
                    </div>
                  </div>

                  <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {trendingResults.slice(0, 15).map((skill, idx) => (
                      <HotListItem key={skill.id} skill={skill} rank={idx + 1} type="trending" onSelect={handleSkillClick} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        ) : (
          /* ═══════════ Search Results Section ═══════════ */
          <section style={{ width: '100%', maxWidth: 1100, paddingTop: 4 }}>
            <div
              className="flex items-center justify-center gap-3 mb-8 animate-fade-in"
              style={{ animationDelay: '160ms' }}
            >
              <div
                className="flex items-center gap-3 px-5 py-2 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(212,165,116,0.1), rgba(94,196,212,0.06))',
                  border: '1px solid rgba(212,165,116,0.15)',
                  boxShadow: '0 0 16px rgba(212,165,116,0.06)',
                }}
              >
                <h2
                  className="text-base font-bold"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    color: 'var(--text-primary)',
                    letterSpacing: '0.02em',
                    fontWeight: 600,
                  }}
                >
                  {searchLoading ? '搜索中...' : '发现结果'}
                </h2>
                {!searchLoading && (
                  <span
                    className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #d4a574, #c49564)',
                      color: '#1a1412',
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      minWidth: 32,
                      boxShadow: '0 0 12px rgba(212,165,116,0.3)',
                    }}
                  >
                    {filteredResults.length}
                  </span>
                )}
              </div>
            </div>

            {searchLoading ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: 28,
                  justifyItems: 'center',
                  width: '100%',
                }}
              >
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div
                    key={i}
                    className="rounded-2xl p-6 glass"
                    style={{
                      boxShadow: 'var(--shadow-card)',
                      animationDelay: `${i * 60}ms`,
                      width: '100%',
                      maxWidth: 450,
                    }}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="shimmer" style={{ width: 50, height: 50, borderRadius: 14, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div className="shimmer" style={{ height: 16, width: '70%', marginBottom: 8 }} />
                        <div className="shimmer" style={{ height: 12, width: '45%' }} />
                      </div>
                    </div>
                    <div className="shimmer" style={{ height: 12, width: '100%', marginBottom: 8 }} />
                    <div className="shimmer" style={{ height: 12, width: '82%', marginBottom: 16 }} />
                    <div className="flex gap-2">
                      <div className="shimmer" style={{ height: 22, width: 56, borderRadius: 999 }} />
                      <div className="shimmer" style={{ height: 22, width: 48, borderRadius: 999 }} />
                      <div className="shimmer" style={{ height: 22, width: 64, borderRadius: 999 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="stagger-children"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: 28,
                  justifyItems: 'center',
                  width: '100%',
                }}
              >
                {filteredResults.map((skill: SkillMeta) => (
                  <div key={skill.id} style={{ width: '100%', maxWidth: 450 }}>
                    <SkillCard skill={skill} onSkillClick={handleSkillClick} />
                  </div>
                ))}
              </div>
            )}

            {!searchLoading && filteredResults.length === 0 && (
              <div
                className="flex flex-col items-center justify-center py-20 animate-fade-in"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <Layers style={{ width: 48, height: 48, marginBottom: 16, opacity: 0.35 }} />
                <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>
                  当前分类下没有找到 Skill
                </p>
                <p style={{ fontSize: '0.82rem', marginTop: 4 }}>
                  试试切换分类或重新搜索
                </p>
              </div>
            )}
          </section>
        )}
      </div>

      {/* ═══════════ Skill Detail Drawer ═══════════ */}
      <SkillDetailDrawer
        skill={selectedSkill}
        open={drawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════
   Compact Hot List Item — used in both columns
   ═══════════════════════════════════════════ */
function HotListItem({ skill, rank, type, onSelect }: {
  skill: SkillMeta;
  rank: number;
  type: 'star' | 'trending';
  onSelect?: (skill: SkillMeta) => void;
}) {
  const displayStars = skill.downloadCount >= 1000
    ? `${(skill.downloadCount / 1000).toFixed(1)}k`
    : `${skill.downloadCount}`;

  const accentColor = type === 'star' ? '#d4a574' : '#5ec4d4';

  // Top 3 badges use filled accent, rest use outline style
  const isTopRank = rank <= 3;

  return (
    <div
      className="rounded-xl transition-all duration-200"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 16px',
        background: 'rgba(42,34,32,0.35)',
        border: '1px solid rgba(212,165,116,0.06)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onClick={() => onSelect?.(skill)}
      onMouseEnter={e => {
        const el = e.currentTarget;
        el.style.borderColor = `rgba(${type === 'star' ? '212,165,116' : '94,196,212'},0.18)`;
        el.style.background = 'rgba(58,50,46,0.45)';
        el.style.transform = 'translateX(3px)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget;
        el.style.borderColor = 'rgba(212,165,116,0.06)';
        el.style.background = 'rgba(42,34,32,0.35)';
        el.style.transform = 'none';
      }}
    >
      {/* Rank badge */}
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          fontWeight: 700,
          color: isTopRank ? '#1a1412' : 'rgba(180,165,150,0.5)',
          background: isTopRank
            ? `linear-gradient(135deg, ${accentColor}, ${type === 'star' ? '#c49564' : '#4ab0c0'})`
            : 'rgba(42,34,32,0.6)',
          border: isTopRank ? 'none' : '1px solid rgba(180,165,150,0.12)',
          flexShrink: 0,
        }}
      >
        {rank}
      </div>

      {/* Name + Type badge + Description */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: '#e8e0d8',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 180,
            }}
          >
            {skill.name}
          </span>
          {/* Type badge */}
          <span
            style={{
              padding: '1px 6px',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              background: 'rgba(42,34,32,0.6)',
              border: '1px solid rgba(180,165,150,0.1)',
              color: 'rgba(180,165,150,0.6)',
              flexShrink: 0,
              lineHeight: '18px',
            }}
          >
            {skill.tags[0]?.slice(0, 3).toUpperCase() || 'SKL'}
          </span>
        </div>
        <p
          style={{
            fontSize: 12,
            color: 'rgba(180,165,150,0.55)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.4,
          }}
        >
          {skill.description}
        </p>
      </div>

      {/* Star count */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          flexShrink: 0,
          color: accentColor,
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <Star style={{ width: 13, height: 13, fill: accentColor }} />
        <span>{displayStars}</span>
      </div>

      {/* Chevron */}
      <ChevronRight style={{ width: 14, height: 14, color: 'rgba(180,165,150,0.3)', flexShrink: 0 }} />
    </div>
  );
}
