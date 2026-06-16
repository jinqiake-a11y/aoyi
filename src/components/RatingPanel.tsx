import { useState } from 'react';

interface RatingPanelProps {
  skillId: string;
  skillName: string;
  currentRating?: number;
  currentTags?: string[];
  onSubmit: (rating: number, tags: string[]) => void;
}

const SUGGESTED_TAGS = [
  '实用工具', '开发效率', 'AI增强', '文档处理', '数据分析',
  '自动化', 'API集成', 'UI生成', '测试工具', '安全扫描',
  '代码质量', '部署运维', '低代码', '教育学习',
];

const RATING_LABELS = ['', '需要改进', '一般般', '还不错', '很好用', '非常优秀'];

function StarIcon({ filled, glow }: { filled: boolean; glow: boolean }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill={filled ? '#f59e0b' : 'none'}
      stroke={filled ? '#f59e0b' : 'var(--border-secondary)'}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        filter: glow ? 'drop-shadow(0 0 8px rgba(245,158,11,0.6))' : 'none',
        transition: 'filter 0.2s ease, fill 0.15s ease, stroke 0.15s ease',
      }}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function RatingPanel({
  skillName,
  currentRating,
  currentTags,
  onSubmit,
}: RatingPanelProps) {
  const [rating, setRating] = useState(currentRating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(currentTags || []);
  const [customTag, setCustomTag] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const activeRating = hoverRating || rating;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    const trimmed = customTag.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags(prev => [...prev, trimmed]);
      setCustomTag('');
    }
  };

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, selectedTags);
      setSubmitted(true);
    }
  };

  /* ── Success State ── */
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
        {/* Animated checkmark */}
        <div
          className="flex items-center justify-center rounded-full mb-5 animate-scale-in"
          style={{
            width: 64,
            height: 64,
            background: 'rgba(34,197,94,0.1)',
            border: '2px solid rgba(34,197,94,0.25)',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3
          className="text-lg font-bold mb-1.5"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display, Outfit)' }}
        >
          评价已提交
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          感谢你为 <strong style={{ color: 'var(--text-primary)' }}>{skillName}</strong> 的评价
        </p>
        <button
          onClick={() => { setSubmitted(false); setRating(0); setSelectedTags([]); }}
          className="mt-5 text-sm font-medium transition-colors"
          style={{ color: 'var(--text-accent)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.8'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
        >
          重新评价
        </button>
      </div>
    );
  }

  /* ── Main UI ── */
  return (
    <div className="space-y-8">
      {/* ────── Star Rating ────── */}
      <section>
        <label
          className="block text-sm font-semibold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          评分
        </label>

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform duration-150"
              style={{
                transform: star <= activeRating ? 'scale(1.12)' : 'scale(1)',
              }}
            >
              <StarIcon
                filled={star <= activeRating}
                glow={star <= hoverRating && hoverRating > 0}
              />
            </button>
          ))}

          {/* Rating text */}
          <div className="ml-4 flex flex-col">
            <span
              className="text-lg font-bold tabular-nums"
              style={{
                color: activeRating > 0 ? '#f59e0b' : 'var(--text-tertiary)',
                fontFamily: 'var(--font-display, Outfit)',
                lineHeight: 1.2,
              }}
            >
              {activeRating > 0 ? `${activeRating} / 5` : '点击评分'}
            </span>
            {activeRating > 0 && (
              <span
                className="text-xs font-medium animate-fade-in"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {RATING_LABELS[activeRating]}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ────── Tag Selection ────── */}
      <section>
        <label
          className="flex items-center gap-2 text-sm font-semibold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          标签评价
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
          {SUGGESTED_TAGS.map(tag => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="relative px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 overflow-hidden"
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(43,123,255,0.15), rgba(168,85,247,0.12))'
                    : 'var(--bg-tertiary)',
                  color: isSelected ? 'var(--text-accent)' : 'var(--text-secondary)',
                  border: `1px solid ${isSelected ? 'rgba(43,123,255,0.3)' : 'var(--border-primary)'}`,
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isSelected ? '0 0 12px rgba(43,123,255,0.1)' : 'none',
                }}
              >
                {isSelected && (
                  <span
                    className="absolute inset-0 animate-fade-in"
                    style={{
                      background: 'linear-gradient(135deg, rgba(43,123,255,0.06), transparent)',
                    }}
                  />
                )}
                <span className="relative">{tag}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Tag Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customTag}
            onChange={e => setCustomTag(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustomTag()}
            placeholder="输入自定义标签..."
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'rgba(43,123,255,0.4)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(43,123,255,0.08)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'var(--border-primary)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <button
            onClick={addCustomTag}
            disabled={!customTag.trim()}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: customTag.trim()
                ? 'linear-gradient(135deg, #2b7bff, #a855f7)'
                : 'var(--bg-tertiary)',
              boxShadow: customTag.trim() ? '0 2px 12px rgba(43,123,255,0.25)' : 'none',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Selected Tags Display */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 animate-fade-in">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer group"
                style={{
                  background: 'rgba(43,123,255,0.08)',
                  color: 'var(--text-accent)',
                  border: '1px solid rgba(43,123,255,0.15)',
                }}
                onClick={() => toggleTag(tag)}
              >
                {tag}
                <span
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] leading-none transition-all group-hover:scale-110"
                  style={{
                    background: 'rgba(43,123,255,0.15)',
                    color: 'var(--text-accent)',
                  }}
                >
                  x
                </span>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ────── Submit Button ────── */}
      <button
        onClick={handleSubmit}
        disabled={rating === 0}
        className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: rating > 0
            ? 'linear-gradient(135deg, #2b7bff 0%, #a855f7 100%)'
            : 'var(--bg-tertiary)',
          boxShadow: rating > 0 ? '0 4px 20px rgba(43,123,255,0.3)' : 'none',
        }}
        onMouseEnter={e => {
          if (rating > 0) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 28px rgba(43,123,255,0.4)';
        }}
        onMouseLeave={e => {
          if (rating > 0) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(43,123,255,0.3)';
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
        提交评价
      </button>
    </div>
  );
}
