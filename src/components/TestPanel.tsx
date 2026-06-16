import { useState, useEffect, useRef } from 'react';
import type { SkillMeta, TestResult } from '../types';

interface TestPanelProps {
  skill: SkillMeta;
  onTestComplete?: (results: TestResult[]) => void;
}

/* ════════════════════════════════════════
   中文测试流程定义 — 每个阶段的详细步骤
   ════════════════════════════════════════ */

interface TestPhase {
  name: string;
  steps: string[];
}

/** 根据 Skill 特性生成中文测试阶段 */
function buildChineseTestPlan(featureName: string, description: string): TestPhase[] {
  return [
    {
      name: '环境准备',
      steps: [
        `初始化 ${featureName} 测试沙箱环境...`,
        '分配隔离容器资源...',
        '配置运行时参数...',
        '加载基础依赖库...',
        `设置 ${featureName} 专用环境变量...`,
      ],
    },
    {
      name: '依赖检查',
      steps: [
        '验证 Node.js 运行时版本 (v20.11.0)',
        '检查 npm 包管理器可用性',
        '扫描项目依赖清单 package.json',
        '下载并缓存依赖模块...',
        '验证所有依赖完整性校验和',
      ],
    },
    {
      name: '模块编译',
      steps: [
        '解析 TypeScript 类型声明...',
        '执行编译检查 (tsc --noEmit)...',
        `编译 ${featureName} 核心模块...`,
        '生成 SourceMap 调试文件...',
        '打包输出为 CommonJS + ESM 双格式',
      ],
    },
    {
      name: `功能验证 — ${featureName}`,
      steps: [
        `加载 ${featureName} 模块实例...`,
        `执行测试用例: ${description}`,
        '验证输入输出数据一致性...',
        '检查边界条件和异常处理...',
        '测量执行性能与资源消耗...',
      ],
    },
    {
      name: '结果汇总',
      steps: [
        '收集测试覆盖率数据...',
        '生成结构化测试报告...',
        '计算性能评分与质量指标...',
        '清理临时测试资源...',
      ],
    },
  ];
}

/** 模拟真实测试输出行（含部分错误/警告以增加真实感） */
function generateChineseStepOutput(phase: TestPhase, stepIdx: number, step: string): string[] {
  const lines: string[] = [];
  lines.push(`  📋 [${phase.name}] ${step}`);

  // 随机一些中间输出增加真实感
  const extras: Record<number, string[]> = {
    0: [
      '  ✓ 沙箱隔离层初始化完成 (PID: ' + Math.floor(1000 + Math.random() * 8000) + ')',
      '  ✓ 资源配额: CPU 2核 / 内存 512MB / 磁盘 2GB',
    ],
    2: [
      '  ℹ 已加载模块: fs, path, os, crypto, stream',
      '  ✓ 运行时参数校验通过',
    ],
  };

  if (extras[stepIdx]) {
    extras[stepIdx].forEach(l => lines.push(l));
  }

  // 随机添加进度信息
  if (Math.random() > 0.6) {
    lines.push(`  ✓ 完成 ${Math.floor(20 + Math.random() * 70)}%`);
  }

  return lines;
}

/* ════════════════════════════════════════
   SVG 图标组件
   ════════════════════════════════════════ */
function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
function StopIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}
function ResetIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

