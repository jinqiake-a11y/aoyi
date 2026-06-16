import { useState, useMemo } from 'react';
import { useSkillStore } from '../store/useSkillStore';
import { DEMO_SKILLS } from '../utils/mockData';
import SkillCard from '../components/SkillCard';
import type { SkillMeta, ViewMode, SortBy } from '../types';
import {
  Library, Tag, Grid, List, SortAsc, Search,
  Filter, ChevronDown, Package,
} from 'lucide-react';

export default function LibraryPage() {
  const { skills, selectedTag, setSelectedTag } = useSkillStore();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('rating');
  const [filterText, setFilterText] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const allSkills = useMemo(() => {
    const combined = new Map<string, SkillMeta>();
    [...DEMO_SKILLS, ...skills].forEach(s => combined.set(s.id, s));
    return Array.from(combined.values());
  }, [skills]);

  const tagMap = useMemo(() => {
    const map = new Map<string, { count: number; color: string }>();
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#06b6d4', '#ef4444', '#6366f1', '#14b8a6', '#f97316'];
    allSkills.forEach(skill => {
      const allTags = [...new Set([...skill.tags, ...(skill.userTags || [])])];
      allTags.forEach(tag => {
        const existing = map.get(tag);
        map.set(tag, { count: (existing?.count || 0) + 1, color: existing?.color || colors[map.size % colors.length] });
      });
    });
    return Array.from(map.entries()).sort((a, b) => b[1].count - a[1].count);
  }, [allSkills]);

  const filteredSkills = useMemo(() => {
    let result = allSkills;

    if (selectedTag) {
      result = result.filter(s =>
        s.tags.includes(selectedTag) || (s.userTags && s.userTags.includes(selectedTag))
      );
    }

    if (filterText) {
      const q = filterText.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    switch (sortBy) {
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'downloads': result.sort((a, b) => b.downloadCount - a.downloadCount); break;
      case 'updated': result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()); break;
    }

    return result;
  }, [allSkills, selectedTag, filterText, sortBy]);

  const statusCounts = useMemo(() => {
    const counts = { all: allSkills.length, installed: 0, tested: 0, downloaded: 0 };
    allSkills.forEach(s => {
      if (['installed', 'testing', 'tested'].includes(s.status)) counts.installed++;
      if (s.status === 'tested') counts.tested++;
      if (s.status !== 'not_downloaded') counts.downloaded++;
    });
    return counts;
  }, [allSkills]);

  const sortLabels: Record<SortBy, string> = {
    name: 'Name',
    rating: 'Rating',
    downloads: 'Downloads',
    updated: 'Updated',
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <h1
            className="text-3xl font-bold flex items-center gap-3"
            style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}
          >
            <span
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.15), rgba(var(--accent2-rgb), 0.15))',
                border: '1px solid var(--border-glow)',
              }}
            >
              <Library className="w-5 h-5" style={{ color: 'var(--text-accent)' }} />
            </span>
            Skill Library
          </h1>
          <p className="text-sm mt-2 font-medium" style={{ color: 'var(--text-tertiary)' }}>
            {allSkills.length} skills available across {tagMap.length} tags
          </p>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
        {[
          { label: 'All Skills', count: statusCounts.all, color: 'var(--text-accent)', bg: 'rgba(var(--accent-rgb), 0.08)' },
          { label: 'Downloaded', count: statusCounts.downloaded, color: '#a855f7', bg: 'rgba(168,85,247,0.08)' },
          { label: 'Installed', count: statusCounts.installed, color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
          { label: 'Tested', count: statusCounts.tested, color: '#22d3ee', bg: 'rgba(34,211,238,0.08)' },
        ].map(stat => (
          <div
            key={stat.label}
            className="glass rounded-xl p-5 text-center hover-lift cursor-default"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <div
              className="text-3xl font-bold tracking-tight"
              style={{
                color: stat.color,
                fontFamily: "'Outfit', sans-serif",
                textShadow: `0 0 20px ${stat.color}30`,
              }}
            >
              {stat.count}
            </div>
            <div
              className="text-xs font-semibold mt-1.5 uppercase tracking-wider"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Two-Column Layout ── */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Left Sidebar: Tag List ── */}
        <div className="lg:w-64 shrink-0">
          <div
            className="glass rounded-2xl p-4 sticky top-24"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <h3
              className="text-sm font-semibold mb-4 flex items-center gap-2.5 px-1"
              style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}
            >
              <span
                className="flex items-center justify-center w-6 h-6 rounded-md"
                style={{ background: 'rgba(var(--accent-rgb), 0.1)' }}
              >
                <Tag className="w-3 h-3" style={{ color: 'var(--text-accent)' }} />
              </span>
              Categories
            </h3>

            {/* "All" Option */}
            <button
              onClick={() => setSelectedTag(null)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm mb-1.5 transition-all duration-200"
              style={{
                background: !selectedTag
                  ? 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.1), rgba(var(--accent2-rgb), 0.08))'
                  : 'transparent',
                color: !selectedTag ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: !selectedTag ? '1px solid var(--border-glow)' : '1px solid transparent',
                fontWeight: !selectedTag ? 600 : 400,
              }}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background: !selectedTag
                      ? 'linear-gradient(135deg, var(--text-accent), #5ec4d4)'
                      : 'var(--text-tertiary)',
                  }}
                />
                All
              </span>
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[28px] text-center"
                style={{
                  background: !selectedTag
                    ? 'rgba(var(--accent-rgb), 0.15)'
                    : 'var(--bg-tertiary)',
                  color: !selectedTag ? 'var(--text-accent)' : 'var(--text-tertiary)',
                }}
              >
                {allSkills.length}
              </span>
            </button>

            {/* Divider */}
            <div className="my-2 mx-2" style={{ borderTop: '1px solid var(--border-primary)' }} />

            {/* Scrollable Tag List */}
            <div className="space-y-0.5 max-h-80 overflow-y-auto pr-0.5" style={{ scrollbarGutter: 'stable' }}>
              {tagMap.map(([tag, info]) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200"
                  style={{
                    background: selectedTag === tag
                      ? `linear-gradient(135deg, ${info.color}12, ${info.color}08)`
                      : 'transparent',
                    color: selectedTag === tag ? info.color : 'var(--text-secondary)',
                    border: selectedTag === tag
                      ? `1px solid ${info.color}30`
                      : '1px solid transparent',
                    fontWeight: selectedTag === tag ? 600 : 400,
                  }}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-200"
                      style={{
                        background: info.color,
                        boxShadow: selectedTag === tag ? `0 0 8px ${info.color}50` : 'none',
                        transform: selectedTag === tag ? 'scale(1.2)' : 'scale(1)',
                      }}
                    />
                    <span className="truncate">{tag}</span>
                  </span>
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[28px] text-center flex-shrink-0 ml-2"
                    style={{
                      background: selectedTag === tag ? `${info.color}20` : 'var(--bg-tertiary)',
                      color: selectedTag === tag ? info.color : 'var(--text-tertiary)',
                    }}
                  >
                    {info.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Content Area ── */}
        <div className="flex-1 min-w-0">

          {/* ── Content Toolbar ── */}
          <div
            className="flex items-center gap-3 mb-5 p-2 rounded-xl"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
            }}
          >
            {/* Search Input */}
            <div
              className="flex-1 flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-500/20"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-primary)' }}
            >
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                placeholder="Search skills by name, description, or tag..."
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: 'var(--text-primary)' }}
              />
              {filterText && (
                <button
                  onClick={() => setFilterText('')}
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide transition-colors hover:opacity-80"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                aria-expanded={showSortMenu}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-secondary)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <SortAsc className="w-4 h-4" />
                <span className="hidden sm:inline">{sortLabels[sortBy]}</span>
                <ChevronDown
                  className="w-3.5 h-3.5 transition-transform duration-200"
                  style={{ transform: showSortMenu ? 'rotate(180deg)' : 'rotate(0)' }}
                />
              </button>
              {showSortMenu && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                  <div
                    className="absolute right-0 top-full mt-2 rounded-xl py-1.5 z-20 min-w-[160px] overflow-hidden"
                    style={{
                      background: 'var(--bg-card-solid)',
                      border: '1px solid var(--border-primary)',
                      boxShadow: 'var(--shadow-lg)',
                    }}
                  >
                    {(Object.keys(sortLabels) as SortBy[]).map(key => (
                      <button
                        key={key}
                        onClick={() => { setSortBy(key); setShowSortMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm transition-colors duration-150"
                        style={{
                          background: sortBy === key ? 'var(--bg-tertiary)' : 'transparent',
                          color: sortBy === key ? 'var(--text-accent)' : 'var(--text-secondary)',
                          fontWeight: sortBy === key ? 600 : 400,
                        }}
                      >
                        {sortLabels[key]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* View Mode Toggle */}
            <div
              className="flex rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--border-primary)' }}
            >
              <button
                onClick={() => setViewMode('grid')}
                aria-label="网格视图"
                aria-pressed={viewMode === 'grid'}
                className="p-2.5 transition-all duration-200"
                style={{
                  background: viewMode === 'grid'
                    ? 'rgba(var(--accent-rgb), 0.12)'
                    : 'var(--bg-card)',
                  color: viewMode === 'grid' ? 'var(--text-accent)' : 'var(--text-tertiary)',
                }}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                aria-label="列表视图"
                aria-pressed={viewMode === 'list'}
                className="p-2.5 transition-all duration-200"
                style={{
                  background: viewMode === 'list'
                    ? 'rgba(var(--accent-rgb), 0.12)'
                    : 'var(--bg-card)',
                  color: viewMode === 'list' ? 'var(--text-accent)' : 'var(--text-tertiary)',
                }}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Active Filter Badge ── */}
          {selectedTag && (
            <div
              className="flex items-center gap-2.5 mb-4 px-4 py-2.5 rounded-xl"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <Filter className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Filtered by:
              </span>
              <span
                className="px-3 py-1 rounded-lg text-xs font-semibold"
                style={{
                  background: 'rgba(var(--accent-rgb), 0.1)',
                  color: 'var(--text-accent)',
                  border: '1px solid var(--border-glow)',
                }}
              >
                {selectedTag}
              </span>
              <button
                onClick={() => setSelectedTag(null)}
                className="text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ color: 'var(--text-accent)' }}
              >
                Clear filter
              </button>
            </div>
          )}

          {/* ── Skills Grid / List ── */}
          {filteredSkills.length === 0 ? (
            <div
              className="text-center py-20 rounded-2xl"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <div
                className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                <Package className="w-7 h-7" style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                No matching skills found
              </p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => { setSelectedTag(null); setFilterText(''); }}
                className="text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ color: 'var(--text-accent)' }}
              >
                Reset all filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredSkills.map(skill => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSkills.map(skill => (
                <SkillCard key={skill.id} skill={skill} compact />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
