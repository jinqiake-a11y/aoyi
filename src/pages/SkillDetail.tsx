import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSkillStore } from '../store/useSkillStore';
import { DEMO_SKILLS } from '../utils/mockData';
import { fetchGitHubRepo, parseGitHubUrl } from '../utils/github';
import { downloadSkillAsFile } from '../utils/storage';
import InstallProgress from '../components/InstallProgress';
import TestPanel from '../components/TestPanel';
import RatingPanel from '../components/RatingPanel';
import Terminal from '../components/Terminal';
import type { InstallLog, SkillMeta } from '../types';
import {
  ArrowLeft, Download, HardDriveDownload, FlaskConical, Play,
  Star, ExternalLink, GitFork, Clock, CheckCircle,
  Settings, Terminal as TerminalIcon, Layers, FileText,
} from 'lucide-react';

type TabId = 'overview' | 'install' | 'test-env' | 'test' | 'rate';

export default function SkillDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { skills, addSkill, updateSkill, rateSkill, tagSkill, installLogs, addInstallLog, clearInstallLogs } = useSkillStore();

  const [skill, setSkill] = useState<SkillMeta | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'success' | 'error'>('idle');
  const [installProgress, setInstallProgress] = useState(0);
  const [envLogs, setEnvLogs] = useState<InstallLog[]>([]);
  const [envStatus, setEnvStatus] = useState<'idle' | 'building' | 'ready'>('idle');
  const [savePath, setSavePath] = useState('');

  useEffect(() => {
    const found = skills.find(s => s.id === id) || DEMO_SKILLS.find(s => s.id === id);
    if (found) {
      setSkill(found);
      // Ensure skill is tracked in store so updates (install, test) propagate properly
      addSkill(found);
    } else if (id) {
      const repoName = parseGitHubUrl(decodeURIComponent(id));
      if (repoName) {
        fetchGitHubRepo(repoName).then(s => {
          if (s) { setSkill(s); addSkill(s); }
        });
      }
    }
  }, [id, skills]);

  if (!skill) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div
            className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
          >
            <GitFork className="w-8 h-8" style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Skill not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: 'var(--text-accent)' }}
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: typeof Download }[] = [
    { id: 'overview', label: '概览', icon: FileText },
    { id: 'install', label: '下载安装', icon: HardDriveDownload },
    { id: 'test-env', label: '测试环境', icon: FlaskConical },
    { id: 'test', label: '功能测试', icon: Play },
    { id: 'rate', label: '评价', icon: Star },
  ];

  const handleDownload = () => {
    downloadSkillAsFile(skill);
    updateSkill(skill.id, { status: 'downloaded' });
    if (savePath) {
      alert(`文件正在下载。由于浏览器安全限制，无法直接保存到指定路径：\n${savePath}\n请在下载完成后手动将文件移动到目标目录。`);
    }
  };

  const simulateInstall = async () => {
    clearInstallLogs();
    setInstallStatus('installing');
    setInstallProgress(0);
    updateSkill(skill.id, { status: 'installing' });

    const steps = [
      { msg: `Starting install ${skill.name} v${skill.version}...`, level: 'info' as const, progress: 5 },
      { msg: 'Parsing Skill config...', level: 'info' as const, progress: 10 },
      { msg: 'Checking system dependencies...', level: 'info' as const, progress: 15 },
      ...skill.requirements.map((req, i) => ({
        msg: `  Checking ${req}... Found`,
        level: 'success' as const,
        progress: 20 + i * 5,
      })),
      { msg: 'Downloading Skill core files...', level: 'info' as const, progress: 40 },
      { msg: '  |- src/index.ts (2.3 KB)', level: 'info' as const, progress: 45 },
      { msg: '  |- src/handler.ts (4.1 KB)', level: 'info' as const, progress: 50 },
      { msg: '  |- src/utils.ts (1.8 KB)', level: 'info' as const, progress: 55 },
      { msg: '  |- package.json (0.5 KB)', level: 'info' as const, progress: 58 },
      { msg: 'Installing dependencies...', level: 'info' as const, progress: 60 },
      { msg: '  npm install --production', level: 'info' as const, progress: 65 },
      { msg: '  added 42 packages in 3.2s', level: 'success' as const, progress: 75 },
      { msg: 'Compiling TypeScript...', level: 'info' as const, progress: 80 },
      { msg: '  tsc --build tsconfig.json', level: 'info' as const, progress: 85 },
      { msg: '  + Build successful (0 errors)', level: 'success' as const, progress: 90 },
      { msg: 'Registering Skill locally...', level: 'info' as const, progress: 95 },
      { msg: `+ ${skill.name} v${skill.version} installed successfully!`, level: 'success' as const, progress: 100 },
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
      addInstallLog({ timestamp: Date.now(), level: step.level, message: step.msg });
      setInstallProgress(step.progress);
    }

    setInstallStatus('success');
    updateSkill(skill.id, { status: 'installed', installPath: `~/.skills/${skill.id}` });
  };

  const simulateBuildEnv = async () => {
    setEnvStatus('building');
    setEnvLogs([]);

    const envSteps: InstallLog[] = [
      { timestamp: Date.now(), level: 'info', message: 'Initializing test environment...' },
      { timestamp: Date.now(), level: 'info', message: 'Creating sandbox container...' },
      { timestamp: Date.now(), level: 'success', message: '  + Sandbox ready (Node.js v20.11)' },
      { timestamp: Date.now(), level: 'info', message: 'Configuring Skill runtime...' },
      { timestamp: Date.now(), level: 'info', message: `  Loading ${skill.name} module...` },
      { timestamp: Date.now(), level: 'success', message: '  + Module loaded successfully' },
      { timestamp: Date.now(), level: 'info', message: 'Starting test server...' },
      { timestamp: Date.now(), level: 'success', message: '  + Test server running at http://localhost:3001' },
      { timestamp: Date.now(), level: 'info', message: 'Preparing test UI...' },
      { timestamp: Date.now(), level: 'success', message: `+ Environment ready, ${skill.features.length || 1} feature modules loaded` },
    ];

    for (const step of envSteps) {
      await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300));
      step.timestamp = Date.now();
      setEnvLogs(prev => [...prev, step]);
    }

    setEnvStatus('ready');
    updateSkill(skill.id, { status: 'testing' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Back Button ── */}
      <button
        onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')}
        className="group flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:translate-x-[-2px]"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <span
          className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors duration-200"
          style={{ background: 'var(--bg-tertiary)' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </span>
        <span style={{ color: 'var(--text-secondary)' }}>Back</span>
      </button>

      {/* ── Hero Header Card ── */}
      <div
        className="glass-strong rounded-2xl p-6 sm:p-8 relative overflow-hidden"
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        {/* Decorative gradient orb */}
        <div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #a855f7 0%, #2b7bff 50%, transparent 70%)', filter: 'blur(60px)' }}
        />

        <div className="relative z-10 flex items-start gap-5 sm:gap-7">
          {/* Large Icon / Avatar */}
          {skill.icon ? (
            <img
              src={skill.icon}
              alt={skill.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex-shrink-0"
              style={{ boxShadow: 'var(--shadow-md)', border: '2px solid var(--border-glass)' }}
            />
          ) : (
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex-shrink-0 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #2b7bff 0%, #a855f7 50%, #22d3ee 100%)',
                boxShadow: '0 8px 32px rgba(43,123,255,0.25), 0 0 0 1px rgba(255,255,255,0.1) inset',
              }}
            >
              <GitFork className="w-10 h-10 text-white" strokeWidth={1.8} />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 flex-wrap">
              <h1
                className="gradient-text text-3xl sm:text-4xl font-bold leading-tight"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {skill.name}
              </h1>
              <span
                className="mt-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold tracking-wide"
                style={{
                  background: 'linear-gradient(135deg, rgba(43,123,255,0.12), rgba(168,85,247,0.12))',
                  color: 'var(--text-accent)',
                  border: '1px solid var(--border-glow)',
                }}
              >
                v{skill.version}
              </span>
            </div>

            <p
              className="mt-3 text-sm leading-relaxed max-w-2xl"
              style={{ color: 'var(--text-secondary)' }}
            >
              {skill.description}
            </p>

            {/* Meta Row */}
            <div className="flex items-center gap-5 mt-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                <GitFork className="w-3.5 h-3.5" />
                {skill.author}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                <Star className="w-3.5 h-3.5 fill-warning-400 text-warning-400" />
                {skill.rating.toFixed(1)}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                <Download className="w-3.5 h-3.5" />
                {skill.downloadCount.toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                <Clock className="w-3.5 h-3.5" />
                {new Date(skill.updatedAt).toLocaleDateString('zh-CN')}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {skill.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase"
                  style={{
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Quick Action Buttons ── */}
        <div className="relative z-10 flex flex-wrap gap-3 mt-7 pt-6" style={{ borderTop: '1px solid var(--border-glass)' }}>
          <button
            onClick={handleDownload}
            className="btn-ghost flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={() => setActiveTab('install')}
            className="btn-primary flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{ boxShadow: '0 4px 20px rgba(43,123,255,0.3)' }}
          >
            <span className="relative z-10 flex items-center gap-2.5">
              <HardDriveDownload className="w-4 h-4" />
              Install & Deploy
            </span>
          </button>
          <a
            href={skill.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ExternalLink className="w-4 h-4" />
            Source Repo
          </a>
        </div>
      </div>

      {/* ── Pill-Style Tab Bar ── */}
      <div
        className="flex items-center gap-1 overflow-x-auto rounded-xl p-1.5"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
        }}
      >
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-2 px-5 py-2.5 text-sm font-medium whitespace-nowrap rounded-lg transition-all duration-200"
              style={{
                background: active ? 'var(--bg-card-solid)' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
                boxShadow: active ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {/* Active underline indicator */}
              {active && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{
                    borderBottom: '2px solid',
                    borderColor: '#2b7bff',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content Area ── */}
      <div
        className="glass rounded-2xl p-6 sm:p-8"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >

        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Description */}
            <div>
              <h3
                className="text-base font-semibold mb-4 flex items-center gap-2.5"
                style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ background: 'rgba(43,123,255,0.1)' }}>
                  <FileText className="w-3.5 h-3.5" style={{ color: '#2b7bff' }} />
                </span>
                Description
              </h3>
              <div
                className="rounded-xl p-5"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
              >
                <p
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {skill.longDescription || skill.description}
                </p>
              </div>
            </div>

            {/* Features Grid */}
            {skill.features.length > 0 && (
              <div>
                <h3
                  className="text-base font-semibold mb-4 flex items-center gap-2.5"
                  style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ background: 'rgba(168,85,247,0.1)' }}>
                    <Layers className="w-3.5 h-3.5" style={{ color: '#a855f7' }} />
                  </span>
                  Core Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {skill.features.map((feature, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-5 transition-all duration-200 hover-lift"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                      }}
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <span
                          className="flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold"
                          style={{
                            background: 'linear-gradient(135deg, rgba(43,123,255,0.15), rgba(168,85,247,0.15))',
                            color: '#2b7bff',
                          }}
                        >
                          {i + 1}
                        </span>
                        <h4
                          className="text-sm font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {feature.name}
                        </h4>
                      </div>
                      <p className="text-xs leading-relaxed pl-[34px]" style={{ color: 'var(--text-secondary)' }}>
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {skill.requirements.length > 0 && (
              <div>
                <h3
                  className="text-base font-semibold mb-4 flex items-center gap-2.5"
                  style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ background: 'rgba(34,211,238,0.1)' }}>
                    <Settings className="w-3.5 h-3.5" style={{ color: '#22d3ee' }} />
                  </span>
                  Requirements
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skill.requirements.map(req => (
                    <span
                      key={req}
                      className="px-3.5 py-2 rounded-lg text-xs font-mono font-medium"
                      style={{
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-primary)',
                      }}
                    >
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Download Section */}
            <div>
              <h3
                className="text-base font-semibold mb-4 flex items-center gap-2.5"
                style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)' }}>
                  <Download className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />
                </span>
                Download
              </h3>
              <div
                className="rounded-xl p-5 space-y-3"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={savePath}
                    onChange={e => setSavePath(e.target.value)}
                    placeholder="Specify save path (e.g. C:\Skills\ or ~/skills/)"
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/30"
                    style={{
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    onClick={handleDownload}
                    className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </span>
                  </button>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Leave path empty to download as JSON config file for local installation
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Install Tab ── */}
        {activeTab === 'install' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3
                className="text-base font-semibold flex items-center gap-2.5"
                style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ background: 'rgba(43,123,255,0.1)' }}>
                  <HardDriveDownload className="w-3.5 h-3.5" style={{ color: '#2b7bff' }} />
                </span>
                Local Installation
              </h3>
              {skill.status === 'installed' && (
                <span
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{
                    background: 'rgba(34,197,94,0.1)',
                    color: '#22c55e',
                    border: '1px solid rgba(34,197,94,0.2)',
                  }}
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Installed
                </span>
              )}
            </div>

            {/* Requirements Checklist */}
            <div
              className="rounded-xl p-5"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
            >
              <h4
                className="text-sm font-semibold mb-3"
                style={{ color: 'var(--text-primary)' }}
              >
                Pre-install Checks
              </h4>
              <div className="space-y-2.5">
                {skill.requirements.map(req => (
                  <div
                    key={req}
                    className="flex items-center gap-3 text-sm rounded-lg p-2.5"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
                  >
                    <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
                    <span style={{ color: 'var(--text-secondary)' }}>{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Install Button */}
            {installStatus === 'idle' && skill.status !== 'installed' && (
              <button
                onClick={simulateInstall}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: 'linear-gradient(135deg, #2b7bff 0%, #a855f7 100%)',
                  boxShadow: '0 6px 30px rgba(43,123,255,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset',
                }}
              >
                <HardDriveDownload className="w-5 h-5" />
                Start Installation
              </button>
            )}

            {/* Install Progress */}
            {(installStatus !== 'idle' || installLogs.length > 0) && (
              <InstallProgress
                logs={installLogs}
                status={installStatus}
                progress={installProgress}
                onRetry={() => { setInstallStatus('idle'); clearInstallLogs(); setInstallProgress(0); }}
              />
            )}

            {/* Install Path */}
            {skill.installPath && (
              <div
                className="flex items-center gap-3 text-sm rounded-xl p-4"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
              >
                <TerminalIcon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Install path:</span>
                <code
                  className="px-3 py-1 rounded-lg font-mono text-xs font-medium"
                  style={{
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-accent)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  {skill.installPath}
                </code>
              </div>
            )}
          </div>
        )}

        {/* ── Test Environment Tab ── */}
        {activeTab === 'test-env' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3
                className="text-base font-semibold flex items-center gap-2.5"
                style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ background: 'rgba(168,85,247,0.1)' }}>
                  <FlaskConical className="w-3.5 h-3.5" style={{ color: '#a855f7' }} />
                </span>
                Test Environment
              </h3>

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                {envStatus === 'building' && (
                  <span className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full"
                    style={{
                      background: 'rgba(251,191,36,0.1)',
                      color: '#fbbf24',
                      border: '1px solid rgba(251,191,36,0.2)',
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-warning-400 animate-pulse" />
                    Building...
                  </span>
                )}
                {envStatus === 'ready' && (
                  <span className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full"
                    style={{
                      background: 'rgba(34,197,94,0.1)',
                      color: '#22c55e',
                      border: '1px solid rgba(34,197,94,0.2)',
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-success-500 pulse-ring" />
                    Environment Ready
                  </span>
                )}
                {envStatus === 'idle' && (
                  <span className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full"
                    style={{
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-tertiary)',
                      border: '1px solid var(--border-primary)',
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: 'var(--text-tertiary)' }} />
                    Idle
                  </span>
                )}
              </div>
            </div>

            {/* Pre-requisite Warning */}
            {skill.status !== 'installed' && skill.status !== 'testing' && skill.status !== 'tested' && (
              <div
                className="rounded-xl p-6 text-center"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
              >
                <FlaskConical className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
                <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Please install this Skill before setting up the test environment
                </p>
                <button
                  onClick={() => setActiveTab('install')}
                  className="text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ color: 'var(--text-accent)' }}
                >
                  Go to Install
                </button>
              </div>
            )}

            {/* Build Button */}
            {(skill.status === 'installed' || skill.status === 'testing' || skill.status === 'tested') && envStatus === 'idle' && (
              <button
                onClick={simulateBuildEnv}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #2b7bff 100%)',
                  boxShadow: '0 6px 30px rgba(168,85,247,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset',
                }}
              >
                <FlaskConical className="w-5 h-5" />
                Build Test Environment
              </button>
            )}

            {/* Terminal Output */}
            {envLogs.length > 0 && (
              <Terminal logs={envLogs} title="Environment Build Process" />
            )}

            {/* Environment Info Grid */}
            {envStatus === 'ready' && (
              <div
                className="rounded-xl p-5 space-y-5"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
              >
                <h4
                  className="text-sm font-semibold flex items-center gap-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  Environment Details
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { label: 'Runtime', value: 'Node.js v20.11 + Sandbox', color: '#2b7bff' },
                    { label: 'Server', value: 'localhost:3001', color: '#a855f7' },
                    { label: 'Modules', value: `${skill.features.length || 1} loaded`, color: '#22d3ee' },
                    { label: 'Status', value: 'Running', color: '#22c55e' },
                  ].map(item => (
                    <div
                      key={item.label}
                      className="rounded-xl p-4 transition-all duration-200"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                        {item.label}
                      </span>
                      <p
                        className="font-semibold mt-1.5 font-mono text-sm"
                        style={{ color: item.color }}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveTab('test')}
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #2b7bff 0%, #a855f7 100%)',
                    boxShadow: '0 4px 20px rgba(43,123,255,0.25)',
                  }}
                >
                  <Play className="w-4 h-4" />
                  Start Testing
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Test Tab ── */}
        {activeTab === 'test' && (
          <div className="animate-fade-in">
            {(skill.status === 'testing' || skill.status === 'tested' || envStatus === 'ready') ? (
              <TestPanel
                skill={skill}
                onTestComplete={() => updateSkill(skill.id, { status: 'tested' })}
              />
            ) : (
              <div
                className="rounded-xl p-8 text-center"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
              >
                <Play className="w-10 h-10 mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
                <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Please install and set up the test environment first
                </p>
                <button
                  onClick={() => setActiveTab('install')}
                  className="text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ color: 'var(--text-accent)' }}
                >
                  Go to Install
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Rate Tab ── */}
        {activeTab === 'rate' && (
          <div className="animate-fade-in">
            <RatingPanel
              skillId={skill.id}
              skillName={skill.name}
              currentRating={skill.userRating}
              currentTags={skill.userTags}
              onSubmit={(rating, tags) => {
                rateSkill(skill.id, rating);
                tagSkill(skill.id, tags);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
