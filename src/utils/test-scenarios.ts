import type { SkillMeta } from '../types';
import { CATEGORY_MAP, getPlatformCompat } from './skill-content';

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  command: string;
  steps: string[];
  expectedOutput: string;
  visualEffect: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  requiresInput?: boolean;
  inputPrompt?: string;
  inputPlaceholder?: string;
}

export function generateTestScenarios(skill: SkillMeta): TestScenario[] {
  const tags = skill.tags.map(t => t.toLowerCase());
  const scenarios: TestScenario[] = [];
  const category = Object.entries(CATEGORY_MAP).find(([key]) =>
    (skill.tags[0]?.toLowerCase() || '').includes(key)
  )?.[1] || '通用工具';
  const platforms = getPlatformCompat(skill.tags);

  // Base scenario 1: Installation verification
  scenarios.push({
    id: 'install',
    name: '安装验证',
    description: `验证 ${skill.name} 是否正确安装，并确认 SKILL.md 文件已被 AI 工具正确识别。这是使用该 Skill 的第一步。`,
    category: '基础验证',
    icon: '📦',
    command: `# 检查 SKILL.md 是否在正确路径\nls -la skills/${skill.name}/SKILL.md\n\n# 或在 AI 工具中执行:\n/load-skill ${skill.name}`,
    steps: [
      `将 ${skill.name} 的 SKILL.md 文件放入 AI 工具的 skills 目录`,
      '重启 AI 工具或执行重载命令使其识别新 Skill',
      '在对话中测试 Skill 是否可以被正常调用',
      '检查是否有版本冲突或依赖缺失',
    ],
    expectedOutput: `✓ Skill "${skill.name}" v${skill.version} 加载成功\n✓ 兼容模式：${platforms.slice(0, 3).join(', ')} 等平台\n✓ 已检测到 ${skill.tags.length} 个关联标签\n✓ 已注册 ${skill.features?.length || 3}+ 个功能接口`,
    visualEffect: `${skill.name} 安装完成后，AI 工具会自动发现并加载该 Skill。您可以在对话中直接引用 Skill 的功能，AI 将根据 SKILL.md 中的定义提供相应的能力支持。`,
    difficulty: 'beginner',
  });

  // Scenario 2: Core functionality test
  scenarios.push({
    id: 'core',
    name: '核心功能测试',
    description: `测试 ${skill.name} 的核心功能是否正常工作。根据 Skill 的类型和标签，执行对应的核心用例。`,
    category: '功能验证',
    icon: '⚡',
    command: `# 核心功能调用示例\n# 根据 ${category} 场景执行:\n\n/use ${skill.name} --task "执行核心功能"\n\n# 或直接在对话中:\n请帮我使用 ${skill.name} 完成以下任务：\n[在此处描述您的具体需求]`,
    steps: [
      '在 AI 工具中加载该 Skill',
      '执行核心功能测试命令',
      '观察 AI 是否正确理解并执行 Skill 指令',
      '验证输出结果的完整性和准确性',
    ],
    expectedOutput: `✓ ${skill.name} 核心功能启动成功\n✓ AI 正确识别了 ${skill.tags.slice(0, 3).join(', ')} 相关指令\n✓ 输出格式符合 SKILL.md 规范\n✓ 功能执行完成，耗时 < 5s`,
    visualEffect: `该 Skill 的核心功能将根据其定义自动执行。${skill.description ? `根据项目描述：${skill.description.substring(0, 100)}...` : ''}AI 会在执行过程中展示详细的步骤和中间结果。`,
    difficulty: 'intermediate',
    requiresInput: true,
    inputPrompt: '请输入要测试的核心功能描述或命令。系统将根据您的输入模拟执行对应的功能测试。',
    inputPlaceholder: '例如：帮我分析项目代码结构，并给出优化建议',
  });

  // Scenario 3: Multi-platform compatibility
  scenarios.push({
    id: 'compat',
    name: '多平台兼容性测试',
    description: `测试 ${skill.name} 在多个 AI 编码代理平台上的兼容性和行为一致性。确保 SKILL.md 标准跨平台工作正常。`,
    category: '兼容性',
    icon: '🔄',
    command: `# 在不同平台加载 Skill\n\n# Claude Code:\n/claude/skills/${skill.name}/SKILL.md\n\n# Cursor:\n.cursor/skills/${skill.name}/SKILL.md\n\n# Codex CLI:\n~/.codex/skills/${skill.name}/SKILL.md`,
    steps: [
      '在 Claude Code 中加载并测试 Skill',
      '在 Cursor 中加载并测试 Skill',
      '在 Codex CLI 中加载并测试 Skill',
      '比对三个平台的输出结果是否一致',
    ],
    expectedOutput: `✓ Claude Code: 功能正常 (${platforms.includes('Claude Code') ? '原生支持' : '兼容模式'})\n✓ Cursor: 功能正常 (${platforms.includes('Cursor') ? '原生支持' : '兼容模式'})\n✓ Codex CLI: 功能正常 (${platforms.includes('Codex CLI') ? '原生支持' : '兼容模式'})\n✓ 跨平台输出一致性: 100%`,
    visualEffect: `SKILL.md 标准确保 ${skill.name} 在所有主流 AI 编码代理工具中表现一致。无论您使用 Claude Code、Cursor 还是 Codex CLI，都能获得相同的功能和输出质量。`,
    difficulty: 'advanced',
  });

  // Scenario 4: Use case scenarios (specific to the skill's domain)
  const useCaseScenarios = generateUseCaseScenarios(skill, category, tags);
  scenarios.push(...useCaseScenarios);

  // Scenario 5: Error handling
  scenarios.push({
    id: 'error',
    name: '错误处理与边界测试',
    description: `测试 ${skill.name} 在异常输入和边界条件下的行为，确保其具有良好的错误处理和恢复能力。`,
    category: '健壮性',
    icon: '🛡️',
    command: `# 错误场景测试\n\n# 1. 无效参数输入\n/use ${skill.name} --invalid-param\n\n# 2. 超长输入\n/use ${skill.name} --input "$(python -c 'print(\"A\"*100000)')"\n\n# 3. 空输入\n/use ${skill.name} --input ""`,
    steps: [
      '传入无效参数，验证错误提示是否清晰',
      '传入超出处理能力的输入，验证是否有容量限制保护',
      '传入空输入，验证是否有默认处理逻辑',
      '模拟网络中断等异常场景，验证恢复能力',
    ],
    expectedOutput: `✓ 无效参数：返回清晰的错误提示，标明可用参数列表\n✓ 超长输入：自动截断或返回容量超限提示，不崩溃\n✓ 空输入：返回默认结果或友好的提示信息\n✓ 异常恢复：支持重试机制，状态不丢失`,
    visualEffect: `良好的错误处理是生产环境使用的关键。${skill.name} 在各类异常场景下均能提供清晰的反馈，帮助用户快速定位和解决问题。`,
    difficulty: 'advanced',
  });

  return scenarios;
}

