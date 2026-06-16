import { Link, useLocation, Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  Search, Library, Sun, Moon, Monitor, Zap, Settings, Menu, X, FileText,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Layout() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navItems = [
    { path: '/', label: '搜索发现', icon: Search },
    { path: '/library', label: 'Skill 库', icon: Library },
    { path: '/about', label: '关于产品', icon: FileText },
    { path: '/settings', label: '设置', icon: Settings },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong scanline-overlay">
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            paddingLeft: 'clamp(16px, 4vw, 48px)',
            paddingRight: 'clamp(16px, 4vw, 48px)',
          }}
        >
          <div className="flex items-center justify-between h-[60px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 via-accent-500 to-primary-400 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                  <Zap className="w-[18px] h-[18px] text-[#1a1412]" strokeWidth={2.5} />
                </div>
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-primary-500 via-accent-500 to-primary-400 opacity-0 group-hover:opacity-20 blur-md transition-opacity" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-[15px] font-bold leading-none tracking-tight" style={{ color: 'var(--text-accent)', fontFamily: 'var(--font-display)' }}>
                  火眼金睛 Skill
                </h1>
                <p className="text-[10px] leading-none mt-0.5 tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                  SKILL SEARCH PLATFORM
                </p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center">
              <div className="flex items-center gap-0.5 p-1 rounded-xl" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-primary)' }}>
                {navItems.map(item => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      aria-current={active ? "page" : undefined}
                      className="relative flex items-center gap-2 px-4 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-200"
                      style={{
                        background: active ? 'rgba(var(--accent-rgb), 0.1)' : 'transparent',
                        color: active ? 'var(--text-accent)' : 'var(--text-tertiary)',
                        border: active ? '1px solid rgba(var(--accent-rgb), 0.2)' : '1px solid transparent',
                        boxShadow: active ? 'var(--shadow-sm)' : 'none',
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              {/* Theme Switcher */}
              <div className="flex items-center gap-0.5 p-0.5 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                {[
                  { mode: 'light' as const, icon: Sun, label: '切换浅色模式' },
                  { mode: 'dark' as const, icon: Moon, label: '切换深色模式' },
                  { mode: 'system' as const, icon: Monitor, label: '跟随系统' },
                ].map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setTheme(mode)}
                    aria-label={label}
                    className="p-[6px] rounded-md transition-all duration-200"
                    style={{
                      background: theme === mode ? 'rgba(var(--accent-rgb), 0.15)' : 'transparent',
                      color: theme === mode ? 'var(--text-accent)' : 'var(--text-tertiary)',
                      boxShadow: theme === mode ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>

              <button
                className="md:hidden p-2 rounded-lg"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="菜单"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t animate-fade-in" style={{ borderColor: 'var(--border-primary)' }}>
            <div className="px-4 py-3 space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium"
                    style={{
                      background: active ? 'var(--bg-tertiary)' : 'transparent',
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main
        className="relative z-10"
        style={{
          maxWidth: 1280,
          minHeight: 'calc(100vh - 76px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          margin: '0 auto',
          paddingTop: 16,
          paddingBottom: 48,
          paddingLeft: 'clamp(16px, 4vw, 48px)',
          paddingRight: 'clamp(16px, 4vw, 48px)',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
