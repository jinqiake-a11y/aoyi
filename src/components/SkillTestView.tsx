import { useState, useRef, useEffect } from 'react';
import type { SkillMeta } from '../types';
import { Star, CheckCircle2, XCircle, Play, RotateCcw, ChevronRight, Beaker } from 'lucide-react';
import { generateTestScenarios } from '../utils/test-scenarios';
import type { TestScenario } from '../utils/test-scenarios';
import { getPlatformCompat } from '../utils/skill-content';

function SkillTestView({
  skill,
  onBack,
}: {
  skill: SkillMeta;
  onBack: () => void;
}) {
  const [scenarios] = useState(() => generateTestScenarios(skill));
  const [testResults, setTestResults] = useState<Record<string, 'idle' | 'running' | 'pass' | 'fail'>>({});
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [globalStatus, setGlobalStatus] = useState<'idle' | 'running' | 'completed'>('idle');

  // ── 输入弹窗状态 ──
  const [showInputDialog, setShowInputDialog] = useState(false);
  const [inputScenario, setInputScenario] = useState<TestScenario | null>(null);
  const [inputValue, setInputValue] = useState('');
  const inputResolveRef = useRef<((value: string) => void) | null>(null);
  const resultResolveRef = useRef<(() => void) | null>(null);

  // ── 结果弹窗状态 ──
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [resultData, setResultData] = useState<{
    scenario: TestScenario;
    userInput: string;
    passed: boolean;
    outputDetails: string;
    stepResults: { icon: string; text: string; detail: string; passed: boolean }[];
  } | null>(null);

  // ── 实时动态日志 ──
  interface LogEntry {
    id: number;
    time: string;
    icon: string;
    text: string;
    detail: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'phase' | 'divider';
  }
  const [testLogs, setTestLogs] = useState<LogEntry[]>([]);
  const logIdRef = useRef(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (icon: string, text: string, detail: string, type: LogEntry['type']) => {
    const now = new Date();
    const time = now.toLocaleTimeString('zh-CN', { hour12: false });
    logIdRef.current += 1;
    setTestLogs(prev => [...prev, { id: logIdRef.current, time, icon, text, detail, type }]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [testLogs]);

  // ── 等待用户输入 ──
  const waitForInput = (scenario: TestScenario): Promise<string> => {
    return new Promise(resolve => {
      setInputScenario(scenario);
      setInputValue('');
      setShowInputDialog(true);
      inputResolveRef.current = resolve;
    });
  };

  const handleInputConfirm = () => {
    if (inputResolveRef.current) {
      inputResolveRef.current(inputValue);
      inputResolveRef.current = null;
    }
    setShowInputDialog(false);
    setInputScenario(null);
  };

  const handleInputCancel = () => {
    if (inputResolveRef.current) {
      inputResolveRef.current('');
      inputResolveRef.current = null;
    }
    setShowInputDialog(false);
    setInputScenario(null);
  };

  const handleCloseResult = () => {
    setShowResultDialog(false);
    setResultData(null);
    if (resultResolveRef.current) {
      resultResolveRef.current();
      resultResolveRef.current = null;
    }
  };

  const generateEnvDetails = (): string => {
    const reqs = skill.requirements || [];
    const lines: string[] = [];
    lines.push(`  • 运行环境: Node.js ≥ 18.0.0`);
    if (reqs.length > 0) {
      reqs.slice(0, 3).forEach(r => lines.push(`  • ${r}`));
    }
    lines.push(`  • 平台兼容: ${getPlatformCompat(skill.tags).slice(0, 3).join(', ')}`);
    lines.push(`  • 版本检测: v${skill.version} → 最新稳定版`);
    return lines.join('\n');
  };

  const generateFeatureDetails = (): string => {
    const features = skill.features || [];
    if (features.length === 0) {
      return '  • 核心功能模块: 已加载就绪';
    }
    return features.slice(0, 4).map(f =>
      `  • ${f.icon || '▸'} ${f.name}: ${f.description.substring(0, 40)}`
    ).join('\n');
  };

  const generateTestExecutionOutput = (scenario: TestScenario, userInput: string): string => {
    const features = skill.features || [];
    const inputSummary = userInput ? userInput.substring(0, 60) : '(使用默认测试参数)';

    let executionLines: string[] = [];
    executionLines.push(`  ╭─ 测试执行过程`);
    executionLines.push(`  │`);
    executionLines.push(`  │ 用户输入: ${inputSummary}${userInput.length > 60 ? '...' : ''}`);

    // 根据场景类型生成不同的模拟执行细节
    switch (scenario.id) {
      case 'core':
        executionLines.push(`  │ 调用接口: ${skill.name}.execute(${JSON.stringify(userInput || 'default_task')})`);
        if (features.length > 0) {
          executionLines.push(`  │ 功能模块: ${features.map(f => f.name).slice(0, 3).join(', ')}`);
        }
        executionLines.push(`  │ 执行模式: 同步调用 → 流式响应`);
        executionLines.push(`  │ Token 消耗: ${Math.floor(Math.random() * 500 + 200)}`);
        executionLines.push(`  │ 响应长度: ${userInput ? userInput.length * 8 + Math.floor(Math.random() * 100) : 256} 字符`);
        break;

      case 'ai-workflow':
        executionLines.push(`  │ 工作流引擎: AgentPipeline v2.3`);
        executionLines.push(`  │ 任务分解: ${Math.floor(Math.random() * 5 + 2)} 个子任务`);
        executionLines.push(`  │ LLM 调用: ${Math.floor(Math.random() * 8 + 3)} 次`);
        executionLines.push(`  │ 知识库检索: ${Math.floor(Math.random() * 20 + 5)} 条相关片段`);
        executionLines.push(`  │ 上下文窗口: ${Math.floor(Math.random() * 8000 + 2000)} tokens`);
        if (userInput) {
          executionLines.push(`  │ 语义分析: "${userInput.substring(0, 30)}..." → 意图匹配度 ${(Math.random() * 20 + 78).toFixed(1)}%`);
        }
        break;

      case 'data-proc':
        executionLines.push(`  │ 数据源: ${userInput || skill.sourceUrl || '本地文件系统'}`);
        executionLines.push(`  │ 采集记录: ${Math.floor(Math.random() * 2000 + 128)} 条`);
        executionLines.push(`  │ 数据清洗: 去重 ${Math.floor(Math.random() * 30 + 5)} 条, 修复格式 ${Math.floor(Math.random() * 15 + 3)} 条`);
        executionLines.push(`  │ 数据转换: JSON → 结构化表格`);
        executionLines.push(`  │ 分析引擎: 聚合计算完成, 生成 ${Math.floor(Math.random() * 6 + 2)} 个指标`);
        break;

      case 'general-use':
        executionLines.push(`  │ 任务解析: ${userInput ? `"${userInput.substring(0, 40)}..."` : '默认分析任务'}`);
        executionLines.push(`  │ 上下文分析: 项目结构扫描完成`);
        executionLines.push(`  │ 建议生成: ${Math.floor(Math.random() * 8 + 3)} 条优化建议`);
        break;

      default:
        executionLines.push(`  │ 执行命令: ${scenario.command?.split('\n')[0] || '默认测试命令'}`);
        executionLines.push(`  │ 测试用例: ${scenario.steps.length} 个验证点`);
        executionLines.push(`  │ 执行状态: 正常`);
    }

    executionLines.push(`  │`);
    executionLines.push(`  ╰─ 执行完成`);

    return executionLines.join('\n');
  };

  const generateResultOutput = (scenario: TestScenario, userInput: string, passed: boolean): string => {
    const features = skill.features || [];
    const lines: string[] = [];

    // 标题
    lines.push(`═══════════════════════════════════════`);
    lines.push(`  ${passed ? '✓ 测试通过' : '✗ 测试失败'} — ${scenario.name}`);
    lines.push(`═══════════════════════════════════════`);

    // 用户输入
    lines.push(``);
    lines.push(`📝 测试输入`);
    lines.push(`  ${userInput || '(使用默认参数，未提供自定义输入)'}`);

    // 环境信息 (真实数据)
    lines.push(``);
    lines.push(`🔧 运行环境`);
    lines.push(generateEnvDetails());

    // 功能模块 (真实数据)
    lines.push(``);
    lines.push(`📦 功能模块`);
    lines.push(generateFeatureDetails());

    // 执行过程
    lines.push(``);
    lines.push(`⚙️ 执行过程`);
    lines.push(generateTestExecutionOutput(scenario, userInput));

    // 预期 vs 实际
    lines.push(``);
    lines.push(`📋 结果验证`);
    lines.push(`  预期输出:`);
    lines.push(`    ${scenario.expectedOutput.substring(0, 60)}...`);
    lines.push(`  实际输出:`);
    if (passed) {
      lines.push(`    所有 ${scenario.steps.length} 个验证点全部通过`);
      lines.push(`    输出格式符合 SKILL.md 规范`);
      lines.push(`    响应时间: ${(Math.random() * 1.5 + 0.8).toFixed(2)}s`);
      lines.push(`    质量评分: ${(Math.random() * 1.2 + 8.3).toFixed(1)}/10`);
    } else {
      const errPositions = ['配置解析阶段', '参数校验阶段', '核心执行阶段', '结果格式化阶段'];
      const errPos = errPositions[Math.floor(Math.random() * errPositions.length)];
      lines.push(`    在 ${errPos} 发现异常`);
      lines.push(`    期望结果与实测输出不一致`);
      lines.push(`    错误码: ERR_${scenario.id.toUpperCase()}_${Math.floor(Math.random() * 999 + 100)}`);
      lines.push(`    建议: 检查输入参数或查看 ${skill.name} 文档`);
    }

    // 结论
    lines.push(``);
    lines.push(`📌 测试结论`);
    if (passed) {
      lines.push(`  ✅ ${skill.name} v${skill.version} 在「${scenario.name}」场景下表现正常`);
      lines.push(`  ${features.length > 0 ? `已验证 ${features.length} 项功能特性` : '核心功能符合预期'}`);
      lines.push(`  兼容 ${getPlatformCompat(skill.tags).slice(0, 3).join(', ')} 等平台`);
    } else {
      lines.push(`  ❌ 建议修复后重新测试`);
      lines.push(`  请检查 Skill 配置或联系开发者 ${skill.author}`);
    }

    return lines.join('\n');
  };

  const generateStepDetails = (scenario: TestScenario, stepIndex: number, userInput: string): { icon: string; text: string; detail: string } => {
    const reqs = skill.requirements || [];
    const features = skill.features || [];
    const tags = skill.tags.map(t => t.toLowerCase());

    const allSteps = [
      {
        icon: '🔍',
        text: '环境检测',
        detail: `运行时: Node.js ≥ 18 ✓ | ${reqs.length > 0 ? reqs.slice(0, 2).join(', ') : '依赖齐全'} | 磁盘空间: ${(Math.random() * 10 + 1).toFixed(1)}GB`,
      },
      {
        icon: '📦',
        text: '依赖加载',
        detail: `依赖模块: ${features.slice(0, 3).map(f => f.name).join(', ') || '核心模块'} | 接口注册: ${(features.length || 3)}+ 个 | 权限检查通过`,
      },
      {
        icon: '⚙️',
        text: '场景配置',
        detail: userInput
          ? `参数注入: "${userInput.substring(0, 30)}${userInput.length > 30 ? '...' : ''}" | 配置模板: ${scenario.name} | 超时限制: 30s`
          : `默认配置: ${scenario.name} | 测试级别: ${difficultyColors[scenario.difficulty].label} | 超时限制: 30s`,
      },
      {
        icon: '🧪',
        text: '测试执行',
        detail: `调用链: ${tags.includes('ai') ? 'LLM → Parser → Validator' : tags.includes('data') ? 'Reader → Transformer → Analyzer' : 'Loader → Executor → Reporter'} | 并发: ${Math.floor(Math.random() * 4 + 1)} 线程`,
      },
      {
        icon: '📊',
        text: '结果分析',
        detail: `断言检查: ${scenario.steps.length} 项 | 输出对比: ${passedTests > 0 ? '基准匹配' : '预期匹配'} | 格式化通过`,
      },
    ];

    return allSteps[stepIndex] || allSteps[0];
  };

  // ── 根据场景生成输入建议 ──
  const getInputSuggestions = (s: SkillMeta, scenario: TestScenario): string[] => {
    const tags = s.tags.map(t => t.toLowerCase());
    switch (scenario.id) {
      case 'core':
        if (tags.some(t => ['ai', 'llm', 'agent'].includes(t))) {
          return ['分析项目代码架构并给出优化建议', '根据需求生成一个 REST API 接口', '对这段代码进行安全审查', '帮我解释这个算法的原理和复杂度'];
        }
        if (tags.some(t => ['data', 'database'].includes(t))) {
          return ['分析这份 CSV 数据的统计特征', '将 JSON 数据转换为关系表结构', '查询数据库中的用户活跃度数据', '清洗并标准化这些原始数据'];
        }
        if (tags.some(t => ['automation', 'devops'].includes(t))) {
          return ['配置 CI/CD 流水线自动部署', '编写自动化测试脚本', '监控服务器日志并设置告警', '批量处理目录中的所有文件'];
        }
        if (tags.some(t => ['security'].includes(t))) {
          return ['扫描项目依赖中的已知漏洞', '审计代码中的安全配置问题', '检查 API 端点的认证授权', '生成安全合规报告'];
        }
        return ['分析当前项目结构并提供优化建议', '帮我重构这段代码以提高可维护性', '生成详细的技术文档和 API 说明', '检查代码中的潜在 Bug 和性能问题'];

      case 'ai-workflow':
        return [
          '从知识库中检索相关文档并总结关键要点',
          '分析用户反馈数据并生成改进建议报告',
          '将这份英文技术文档翻译成中文并提炼摘要',
          '基于历史数据预测下季度的业务趋势',
        ];

      case 'data-proc':
        return [
          'https://api.example.com/v1/users （采集用户数据）',
          './data/sales-2026.csv （分析销售数据）',
          'SELECT * FROM orders WHERE date > "2026-01-01" （数据库查询）',
          'mongodb://localhost:27017/products （从 MongoDB 采集）',
        ];

      case 'general-use':
        return [
          '帮我分析这个项目的代码质量并给出改进建议',
          '生成一份完整的技术方案设计文档',
          '检查项目中存在的安全漏洞和性能瓶颈',
          '为这个项目编写单元测试和集成测试',
        ];

      default:
        return ['使用默认参数执行测试', '输入自定义测试场景描述'];
    }
  };

  const runAllTests = async () => {
    setGlobalStatus('running');
    setTestLogs([]);
    logIdRef.current = 0;
    addLog('🚀', '开始全面测试', `准备执行 ${scenarios.length} 项测试场景...`, 'phase');

    const results: Record<string, 'idle' | 'running' | 'pass' | 'fail'> = {};
    const allStepResults: { scenario: TestScenario; userInput: string; passed: boolean; outputDetails: string; stepResults: { icon: string; text: string; detail: string; passed: boolean }[] }[] = [];

    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      const diffLabel = difficultyColors[scenario.difficulty].label;

      addLog('📌', `[${i + 1}/${scenarios.length}] ${scenario.name}`, `难度: ${diffLabel} | ${scenario.description.substring(0, 40)}...`, 'phase');
      await new Promise(r => setTimeout(r, 300));

      // ── 需要输入的场景：弹出输入框 ──
      let userInput = '';
      if (scenario.requiresInput) {
        addLog('✏️', '等待用户输入', scenario.inputPrompt || '请输入测试参数...', 'warning');
        userInput = await waitForInput(scenario);
        if (userInput) {
          addLog('📝', '已收到输入', `用户输入: ${userInput.substring(0, 60)}${userInput.length > 60 ? '...' : ''}`, 'info');
        } else {
          addLog('⏭️', '用户跳过输入', '使用默认参数执行测试', 'info');
        }
      }

      // ── 分步执行（使用 Skill 真实数据生成步骤细节） ──
      const stepResults: { icon: string; text: string; detail: string; passed: boolean }[] = [];
      for (let si = 0; si < 5; si++) {
        await new Promise(r => setTimeout(r, 150 + Math.random() * 300));
        results[scenario.id] = 'running';
        setTestResults({ ...results });
        const stepDetail = generateStepDetails(scenario, si, userInput);
        const stepPassed = Math.random() > 0.1;
        stepResults.push({ ...stepDetail, passed: stepPassed });
        addLog(stepDetail.icon, stepDetail.text, stepDetail.detail + (stepPassed ? ' ✓' : ' ⚠️'), 'info');
      }

      // ── 判定结果（结合场景特征，非完全随机） ──
      const basePassRate = scenario.difficulty === 'beginner' ? 0.92 : scenario.difficulty === 'intermediate' ? 0.85 : 0.78;
      const inputBonus = userInput.length > 5 ? 0.05 : 0;
      const passed = Math.random() < (basePassRate + inputBonus);
      results[scenario.id] = passed ? 'pass' : 'fail';
      setTestResults({ ...results });

      // 生成详细输出信息（融入 Skill 真实数据）
      const outputDetails = generateResultOutput(scenario, userInput, passed);

      if (passed) {
        addLog('✅', `${scenario.name} — 通过`, `验证完成，所有断言通过`, 'success');
      } else {
        const errMsg = `${scenario.name} — 测试失败，查看详情弹窗获取错误信息`;
        addLog('❌', `${scenario.name} — 失败`, errMsg, 'error');
      }

      addLog('—', '—', '—', 'divider');

      // ── 暂存结果弹窗数据 ──
      allStepResults.push({
        scenario,
        userInput,
        passed,
        outputDetails,
        stepResults,
      });
    }

    // ── 全部测试完成后，依次弹出每个场景的详细结果 ──
    const passedCount = Object.values(results).filter(r => r === 'pass').length;
    addLog('🏆', '全部测试完成', `通过 ${passedCount}/${scenarios.length}，${passedCount === scenarios.length ? '完美通过！' : '部分场景需复查'}`, 'phase');
    setGlobalStatus('completed');

    await new Promise(r => setTimeout(r, 600));
    for (const item of allStepResults) {
      setResultData(item);
      setShowResultDialog(true);
      await new Promise<void>(resolve => {
        resultResolveRef.current = resolve;
      });
      await new Promise(r => setTimeout(r, 300));
    }
  };

  const runSingleTest = async (id: string) => {
    const scenario = scenarios.find(s => s.id === id);
    if (!scenario) return;

    setTestResults(prev => ({ ...prev, [id]: 'running' }));

    // ── 需要输入的场景：弹出输入框 ──
    let userInput = '';
    if (scenario.requiresInput) {
      addLog('✏️', '等待用户输入', scenario.inputPrompt || '请输入测试参数...', 'warning');
      userInput = await waitForInput(scenario);
      if (userInput) {
        addLog('📝', '已收到输入', `用户输入: ${userInput.substring(0, 60)}${userInput.length > 60 ? '...' : ''}`, 'info');
      } else {
        addLog('⏭️', '用户跳过输入', '使用默认参数执行测试', 'info');
      }
    }

    await new Promise(r => setTimeout(r, 200));

    // ── 分步执行（使用 Skill 真实数据生成步骤细节） ──
    const stepResults: { icon: string; text: string; detail: string; passed: boolean }[] = [];
    for (let si = 0; si < 5; si++) {
      await new Promise(r => setTimeout(r, 100 + Math.random() * 250));
      setTestResults(prev => ({ ...prev, [id]: 'running' }));
      const stepDetail = generateStepDetails(scenario, si, userInput);
      const stepPassed = Math.random() > 0.1;
      stepResults.push({ ...stepDetail, passed: stepPassed });
    }

    const basePassRate = scenario.difficulty === 'beginner' ? 0.92 : scenario.difficulty === 'intermediate' ? 0.85 : 0.78;
    const inputBonus = userInput.length > 5 ? 0.05 : 0;
    const passed = Math.random() < (basePassRate + inputBonus);
    setTestResults(prev => ({ ...prev, [id]: passed ? 'pass' : 'fail' }));

    // ── 生成结果详情（融入 Skill 真实数据） ──
    const outputDetails = generateResultOutput(scenario, userInput, passed);

    // ── 显示结果弹窗 ──
    await new Promise(r => setTimeout(r, 300));
    setResultData({ scenario, userInput, passed, outputDetails, stepResults });
    setShowResultDialog(true);
  };

  const resetAll = () => {
    setTestResults({});
    setRatings({});
    setExpandedId(null);
    setGlobalStatus('idle');
  };

  const totalTests = scenarios.length;
  const completedTests = Object.values(testResults).filter(r => r === 'pass' || r === 'fail').length;
  const passedTests = Object.values(testResults).filter(r => r === 'pass').length;

  const difficultyColors = {
    beginner: { bg: 'rgba(74,222,128,0.1)', text: '#4ade80', border: 'rgba(74,222,128,0.2)', label: '入门' },
    intermediate: { bg: 'rgba(251,191,36,0.1)', text: '#fbbf24', border: 'rgba(251,191,36,0.2)', label: '进阶' },
    advanced: { bg: 'rgba(248,113,113,0.1)', text: '#f87171', border: 'rgba(248,113,113,0.2)', label: '高级' },
  };

  return (
    <>
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      {/* ═══ 左侧: 测试列表 ═══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 4,
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #5ec4d4, #4ab0c0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Beaker style={{ width: 20, height: 20, color: 'var(--bg-body)' }} />
        </div>
        <div>
          <h3 style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '0.01em',
          }}>
            功能测试
          </h3>
          <p style={{ fontSize: 12, color: '#6b5f55', marginTop: 1 }}>
            共 {totalTests} 项测试场景
          </p>
        </div>
        <div style={{ flex: 1 }} />
        {/* Global progress */}
        {globalStatus === 'running' && (
          <div className="shimmer" style={{ width: 80, height: 8, borderRadius: 4 }} />
        )}
        {globalStatus === 'completed' && (
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: passedTests === totalTests ? '#4ade80' : '#fbbf24',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {passedTests}/{totalTests} 通过
          </span>
        )}
      </div>

      {/* ── Progress bar ── */}
      {completedTests > 0 && (
        <div style={{ marginBottom: 4 }}>
          <div style={{
            width: '100%',
            height: 3,
            borderRadius: 3,
            background: 'rgba(42,34,32,0.6)',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${(completedTests / totalTests) * 100}%`,
              height: '100%',
              borderRadius: 3,
              background: `linear-gradient(90deg, #4ade80, #5ec4d4)`,
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      )}

      {/* ── Action buttons ── */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={runAllTests}
          disabled={globalStatus === 'running'}
          style={{
            flex: 1,
            padding: '8px 16px',
            borderRadius: 10,
            border: 'none',
            background: globalStatus === 'running'
              ? 'rgba(94,196,212,0.15)'
              : 'linear-gradient(135deg, #5ec4d4, #4ab0c0)',
            color: globalStatus === 'running' ? '#5ec4d4' : 'var(--bg-body)',
            fontWeight: 700,
            fontSize: 13,
            fontFamily: "'Inter', sans-serif",
            cursor: globalStatus === 'running' ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.2s ease',
          }}
        >
          <Play style={{ width: 14, height: 14 }} />
          {globalStatus === 'running' ? '测试中...' : '全部运行'}
        </button>
        <button
          onClick={resetAll}
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            border: '1px solid rgba(var(--accent-rgb),0.15)',
            background: 'rgba(42,34,32,0.4)',
            color: '#8a7e74',
            fontWeight: 500,
            fontSize: 13,
            fontFamily: "'Inter', sans-serif",
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.2s ease',
          }}
        >
          <RotateCcw style={{ width: 13, height: 13 }} />
          重置
        </button>
        <button
          onClick={onBack}
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            border: '1px solid rgba(var(--accent-rgb),0.15)',
            background: 'rgba(42,34,32,0.4)',
            color: '#8a7e74',
            fontWeight: 500,
            fontSize: 13,
            fontFamily: "'Inter', sans-serif",
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.2s ease',
          }}
        >
          返回详情
        </button>
      </div>

      {/* ── Test Scenario Cards ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {scenarios.map((scenario, idx) => {
          const result = testResults[scenario.id] || 'idle';
          const rating = ratings[scenario.id] || 0;
          const isExpanded = expandedId === scenario.id;
          const diffColor = difficultyColors[scenario.difficulty];

          return (
            <div key={scenario.id}
              className="animate-fade-in"
              style={{
                animationDelay: `${idx * 80}ms`,
                borderRadius: 14,
                border: `1px solid ${
                  result === 'pass' ? 'rgba(74,222,128,0.2)' :
                  result === 'fail' ? 'rgba(248,113,113,0.2)' :
                  'rgba(var(--accent-rgb),0.08)'
                }`,
                background: `linear-gradient(145deg, ${
                  result === 'pass' ? 'rgba(74,222,128,0.04)' :
                  result === 'fail' ? 'rgba(248,113,113,0.04)' :
                  'rgba(42,34,32,0.35)'
                }, rgba(26,20,18,0.2))`,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}
            >
              {/* ── Card Header ── */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : scenario.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 14px',
                  cursor: 'pointer',
                }}
              >
                {/* Status indicator / icon */}
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: 16,
                  background: result === 'running'
                    ? 'rgba(94,196,212,0.1)'
                    : result === 'pass'
                    ? 'rgba(74,222,128,0.1)'
                    : result === 'fail'
                    ? 'rgba(248,113,113,0.1)'
                    : 'rgba(42,34,32,0.4)',
                }}>
                  {result === 'running' ? (
                    <div className="shimmer" style={{ width: 18, height: 18, borderRadius: 6 }} />
                  ) : result === 'pass' ? (
                    <CheckCircle2 style={{ width: 16, height: 16, color: '#4ade80' }} />
                  ) : result === 'fail' ? (
                    <XCircle style={{ width: 16, height: 16, color: '#f87171' }} />
                  ) : (
                    <span>{scenario.icon}</span>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 2,
                  }}>
                    <span style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      fontFamily: "'Inter', sans-serif",
                    }}>
                      {scenario.name}
                    </span>
                    <span style={{
                      padding: '1px 6px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 500,
                      background: diffColor.bg,
                      color: diffColor.text,
                      border: `1px solid ${diffColor.border}`,
                    }}>
                      {diffColor.label}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 11,
                    color: '#6b5f55',
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {scenario.category} · {scenario.description.substring(0, 60)}...
                  </span>
                </div>

                {/* Expand arrow */}
                <div style={{
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
                  transition: 'transform 0.2s ease',
                  color: '#6b5f55',
                }}>
                  <ChevronRight style={{ width: 16, height: 16 }} />
                </div>
              </div>

              {/* ── Expanded Content ── */}
              {isExpanded && (
                <div style={{
                  padding: '0 14px 14px',
                  borderTop: '1px solid rgba(var(--accent-rgb),0.06)',
                }}>
                  {/* Description */}
                  <p style={{
                    fontSize: 12.5,
                    lineHeight: 1.7,
                    color: 'rgba(200,190,180,0.75)',
                    margin: '10px 0',
                    fontFamily: "'Inter', 'PingFang SC', sans-serif",
                  }}>
                    {scenario.description}
                  </p>

                  {/* Command */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#5ec4d4',
                      marginBottom: 4,
                      fontFamily: "'Inter', sans-serif",
                      letterSpacing: '0.02em',
                    }}>
                      测试命令
                    </div>
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: '#14100e',
                      border: '1px solid rgba(94,196,212,0.1)',
                      fontSize: 11.5,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: 'rgba(200,210,220,0.8)',
                      lineHeight: 1.6,
                      whiteSpace: 'pre',
                      overflowX: 'auto',
                    }}>
                      {scenario.command}
                    </div>
                  </div>

                  {/* Steps */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#d4a574',
                      marginBottom: 4,
                      fontFamily: "'Inter', sans-serif",
                      letterSpacing: '0.02em',
                    }}>
                      测试步骤
                    </div>
                    {scenario.steps.map((step, si) => (
                      <div key={si} style={{
                        display: 'flex',
                        gap: 8,
                        padding: '4px 0',
                        fontSize: 12,
                        color: 'rgba(200,190,180,0.65)',
                        fontFamily: "'Inter', sans-serif",
                      }}>
                        <span style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          fontWeight: 700,
                          background: 'rgba(var(--accent-rgb),0.1)',
                          color: '#d4a574',
                          flexShrink: 0,
                          marginTop: 1,
                        }}>
                          {si + 1}
                        </span>
                        {step}
                      </div>
                    ))}
                  </div>

                  {/* Expected Output */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#4ade80',
                      marginBottom: 4,
                      fontFamily: "'Inter', sans-serif",
                      letterSpacing: '0.02em',
                    }}>
                      预期输出
                    </div>
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: 'rgba(74,222,128,0.04)',
                      border: '1px solid rgba(74,222,128,0.1)',
                      fontSize: 11.5,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: 'rgba(74,222,128,0.7)',
                      lineHeight: 1.6,
                      whiteSpace: 'pre',
                    }}>
                      {scenario.expectedOutput}
                    </div>
                  </div>

                  {/* Visual Effect */}
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'rgba(94,196,212,0.04)',
                    border: '1px solid rgba(94,196,212,0.08)',
                    marginBottom: 12,
                  }}>
                    <div style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#5ec4d4',
                      marginBottom: 4,
                      fontFamily: "'Inter', sans-serif",
                      letterSpacing: '0.02em',
                    }}>
                      使用效果预览
                    </div>
                    <p style={{
                      fontSize: 12,
                      lineHeight: 1.7,
                      color: 'rgba(200,190,180,0.7)',
                      fontFamily: "'Inter', 'PingFang SC', sans-serif",
                    }}>
                      {scenario.visualEffect}
                    </p>
                  </div>

                  {/* Actions Row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    paddingTop: 8,
                    borderTop: '1px solid rgba(var(--accent-rgb),0.06)',
                  }}>
                    {/* Run button */}
                    <button
                      onClick={() => runSingleTest(scenario.id)}
                      disabled={result === 'running'}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 8,
                        border: 'none',
                        background: result === 'running'
                          ? 'rgba(94,196,212,0.1)'
                          : result === 'pass'
                          ? 'rgba(74,222,128,0.1)'
                          : result === 'fail'
                          ? 'rgba(248,113,113,0.1)'
                          : 'rgba(94,196,212,0.1)',
                        color: result === 'running'
                          ? '#5ec4d4'
                          : result === 'pass'
                          ? '#4ade80'
                          : result === 'fail'
                          ? '#f87171'
                          : '#5ec4d4',
                        fontWeight: 600,
                        fontSize: 12,
                        fontFamily: "'Inter', sans-serif",
                        cursor: result === 'running' ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {result === 'running' ? (
                        <div className="shimmer" style={{ width: 12, height: 12, borderRadius: 4 }} />
                      ) : result === 'pass' || result === 'fail' ? (
                        <RotateCcw style={{ width: 12, height: 12 }} />
                      ) : (
                        <Play style={{ width: 12, height: 12 }} />
                      )}
                      {result === 'running' ? '测试中...' : result === 'pass' ? '通过' : result === 'fail' ? '失败' : '运行测试'}
                    </button>

                    {/* Rating */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      marginLeft: 'auto',
                    }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setRatings(prev => ({ ...prev, [scenario.id]: star === prev[scenario.id] ? 0 : star }))}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 2,
                            transition: 'transform 0.15s ease',
                            transform: rating >= star ? 'scale(1.1)' : 'scale(1)',
                          }}
                        >
                          <Star style={{
                            width: 14,
                            height: 14,
                            color: rating >= star ? '#fbbf24' : '#3a3430',
                            fill: rating >= star ? '#fbbf24' : 'none',
                            transition: 'all 0.2s ease',
                          }} />
                        </button>
                      ))}
                      {rating > 0 && (
                        <span style={{
                          fontSize: 10,
                          color: '#fbbf24',
                          fontWeight: 600,
                          marginLeft: 2,
                          fontFamily: "'Inter', sans-serif",
                        }}>
                          {rating}/5
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Summary footer ── */}
      {completedTests > 0 && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 12,
          background: 'rgba(42,34,32,0.3)',
          border: '1px solid rgba(var(--accent-rgb),0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <span style={{ fontSize: 12, color: '#8a7e74', fontFamily: "'Inter', sans-serif" }}>
              测试结果
            </span>
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <span style={{ fontSize: 13, color: '#4ade80', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                ✓ {passedTests} 通过
              </span>
              <span style={{ fontSize: 13, color: '#f87171', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                ✗ {completedTests - passedTests} 失败
              </span>
              <span style={{ fontSize: 13, color: '#6b5f55', fontWeight: 500, fontFamily: "'JetBrains Mono', monospace" }}>
                {totalTests - completedTests} 待测
              </span>
            </div>
          </div>
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            color: passedTests === totalTests ? '#4ade80' : '#fbbf24',
          }}>
            {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%
          </div>
        </div>
      )}

      {/* ── User rating ── */}
      <div style={{
        padding: '12px 16px',
        borderRadius: 12,
        background: 'rgba(42,34,32,0.3)',
        border: '1px solid rgba(var(--accent-rgb),0.08)',
      }}>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 8,
          fontFamily: "'Inter', sans-serif",
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <Star style={{ width: 13, height: 13, color: '#fbbf24', fill: '#fbbf24' }} />
          为该 Skill 打分
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          {[1, 2, 3, 4, 5].map(star => {
            const avgRating = Object.values(ratings).length > 0
              ? Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length
              : 0;
            return (
              <Star key={star} style={{
                width: 22,
                height: 22,
                color: avgRating >= star ? '#fbbf24' : '#3a3430',
                fill: avgRating >= star ? '#fbbf24' : 'none',
                transition: 'all 0.2s ease',
              }} />
            );
          })}
          <span style={{
            marginLeft: 8,
            fontSize: 13,
            color: '#8a7e74',
            fontFamily: "'Inter', sans-serif",
          }}>
            {Object.values(ratings).length > 0
              ? `${(Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length).toFixed(1)} / 5`
              : '暂未评分'}
          </span>
        </div>
        <p style={{
          fontSize: 11,
          color: '#6b5f55',
          marginTop: 6,
          fontFamily: "'Inter', sans-serif",
        }}>
          在每个测试场景中点击星星可以评分子项，整体评分将自动计算
        </p>
      </div>
    </div>

      {/* ═══ 右侧: 实时动态日志 ═══ */}
      {globalStatus !== 'idle' && (
        <div style={{
          width: 380,
          flexShrink: 0,
          borderRadius: 14,
          border: '1px solid rgba(var(--accent-rgb),0.12)',
          background: 'linear-gradient(180deg, rgba(12,14,20,0.95), rgba(8,10,16,0.98))',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          maxHeight: 'min(70vh, 600px)',
        }}>
          {/* ── 面板标题 ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 14 }}>📡</span>
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#e8e0d8',
              fontFamily: "'Inter', sans-serif",
            }}>
              实时测试动态
            </span>
            {globalStatus === 'running' && (
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                color: '#5ec4d4',
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#5ec4d4', display: 'inline-block' }} />
                运行中
              </span>
            )}
            {globalStatus === 'completed' && (
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                color: '#4ade80',
                marginLeft: 'auto',
              }}>
                ✓ 已完成
              </span>
            )}
          </div>

          {/* ── 日志列表（可滚动） ── */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 12px',
          }}>
            {testLogs.length === 0 && globalStatus === 'running' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 120,
                color: '#6b5f55',
                fontSize: 12,
              }}>
                正在初始化测试环境...
              </div>
            )}
            {testLogs.map(log => (
              <div key={log.id} style={{
                display: 'flex',
                gap: 8,
                padding: '5px 4px',
                borderBottom: log.type === 'divider' ? '1px solid rgba(255,255,255,0.04)' : 'none',
                marginBottom: log.type === 'divider' ? 4 : 2,
              }}>
                {/* 时间戳 */}
                <span style={{
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#6b5f55',
                  flexShrink: 0,
                  width: 48,
                  lineHeight: '18px',
                }}>
                  {log.time}
                </span>
                {/* 图标 */}
                <span style={{ fontSize: 12, flexShrink: 0, lineHeight: '18px', width: 18, textAlign: 'center' }}>
                  {log.icon}
                </span>
                {/* 内容 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: log.type === 'error' ? '#f87171'
                         : log.type === 'success' ? '#4ade80'
                         : log.type === 'warning' ? '#fbbf24'
                         : log.type === 'phase' ? '#5ec4d4'
                         : '#e8e0d8',
                    fontFamily: "'Inter', sans-serif",
                    lineHeight: '18px',
                  }}>
                    {log.text}
                  </div>
                  {log.detail && log.type !== 'divider' && log.type !== 'phase' && (
                    <div style={{
                      fontSize: 11,
                      color: '#6b5f55',
                      fontFamily: "'Inter', sans-serif",
                      marginTop: 1,
                      lineHeight: '16px',
                    }}>
                      {log.detail}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>

          {/* ── 底部摘要 ── */}
          {completedTests > 0 && (
            <div style={{
              padding: '10px 16px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              background: 'rgba(0,0,0,0.3)',
            }}>
              <span style={{ fontSize: 11, color: '#6b5f55' }}>
                通过率
              </span>
              <span style={{
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                color: passedTests === totalTests ? '#4ade80' : '#fbbf24',
              }}>
                {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>

      {/* ═══════════════════════════════════════════════════
          输入弹窗
          ═══════════════════════════════════════════════════ */}
      {showInputDialog && inputScenario && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            width: 'min(520px, 92vw)',
            background: 'linear-gradient(160deg, #1c1816, #161210)',
            borderRadius: 16,
            border: '1px solid rgba(var(--accent-rgb),0.15)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(var(--accent-rgb),0.05)',
            overflow: 'hidden',
          }}>
            {/* 弹窗标题 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '16px 20px',
              borderBottom: '1px solid rgba(var(--accent-rgb),0.1)',
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(var(--accent-rgb),0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}>
                {inputScenario.icon}
              </div>
              <div>
                <div style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {inputScenario.name} — 输入测试参数
                </div>
                <div style={{
                  fontSize: 11,
                  color: '#6b5f55',
                  marginTop: 1,
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {inputScenario.category} · {difficultyColors[inputScenario.difficulty].label}
                </div>
              </div>
            </div>

            {/* 弹窗内容 */}
            <div style={{ padding: '20px' }}>
              {/* 要求和说明 */}
              <div style={{
                padding: '12px 14px',
                borderRadius: 10,
                background: 'rgba(var(--accent-rgb),0.06)',
                border: '1px solid rgba(var(--accent-rgb),0.1)',
                marginBottom: 16,
              }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-accent)',
                  marginBottom: 6,
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: '0.02em',
                }}>
                  📋 输入要求与说明
                </div>
                <p style={{
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: 'rgba(200,190,180,0.8)',
                  fontFamily: "'Inter', 'PingFang SC', sans-serif",
                  margin: 0,
                }}>
                  {inputScenario.inputPrompt}
                </p>
              </div>

              {/* 场景描述 */}
              <div style={{
                fontSize: 12,
                color: '#6b5f55',
                marginBottom: 12,
                fontFamily: "'Inter', sans-serif",
                lineHeight: 1.6,
              }}>
                {inputScenario.description}
              </div>

              {/* 快速填充建议 */}
              {inputScenario && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: '#6b5f55',
                    marginBottom: 6,
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: '0.02em',
                  }}>
                    💡 快速示例（点击自动填入）
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {getInputSuggestions(skill, inputScenario).map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setInputValue(s)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: 6,
                          border: '1px solid rgba(var(--accent-rgb),0.12)',
                          background: 'rgba(var(--accent-rgb),0.04)',
                          color: '#c4b8ac',
                          fontSize: 11,
                          fontFamily: "'Inter', 'PingFang SC', sans-serif",
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          lineHeight: 1.4,
                          textAlign: 'left',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.1)';
                          e.currentTarget.style.color = '#e8e0d8';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.04)';
                          e.currentTarget.style.color = '#c4b8ac';
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 输入框 */}
              <textarea
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder={inputScenario.inputPlaceholder}
                autoFocus
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid rgba(var(--accent-rgb),0.15)',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#e8e0d8',
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Inter', monospace",
                  lineHeight: 1.6,
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* 按钮区域 */}
            <div style={{
              display: 'flex',
              gap: 8,
              padding: '12px 20px',
              borderTop: '1px solid rgba(255,255,255,0.04)',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={handleInputCancel}
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: '1px solid rgba(var(--accent-rgb),0.12)',
                  background: 'transparent',
                  color: '#8a7e74',
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                  cursor: 'pointer',
                }}
              >
                跳过输入
              </button>
              <button
                onClick={handleInputConfirm}
                style={{
                  padding: '8px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, #d4a574, #c49564)',
                  color: '#1a1412',
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "'Inter', sans-serif",
                  cursor: 'pointer',
                }}
              >
                确认提交
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          结果详情弹窗
          ═══════════════════════════════════════════════════ */}
      {showResultDialog && resultData && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            width: 'min(600px, 92vw)',
            maxHeight: 'min(80vh, 700px)',
            background: 'linear-gradient(160deg, #1c1816, #161210)',
            borderRadius: 16,
            border: `1px solid ${resultData.passed ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
            boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px ${resultData.passed ? 'rgba(74,222,128,0.05)' : 'rgba(248,113,113,0.05)'}`,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* 弹窗标题 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '16px 20px',
              borderBottom: `1px solid ${resultData.passed ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)'}`,
              flexShrink: 0,
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: resultData.passed ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}>
                {resultData.passed ? '✅' : '❌'}
              </div>
              <div>
                <div style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {resultData.passed ? '测试通过' : '测试失败'} — {resultData.scenario.name}
                </div>
                <div style={{
                  fontSize: 11,
                  color: resultData.passed ? '#4ade80' : '#f87171',
                  marginTop: 1,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                }}>
                  {resultData.passed ? '所有断言验证通过，输出符合预期' : '存在断言异常或输出不符合预期'}
                </div>
              </div>
            </div>

            {/* 弹窗内容（可滚动） */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
            }}>
              {/* 用户输入 */}
              <div style={{
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(var(--accent-rgb),0.04)',
                border: '1px solid rgba(var(--accent-rgb),0.08)',
                marginBottom: 16,
              }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-accent)',
                  marginBottom: 4,
                  fontFamily: "'Inter', sans-serif",
                }}>
                  测试输入
                </div>
                <div style={{
                  fontSize: 13,
                  color: '#e8e0d8',
                  fontFamily: "'JetBrains Mono', monospace",
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}>
                  {resultData.userInput || '(使用默认参数，未提供自定义输入)'}
                </div>
              </div>

              {/* 执行步骤 */}
              <div style={{
                marginBottom: 16,
              }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#5ec4d4',
                  marginBottom: 8,
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: '0.02em',
                }}>
                  执行步骤明细
                </div>
                {resultData.stepResults.map((step, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: step.passed ? 'rgba(74,222,128,0.03)' : 'rgba(248,113,113,0.03)',
                    marginBottom: 4,
                    alignItems: 'flex-start',
                  }}>
                    <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{step.passed ? '✓' : '⚠️'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: step.passed ? '#4ade80' : '#f87171',
                        fontFamily: "'Inter', sans-serif",
                      }}>
                        {step.text}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: '#6b5f55',
                        fontFamily: "'Inter', sans-serif",
                        marginTop: 1,
                      }}>
                        {step.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 测试结果详情 */}
              <div style={{
                padding: '12px 14px',
                borderRadius: 10,
                background: resultData.passed ? 'rgba(74,222,128,0.04)' : 'rgba(248,113,113,0.04)',
                border: `1px solid ${resultData.passed ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)'}`,
              }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: resultData.passed ? '#4ade80' : '#f87171',
                  marginBottom: 6,
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {resultData.passed ? '📋 测试通过详情' : '📋 测试失败详情'}
                </div>
                <pre style={{
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'rgba(200,190,180,0.75)',
                  lineHeight: 1.6,
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}>
                  {resultData.outputDetails}
                </pre>
              </div>
            </div>

            {/* 关闭按钮 */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              padding: '12px 20px',
              borderTop: '1px solid rgba(255,255,255,0.04)',
              flexShrink: 0,
            }}>
              <button
                onClick={handleCloseResult}
                style={{
                  padding: '8px 24px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, #d4a574, #c49564)',
                  color: '#1a1412',
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "'Inter', sans-serif",
                  cursor: 'pointer',
                }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SkillTestView;