export function generateUseCaseScenarios(skill: SkillMeta, category: string, tags: string[]): TestScenario[] {
  const scenarios: TestScenario[] = [];

  // AI / Agent related
  if (tags.some(t => ['ai', 'llm', 'agent', 'rag'].includes(t))) {
    scenarios.push({
      id: 'ai-workflow',
      name: 'AI 工作流集成',
      description: `测试 ${skill.name} 在 AI 工作流中的集成效果。验证其能否与 LLM 调用、RAG 检索等 AI 能力无缝配合。`,
      category: 'AI 应用',
      icon: '🤖',
      command: `# AI 工作流测试\n\n/use ${skill.name} --mode workflow\n\n# 示例：结合 RAG 的知识检索\n请使用 ${skill.name} 帮我:\n1. 从知识库中检索相关信息\n2. 基于检索结果生成回答\n3. 格式化输出结果`,
      steps: [
        '在 AI 工作流中加载该 Skill',
        '执行多步骤复合任务',
        '验证各步骤之间的数据传递是否正确',
        '检查最终输出是否满足业务需求',
      ],
      expectedOutput: `✓ AI 工作流启动成功\n✓ RAG 检索: 找到 ${Math.floor(Math.random() * 20 + 5)} 条相关结果\n✓ LLM 调用成功，生成完整回答\n✓ 输出格式正确，可直接使用\n✓ 端到端延迟: < 10s`,
      visualEffect: `${skill.name} 能无缝集成到 AI 工作流中，自动完成知识检索、LLM 调用和结果格式化等步骤。用户只需描述需求，AI 会自动编排执行流程。`,
      difficulty: tags.includes('multi-agent') ? 'advanced' : 'intermediate',
      requiresInput: true,
      inputPrompt: '请输入您希望 AI 工作流处理的具体任务描述，例如知识检索、内容生成或数据分析需求。',
      inputPlaceholder: '例如：从技术文档中检索关于 React Hooks 的最佳实践，并总结成 5 条建议',
    });
  }

  // Automation related
  if (tags.some(t => ['automation', 'cli', 'tool', 'devops'].includes(t))) {
    scenarios.push({
      id: 'auto-pipeline',
      name: '自动化流水线测试',
      description: `测试 ${skill.name} 在自动化流水线中的执行效果，验证其能否高效完成重复性任务并输出可靠结果。`,
      category: '自动化',
      icon: '⚙️',
      command: `# 自动化流水线测试\n\n# 配置自动化任务\n/use ${skill.name} --auto --interval daily\n\n# 指定输出格式\n/use ${skill.name} --output json --save ./results/\n\n# 批量处理\n/use ${skill.name} --batch ./input/ --parallel 4`,
      steps: [
        '配置自动化任务参数',
        '启动自动化执行流程',
        '监控执行过程中的日志输出',
        '验证结果的完整性和正确性',
      ],
      expectedOutput: `✓ 自动化流水线配置成功\n✓ 任务队列: 15 个项目\n✓ 并行执行: 4 个并发\n✓ 平均处理时间: 2.3s/项\n✓ 成功率: 98.7%\n✓ 输出已保存至 ./results/`,
      visualEffect: `${skill.name} 的自动化能力可以大幅提升工作效率。配置一次后即可定期自动执行，减少人工干预。支持并行处理，适合大规模批量任务。`,
      difficulty: 'intermediate',
    });
  }

  // Data related
  if (tags.some(t => ['data', 'scraper', 'database', 'analysis'].includes(t))) {
    scenarios.push({
      id: 'data-proc',
      name: '数据处理与分析',
      description: `测试 ${skill.name} 在数据处理和分析场景中的表现，验证其数据采集、清洗、转换和分析能力。`,
      category: '数据处理',
      icon: '📊',
      command: `# 数据处理测试\n\n# 数据采集\n/use ${skill.name} --source "https://example.com/data"\n\n# 数据转换\n/use ${skill.name} --transform --format json\n\n# 数据分析\n/use ${skill.name} --analyze --metrics "count, avg, sum"`,
      steps: [
        '配置数据源并执行采集',
        '对采集的数据进行清洗和转换',
        '执行数据分析任务',
        '导出分析结果',
      ],
      expectedOutput: `✓ 数据源连接成功\n✓ 采集记录: 1,247 条\n✓ 数据清洗完成，去重 23 条，修复格式 15 条\n✓ 分析完成: 平均值 85.3，中位数 92.0\n✓ 结果已生成可视化报告`,
      visualEffect: `${skill.name} 的数据处理能力支持从采集到分析的全流程。自动清洗和格式转换确保数据质量，内置分析引擎可快速生成有价值的业务洞察。`,
      difficulty: 'intermediate',
      requiresInput: true,
      inputPrompt: '请输入数据源地址或文件路径，系统将模拟执行数据采集、清洗和分析流程。',
      inputPlaceholder: '例如：https://example.com/api/data 或 ./data/source.csv',
    });
  }

  // Security related
  if (tags.some(t => ['security', 'pentest', 'audit'].includes(t))) {
    scenarios.push({
      id: 'security-scan',
      name: '安全扫描测试',
      description: `测试 ${skill.name} 的安全检测能力，验证其能否发现常见的安全漏洞和配置问题。`,
      category: '安全检测',
      icon: '🔒',
      command: `# 安全扫描测试\n\n# 快速扫描\n/use ${skill.name} --quick-scan ./target/\n\n# 全面审计\n/use ${skill.name} --full-audit --level critical\n\n# 生成报告\n/use ${skill.name} --report --format pdf`,
      steps: [
        '配置扫描目标和参数',
        '执行安全扫描',
        '审查发现的漏洞和问题',
        '生成安全审计报告',
      ],
      expectedOutput: `✓ 扫描目标: 1,536 个文件\n✓ 发现: 12 个安全项\n   - 高危: 2\n   - 中危: 5\n   - 低危: 5\n✓ 已提供修复建议\n✓ 报告已生成: security-report-2026-06-15.pdf`,
      visualEffect: `${skill.name} 的安全扫描能力覆盖常见的安全检测场景，从代码审计到配置检查，提供全面的安全评估和修复建议。`,
      difficulty: 'advanced',
    });
  }

  // General fallback scenario
  if (scenarios.length === 0) {
    scenarios.push({
      id: 'general-use',
      name: '通用功能集成测试',
      description: `测试 ${skill.name} 在日常开发中的通用功能集成效果。验证其能否作为 AI 编码代理的有效补充，提升开发效率。`,
      category: '通用测试',
      icon: '🛠️',
      command: `# 通用功能测试\n\n# 加载 Skill\n/use ${skill.name}\n\n# 获取帮助信息\n/use ${skill.name} --help\n\n# 执行默认任务\n/use ${skill.name} --task "分析当前项目结构并提供优化建议"`,
      steps: [
        '加载 Skill 并获取帮助文档',
        '执行默认分析任务',
        '检查输出质量',
        '评估对开发效率的提升效果',
      ],
      expectedOutput: `✓ ${skill.name} 加载成功 (v${skill.version})\n✓ 帮助文档: 包含 ${skill.tags.length} 个标签说明和功能列表\n✓ 任务执行完成\n✓ 输出质量评分: 8.5/10\n✓ 推荐使用场景: ${category} 相关任务`,
      visualEffect: `${skill.name} 作为 AI 编码代理的 Skill 插件，在日常开发中提供智能辅助。通过标准化的 SKILL.md 接口，AI 可以快速理解并使用该 Skill 的功能。${skill.description ? `\n\n项目描述：${skill.description}` : ''}`,
      difficulty: 'beginner',
      requiresInput: true,
      inputPrompt: '请输入您希望该 Skill 协助完成的具体任务或问题描述。',
      inputPlaceholder: '例如：分析当前项目结构并提供优化建议，或生成单元测试代码',
    });
  }

  return scenarios;
}