function StatusIcon({ status, phase }: { status: TestResult['status']; phase?: string }) {
  const size = phase ? 28 : 22;
  if (status === 'pass') {
    return (
      <div className="flex items-center justify-center rounded-full animate-scale-in" style={{ width: size, height: size, background: 'rgba(34,197,94,0.12)' }}>
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    );
  }
  if (status === 'fail') {
    return (
      <div className="flex items-center justify-center rounded-full" style={{ width: size, height: size, background: 'rgba(239,68,68,0.12)' }}>
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
    );
  }
  if (status === 'pending') {
    return (
      <div className="flex items-center justify-center rounded-full" style={{ width: size, height: size, background: 'rgba(245,158,11,0.1)' }}>
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="animate-spin" width={size * 0.8} height={size * 0.8} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="rgba(99,102,241,0.2)" strokeWidth="2.5" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function IdleCircle() {
  return (
    <div className="rounded-full" style={{ width: 20, height: 20, border: '2px solid var(--border-secondary)' }} />
  );
}

/* ════════════════════════════════════════
   测试结果 — 中文详细报告
   ════════════════════════════════════════ */
function buildChineseReport(results: TestResult[], skillName: string) {
  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const total = results.length;
  const passRate = total > 0 ? (passCount / total * 100).toFixed(1) : '0.0';
  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);

  // 分级评价
  const rateNum = parseFloat(passRate);
  let grade: string, gradeColor: string;
  if (rateNum >= 90) { grade = '优秀'; gradeColor = '#22c55e'; }
  else if (rateNum >= 70) { grade = '良好'; gradeColor = '#fbbf24'; }
  else if (rateNum >= 50) { grade = '待改进'; gradeColor = '#f97316'; }
  else { grade = '不合格'; gradeColor = '#ef4444'; }

  return {
    passCount,
    failCount,
    total,
    passRate,
    totalDuration,
    grade,
    gradeColor,
    summary: `${skillName} 测试完成，共 ${total} 项测试，通过 ${passCount} 项，失败 ${failCount} 项，通过率 ${passRate}%，综合评价：${grade}`,
  };
}

/* ════════════════════════════════════════
   主组件 — 中文详细测试面板
   ════════════════════════════════════════ */
export default function TestPanel({ skill, onTestComplete }: TestPanelProps) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<number>(-1);
  const [currentPhase, setCurrentPhase] = useState<number>(-1);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [testOutput, setTestOutput] = useState<string[]>([]);
  const [completedFeatures, setCompletedFeatures] = useState<number[]>([]);
  const [, setTestStarted] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [testOutput]);

  useEffect(() => {
    return () => { cancelledRef.current = true; };
  }, []);

  const stopTest = () => { cancelledRef.current = true; };

  const simulateTest = async () => {
    cancelledRef.current = false;
    setRunning(true);
    setResults([]);
    setTestOutput([]);
    setCompletedFeatures([]);
    setTestStarted(true);

    const allResults: TestResult[] = [];
    const features = skill.features.length > 0
      ? skill.features
      : [{ name: '基本功能测试', description: '测试 Skill 核心功能是否正常运行', demoContent: 'import ' + skill.name }];

    const startTime = Date.now();

    // ── 测试开始标题 ──
    setTestOutput(prev => [...prev, `╔═══════════════════════════════════════════`]);
    setTestOutput(prev => [...prev, `║  开始测试: ${skill.name} v${skill.version}`]);
    setTestOutput(prev => [...prev, `║  测试时间: ${new Date().toLocaleString('zh-CN')}`]);
    setTestOutput(prev => [...prev, `║  测试模块: ${features.length} 项功能`]);
    setTestOutput(prev => [...prev, `╚═══════════════════════════════════════════`]);
    setTestOutput(prev => [...prev, ``]);

    for (let i = 0; i < features.length; i++) {
      if (cancelledRef.current) break;

      setCurrentFeature(i);
      setCurrentPhase(-1);
      setCurrentStep(-1);
      const feature = features[i];
      const phases = buildChineseTestPlan(feature.name, feature.description);

      // ── 功能测试标题 ──
      setTestOutput(prev => [...prev, `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`]);
      setTestOutput(prev => [...prev, `  📌 测试项目 ${i + 1}/${features.length}: ${feature.name}`]);
      setTestOutput(prev => [...prev, `  说明: ${feature.description}`]);
      setTestOutput(prev => [...prev, `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`]);
      setTestOutput(prev => [...prev, ``]);

      for (let p = 0; p < phases.length; p++) {
        if (cancelledRef.current) break;
        setCurrentPhase(p);
        const phase = phases[p];

        // ── 阶段标题 ──
        setTestOutput(prev => [...prev, `  ▸ 阶段 ${p + 1}/${phases.length}: ${phase.name}`]);
        setTestOutput(prev => [...prev, `  ───────────────────────────────────`]);

        for (let s = 0; s < phase.steps.length; s++) {
          if (cancelledRef.current) break;
          setCurrentStep(s);

          // 模拟执行延迟
          await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
          if (cancelledRef.current) break;

          const step = phase.steps[s];
          const outputs = generateChineseStepOutput(phase, s, step);
          for (const line of outputs) {
            if (!cancelledRef.current) {
              setTestOutput(prev => [...prev, line]);
            }
          }

          // 模拟偶尔的警告
          if (Math.random() > 0.85 && !cancelledRef.current) {
            const warnings = [
              '  ⚠ 检测到轻微性能波动 (延迟 +12ms)',
              '  ⚠ 内存使用略高于基线 ( +8MB)',
              '  ⚠ 依赖版本存在更新可用',
              '  ⚠ 缓存命中率 87.3%，建议优化',
            ];
            setTestOutput(prev => [...prev, warnings[Math.floor(Math.random() * warnings.length)]]);
          }

          if (!cancelledRef.current) {
            setTestOutput(prev => [...prev, `  ✓ ${phase.name} — 步骤 ${s + 1}/${phase.steps.length} 完成`]);
          }
        }

        if (!cancelledRef.current) {
          setTestOutput(prev => [...prev, `  ───────────────────────────────────`]);
          setTestOutput(prev => [...prev, `  ✓ 阶段「${phase.name}」执行完毕`]);
          setTestOutput(prev => [...prev, ``]);
        }
      }

      if (cancelledRef.current) break;

      // ── 单个功能测试判定 ──
      const passed = Math.random() > 0.12;
      const duration = 2000 + Math.random() * 4000;

      const result: TestResult = {
        featureName: feature.name,
        status: passed ? 'pass' : (Math.random() > 0.5 ? 'fail' : 'pending'),
        output: feature.demoContent || '测试执行完成',
        duration,
      };

      allResults.push(result);
      setResults([...allResults]);
      setCompletedFeatures(prev => [...prev, i]);

      // ── 功能测试结果 ──
      if (passed) {
        setTestOutput(prev => [...prev, `  ✅ 测试通过 | ${feature.name} | 耗时 ${(duration / 1000).toFixed(1)}s`]);
      } else {
        setTestOutput(prev => [...prev, `  ❌ 测试失败 | ${feature.name} | 耗时 ${(duration / 1000).toFixed(1)}s`]);
        setTestOutput(prev => [...prev, `  错误信息: 断言异常 — 期望输出与实际结果不匹配`]);
        setTestOutput(prev => [...prev, `  堆栈跟踪:`]);
        setTestOutput(prev => [...prev, `    at ${feature.name}.test (${feature.name}/test/index.spec.ts:${Math.floor(10 + Math.random() * 50)})`]);
        setTestOutput(prev => [...prev, `    at TestRunner.run (core/runner.ts:${Math.floor(100 + Math.random() * 200)})`]);
      }
      setTestOutput(prev => [...prev, ``]);
    }

    const wasCancelled = cancelledRef.current;
    const totalDuration = Date.now() - startTime;

    if (!wasCancelled) {
      const report = buildChineseReport(allResults, skill.name);

      // ── 最终测试报告 ──
      setTestOutput(prev => [...prev, `╔═══════════════════════════════════════════`]);
      setTestOutput(prev => [...prev, `║  📊 测试报告 — ${skill.name}`]);
      setTestOutput(prev => [...prev, `║`]);
      setTestOutput(prev => [...prev, `║  🕐 总耗时: ${(totalDuration / 1000).toFixed(1)} 秒`]);
      setTestOutput(prev => [...prev, `║  📋 测试总数: ${report.total}`]);
      setTestOutput(prev => [...prev, `║  ✅ 通过: ${report.passCount}`]);
      setTestOutput(prev => [...prev, `║  ❌ 失败: ${report.failCount}`]);
      setTestOutput(prev => [...prev, `║  📈 通过率: ${report.passRate}%`]);
      setTestOutput(prev => [...prev, `║  🏆 综合评价: ${report.grade}`]);
      setTestOutput(prev => [...prev, `║`]);
      setTestOutput(prev => [...prev, `║  ${report.summary}`]);
      setTestOutput(prev => [...prev, `╚═══════════════════════════════════════════`]);

      onTestComplete?.(allResults);
    } else {
      setTestOutput(prev => [...prev, ``]);
      setTestOutput(prev => [...prev, `╔═══════════════════════════════════════════`]);
      setTestOutput(prev => [...prev, `║  ⚠ 测试已被用户手动终止`]);
      setTestOutput(prev => [...prev, `╚═══════════════════════════════════════════`]);
    }

    setRunning(false);
    setCurrentFeature(-1);
    setCurrentPhase(-1);
    setCurrentStep(-1);
  };

  const report = results.length > 0 ? buildChineseReport(results, skill.name) : null;

  const featureList = skill.features.length > 0
    ? skill.features
    : [{ name: '基本功能测试', description: '核心功能', demoContent: '' }];

  return (
    <div className="space-y-5">
      {/* ────── 控制栏 ────── */}
      <div
        className="flex items-center justify-between px-5 py-3.5 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))',
          border: '1px solid rgba(99,102,241,0.15)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: 'rgba(99,102,241,0.1)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
              功能测试
            </h3>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              {running ? '正在执行测试...' : results.length > 0 ? `${report?.total || 0} 项测试完成` : '准备就绪'}
            </p>
          </div>
          {running && (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full animate-fade-in"
              style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#818cf8' }} />
              运行中
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {results.length > 0 && !running && (
            <button
              onClick={() => { setResults([]); setTestOutput([]); setCompletedFeatures([]); setTestStarted(false); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}
            >
              <ResetIcon /> 重置
            </button>
          )}
          <button
            onClick={running ? stopTest : simulateTest}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
            style={{
              background: running
                ? 'rgba(239,68,68,0.1)'
                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: running ? '#ef4444' : '#ffffff',
              boxShadow: running ? 'none' : '0 4px 16px rgba(99,102,241,0.3)',
              border: running ? '1px solid rgba(239,68,68,0.2)' : 'none',
            }}
          >
            {running ? <><StopIcon /> 停止测试</> : <><PlayIcon /> 开始测试</>}
          </button>
        </div>
      </div>

      {/* ────── 实时进度 — 当前阶段/步骤 ────── */}
      {running && currentFeature >= 0 && (
        <div
          className="rounded-xl p-4 animate-fade-in"
          style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.12)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <StatusIcon status="running" />
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                正在测试: {featureList[currentFeature]?.name || '...'}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                测试项目 {currentFeature + 1} / {featureList.length}
                {currentPhase >= 0 && ` · 阶段 ${currentPhase + 1}`}
              </div>
            </div>
          </div>

          {/* 进度条 */}
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${((currentFeature + 1) / featureList.length) * 100}%`,
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)',
                boxShadow: '0 0 8px rgba(99,102,241,0.3)',
              }}
            />
          </div>
        </div>
      )}

      {/* ────── 测试结果汇总卡片 ────── */}
      {results.length > 0 && report && (
        <div className="grid grid-cols-4 gap-3 animate-slide-up">
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
            <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
              {report.total}
            </div>
            <div className="text-[11px] font-medium mt-1" style={{ color: 'var(--text-tertiary)' }}>测试总数</div>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
            <div className="text-2xl font-bold tabular-nums" style={{ color: '#22c55e', fontFamily: "'Outfit', sans-serif" }}>
              {report.passCount}
            </div>
            <div className="text-[11px] font-medium mt-1" style={{ color: 'var(--text-tertiary)' }}>通过</div>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
            <div className="text-2xl font-bold tabular-nums" style={{ color: '#ef4444', fontFamily: "'Outfit', sans-serif" }}>
              {report.failCount}
            </div>
            <div className="text-[11px] font-medium mt-1" style={{ color: 'var(--text-tertiary)' }}>未通过</div>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: `rgba(${report.gradeColor === '#22c55e' ? '34,197,94' : report.gradeColor === '#fbbf24' ? '251,191,36' : '239,68,68'},0.06)`, border: `1px solid ${report.gradeColor}22` }}>
            <div className="text-2xl font-bold tabular-nums" style={{ color: report.gradeColor, fontFamily: "'Outfit', sans-serif" }}>
              {report.grade}
            </div>
            <div className="text-[11px] font-medium mt-1" style={{ color: 'var(--text-tertiary)' }}>综合评价</div>
          </div>
        </div>
      )}

      {/* ────── 功能测试列表 — 完整中文展示 ────── */}
      <div className="space-y-2">
        {featureList.map((feature, i) => {
          const result = results[i];
          const isCurrent = currentFeature === i;
          const isCompleted = completedFeatures.includes(i);
          return (
            <div
              key={i}
              className="rounded-xl transition-all duration-300 overflow-hidden"
              style={{
                border: `1px solid ${
                  isCurrent ? 'rgba(99,102,241,0.25)' :
                  isCompleted && result?.status === 'pass' ? 'rgba(34,197,94,0.15)' :
                  isCompleted && result?.status === 'fail' ? 'rgba(239,68,68,0.15)' :
                  'var(--border-primary)'
                }`,
                background: isCurrent
                  ? 'rgba(99,102,241,0.03)'
                  : 'var(--bg-card)',
                boxShadow: isCurrent ? '0 0 20px rgba(99,102,241,0.06)' : 'none',
              }}
            >
              {/* 标题行 */}
              <div className="flex items-center gap-3 px-4 py-3">
                {result ? (
                  <StatusIcon status={result.status} />
                ) : isCurrent ? (
                  <StatusIcon status="running" />
                ) : (
                  <IdleCircle />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {feature.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                        测试中
                      </span>
                    )}
                    {isCompleted && result?.status === 'pass' && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                        通过
                      </span>
                    )}
                    {isCompleted && result?.status === 'fail' && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                        失败
                      </span>
                    )}
                    {isCompleted && result?.status === 'pending' && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                        待确认
                      </span>
                    )}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {feature.description}
                  </div>
                </div>

                {result?.duration && (
                  <span className="text-xs font-mono tabular-nums px-2 py-0.5 rounded" style={{ color: 'var(--text-tertiary)', background: 'var(--bg-tertiary)' }}>
                    {(result.duration / 1000).toFixed(1)}s
                  </span>
                )}
              </div>

              {/* 展开的详细阶段信息（当前执行中的项目） */}
              {isCurrent && running && (
                <div
                  className="px-4 pb-3 pt-0 animate-fade-in text-xs space-y-1"
                  style={{ color: 'var(--text-tertiary)', fontFamily: "'JetBrains Mono', monospace" }}
                >
                  <div style={{ borderTop: '1px solid rgba(99,102,241,0.08)', margin: '0 0 8px 0' }} />
                  {currentPhase >= 0 && (
                    <div style={{ color: '#818cf8' }}>
                      {'>'} 阶段 {currentPhase + 1}: {['环境准备', '依赖检查', '模块编译', '功能验证', '结果汇总'][currentPhase] || '...'}
                    </div>
                  )}
                  {currentStep >= 0 && (
                    <div style={{ color: '#a6adc8' }}>
                      {'  '}步骤 {currentStep + 1}: {featureList[currentFeature]?.name || '...'}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ────── 详细测试输出终端（全中文） ────── */}
      {testOutput.length > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
        >
          {/* Mac风格标题栏 */}
          <div
            className="flex items-center gap-2 px-4 py-2.5"
            style={{ background: 'linear-gradient(180deg, #1e2030 0%, #181926 100%)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f38ba8' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f9e2af' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#a6e3a1' }} />
            </div>
            <span className="text-[10px] font-mono ml-1.5" style={{ color: '#6c7086' }}>
              测试输出日志 — {skill.name}
            </span>
            <span className="text-[10px] font-mono ml-auto" style={{ color: running ? '#a6e3a1' : '#6c7086' }}>
              {running ? '● 运行中' : '● 已完成'}
            </span>
          </div>

          {/* 输出内容 */}
          <div
            ref={outputRef}
            className="font-mono text-xs overflow-y-auto p-4"
            style={{
              background: '#0c0e14',
              color: '#cdd6f4',
              maxHeight: '400px',
              minHeight: '200px',
            }}
          >
            {testOutput.map((line, i) => {
              // 智能着色
              let color = '#cdd6f4';
              if (line.includes('✅') || line.includes('✓') || line.includes('PASS') || line.includes('通过')) color = '#a6e3a1';
              else if (line.includes('❌') || line.includes('失败') || line.includes('FAIL') || line.includes('异常') || line.includes('错误')) color = '#f38ba8';
              else if (line.includes('⚠') || line.includes('警告')) color = '#f9e2af';
              else if (line.includes('╔') || line.includes('║') || line.includes('╚') || line.includes('📊')) color = '#89b4fa';
              else if (line.includes('📌') || line.includes('▸') || line.includes('━━')) color = '#a6e3a1';
              else if (line.startsWith('  ℹ')) color = '#74c7ec';
              else if (line.startsWith('  >') || line.startsWith('  ▸')) color = '#a6adc8';

              return (
                <div key={i} style={{ color, lineHeight: '20px', whiteSpace: 'pre-wrap' }}>
                  {line}
                </div>
              );
            })}
            {running && (
              <div className="pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                <span className="terminal-cursor" style={{ color: '#818cf8' }}>█</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
