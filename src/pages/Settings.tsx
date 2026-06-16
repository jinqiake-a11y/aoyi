import { Settings as SettingsIcon, Sun, Moon, Monitor, Folder, Globe, Database, Info, ChevronRight, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSkillStore } from '../store/useSkillStore';

/* ─────────────────────────────────────────────────────────
   Section wrapper – reusable glass card for each settings group
   ───────────────────────────────────────────────────────── */
function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
  accent = false,
}: {
  title: string;
  description?: string;
  icon: React.ComponentType<{ style?: React.CSSProperties; className?: string }>;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <section
      className="rounded-2xl glass animate-slide-up"
      style={{
        padding: '28px 28px 24px',
        boxShadow: 'var(--shadow-card)',
        border: accent
          ? '1px solid rgba(var(--accent-rgb), 0.25)'
          : '1px solid var(--border-glass)',
      }}
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="flex items-center justify-center rounded-xl"
          style={{
            width: 36,
            height: 36,
            background: accent
              ? 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.18), rgba(var(--accent2-rgb), 0.14))'
              : 'var(--bg-tertiary)',
          }}
        >
          <Icon
            style={{
              width: 18,
              height: 18,
              color: accent ? 'var(--text-accent)' : 'var(--text-secondary)',
            }}
          />
        </div>
        <div>
          <h3
            className="text-sm font-semibold leading-tight"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h3>
          {description && (
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--text-tertiary)', lineHeight: 1.4 }}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   Row item – used inside Storage / Network sections
   ───────────────────────────────────────────────────────── */
function SettingsRow({
  icon: Icon,
  label,
  sublabel,
  action,
  badge,
}: {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  label: string;
  sublabel: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between py-3.5 transition-colors"
      style={{ borderBottom: '1px solid var(--border-primary)' }}
    >
      <div className="flex items-center gap-3.5" style={{ minWidth: 0, flex: 1 }}>
        <div
          className="flex items-center justify-center rounded-lg flex-shrink-0"
          style={{
            width: 34,
            height: 34,
            background: 'var(--bg-tertiary)',
          }}
        >
          <Icon style={{ width: 16, height: 16, color: 'var(--text-secondary)' }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            className="text-sm font-medium truncate"
            style={{ color: 'var(--text-primary)', lineHeight: 1.3 }}
          >
            {label}
          </div>
          <div
            className="text-xs truncate"
            style={{
              color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              marginTop: 1,
            }}
          >
            {sublabel}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        {badge}
        {action}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main Settings Page
   ═══════════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { skills } = useSkillStore();

  const themeOptions = [
    {
      mode: 'light' as const,
      icon: Sun,
      label: '浅色模式',
      desc: '明亮清晰，适合日间使用',
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      bgPreview: '#fafbff',
    },
    {
      mode: 'dark' as const,
      icon: Moon,
      label: '深色模式',
      desc: '护眼暗色，减少视觉疲劳',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
      bgPreview: '#080a12',
    },
    {
      mode: 'system' as const,
      icon: Monitor,
      label: '跟随系统',
      desc: '自动匹配操作系统主题',
      gradient: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
      bgPreview: 'linear-gradient(135deg, #fafbff 50%, #080a12 50%)',
    },
  ];

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Ambient orb */}
      <div
        className="orb"
        style={{
          width: 360,
          height: 360,
          top: -60,
          right: -100,
          background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.10) 0%, transparent 70%)',
          animationDelay: '-4s',
        }}
      />

      <div
        className="max-w-2xl mx-auto space-y-6 animate-fade-in"
        style={{ position: 'relative', zIndex: 1, paddingTop: 40, paddingBottom: 40 }}
      >

        {/* ── Page Header ── */}
        <div className="flex items-center gap-4 mb-2">
          <div
            className="flex items-center justify-center rounded-2xl"
            style={{
              width: 52,
              height: 52,
              background: 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.14), rgba(var(--accent2-rgb), 0.10))',
              border: '1px solid rgba(var(--accent-rgb), 0.18)',
            }}
          >
            <SettingsIcon
              style={{ width: 24, height: 24, color: 'var(--text-accent)' }}
            />
          </div>
          <div>
            <h1
              className="text-2xl font-bold leading-tight"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              设置
            </h1>
            <p
              className="text-sm mt-0.5"
              style={{ color: 'var(--text-tertiary)', lineHeight: 1.5 }}
            >
              配置 Skill Tester 的外观、存储和网络参数
            </p>
          </div>
        </div>

        {/* ═══════════ Theme Selector ═══════════ */}
        <SettingsSection
          title="外观主题"
          description="选择你偏好的界面外观"
          icon={Zap}
          accent
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {themeOptions.map(({ mode, icon: Icon, label, desc, gradient, bgPreview }) => {
              const active = theme === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setTheme(mode)}
                  className="relative rounded-xl text-left transition-all overflow-hidden"
                  style={{
                    padding: '20px 16px 16px',
                    border: active
                      ? '2px solid rgba(var(--accent-rgb), 0.65)'
                      : '1px solid var(--border-secondary)',
                    background: active
                      ? 'rgba(var(--accent-rgb), 0.06)'
                      : 'var(--bg-secondary)',
                    boxShadow: active
                      ? '0 0 0 3px rgba(var(--accent-rgb), 0.10), var(--shadow-md)'
                      : 'var(--shadow-sm)',
                    transform: active ? 'scale(1)' : 'scale(1)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLButtonElement).style.border = '1px solid var(--border-glow)';
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-md)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLButtonElement).style.border = '1px solid var(--border-secondary)';
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-sm)';
                    }
                  }}
                >
                  {/* Active indicator dot */}
                  {active && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'var(--text-accent)',
                        boxShadow: '0 0 8px rgba(var(--accent-rgb), 0.7)',
                      }}
                    />
                  )}

                  {/* Color preview swatch */}
                  <div
                    style={{
                      width: '100%',
                      height: 38,
                      borderRadius: 8,
                      marginBottom: 14,
                      background: bgPreview,
                      border: '1px solid var(--border-primary)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Accent stripe */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: gradient,
                      }}
                    />
                  </div>

                  {/* Icon + label */}
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <Icon
                      style={{
                        width: 17,
                        height: 17,
                        color: active ? 'var(--text-accent)' : 'var(--text-secondary)',
                      }}
                    />
                    <span
                      className="text-sm font-semibold"
                      style={{
                        fontFamily: 'var(--font-display)',
                        color: active ? 'var(--text-accent)' : 'var(--text-primary)',
                      }}
                    >
                      {label}
                    </span>
                  </div>

                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {desc}
                  </p>
                </button>
              );
            })}
          </div>
        </SettingsSection>

        {/* ═══════════ Storage ═══════════ */}
        <SettingsSection
          title="存储管理"
          description="本地数据与文件路径配置"
          icon={Database}
        >
          <div>
            <SettingsRow
              icon={Folder}
              label="默认下载路径"
              sublabel="~/.skills/downloads/"
              action={
                <button
                  onClick={() => alert('功能开发中...')}
                  className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
                >
                  修改
                  <ChevronRight style={{ width: 12, height: 12, opacity: 0.6 }} />
                </button>
              }
            />
            <SettingsRow
              icon={Database}
              label="本地 Skill 数据库"
              sublabel={`${skills.length} 个 Skill 已索引`}
              action={
                <button
                  onClick={() => alert('功能开发中...')}
                  className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
                >
                  导出
                  <ChevronRight style={{ width: 12, height: 12, opacity: 0.6 }} />
                </button>
              }
            />
            {/* Storage usage bar */}
            <div style={{ marginTop: 16 }}>
              <div
                className="flex items-center justify-between mb-2"
                style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}
              >
                <span>本地存储用量（估算）</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  {(skills.length * 0.4).toFixed(1)} MB / 500 MB
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  borderRadius: 999,
                  background: 'var(--bg-tertiary)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min((skills.length * 0.4 / 500) * 100, 100).toFixed(1)}%`,
                    minWidth: skills.length > 0 ? 8 : 0,
                    borderRadius: 999,
                    background: 'linear-gradient(90deg, var(--text-accent), #5ec4d4)',
                    transition: 'width 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* ═══════════ Network ═══════════ */}
        <SettingsSection
          title="网络设置"
          description="API 连接与代理配置"
          icon={Globe}
        >
          <div>
            <SettingsRow
              icon={Globe}
              label="GitHub API"
              sublabel="api.github.com"
              badge={
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: 'rgba(34,197,94,0.10)',
                    color: '#22c55e',
                    border: '1px solid rgba(34,197,94,0.20)',
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: '#22c55e',
                      display: 'inline-block',
                      boxShadow: '0 0 6px rgba(34,197,94,0.6)',
                    }}
                  />
                  已连接
                </span>
              }
            />
            <SettingsRow
              icon={Globe}
              label="npm Registry"
              sublabel="registry.npmjs.org"
              badge={
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: 'rgba(34,197,94,0.10)',
                    color: '#22c55e',
                    border: '1px solid rgba(34,197,94,0.20)',
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: '#22c55e',
                      display: 'inline-block',
                      boxShadow: '0 0 6px rgba(34,197,94,0.6)',
                    }}
                  />
                  已连接
                </span>
              }
            />
            <SettingsRow
              icon={Globe}
              label="HTTP 代理"
              sublabel="未配置（直连模式）"
              action={
                <button
                  onClick={() => alert('功能开发中...')}
                  className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
                >
                  配置
                  <ChevronRight style={{ width: 12, height: 12, opacity: 0.6 }} />
                </button>
              }
            />
          </div>
        </SettingsSection>

        {/* ═══════════ About ═══════════ */}
        <section
          className="rounded-2xl overflow-hidden animate-slide-up"
          style={{
            boxShadow: 'var(--shadow-card)',
            border: '1px solid rgba(var(--accent-rgb), 0.15)',
          }}
        >
          {/* Gradient accent bar */}
          <div
            style={{
              height: 3,
              background: 'linear-gradient(90deg, var(--text-accent) 0%, #5ec4d4 100%)',
            }}
          />

          <div
            className="glass"
            style={{ padding: '24px 28px' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex items-center justify-center rounded-xl"
                style={{
                  width: 36,
                  height: 36,
                  background: 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.18), rgba(var(--accent2-rgb), 0.14))',
                }}
              >
                <Info
                  style={{ width: 18, height: 18, color: 'var(--text-accent)' }}
                />
              </div>
              <h3
                className="text-sm font-semibold"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                }}
              >
                关于
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* App identity */}
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  应用名称
                </span>
                <span
                  className="text-sm font-semibold gradient-text"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Skill Tester
                </span>
              </div>
              <div
                style={{
                  height: 1,
                  background: 'var(--border-primary)',
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  版本
                </span>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-md"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  v1.0.0
                </span>
              </div>
              <div
                style={{
                  height: 1,
                  background: 'var(--border-primary)',
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  技能格式
                </span>
                <span
                  className="text-xs"
                  style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}
                >
                  GitHub / npm / SKILL.md
                </span>
              </div>

              {/* Description */}
              <div
                className="rounded-xl mt-1"
                style={{
                  padding: '12px 14px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: 'var(--text-tertiary)', lineHeight: 1.65 }}
                >
                  搜索、下载、安装和测试各类 Skill。支持 GitHub、npm 及 SKILL.md 格式的通用技能包，
                  提供完整的生命周期管理与一键测试能力。
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
