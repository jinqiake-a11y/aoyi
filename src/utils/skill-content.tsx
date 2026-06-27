import type { ReactNode } from 'react';
import { BookOpen, Zap, Tag, Activity, TrendingUp, FileText, Code, Package, Globe } from 'lucide-react';
import type { SkillMeta } from '../types';

/* ═══════════════════════════════════════════════════
   Enhanced Chinese Content Generator
   ═══════════════════════════════════════════════════ */

// ── Tag category mapping (Chinese) ──
const CATEGORY_MAP: Record<string, string> = {
  ai: 'AI / 大模型',
  llm: '大语言模型',
  'machine-learning': '机器学习',
  'deep-learning': '深度学习',
  agent: '智能体',
  'multi-agent': '多智能体',
  rag: 'RAG 检索增强',
  tool: '开发工具',
  automation: '自动化工具',
  data: '数据处理',
  scraper: '数据采集',
  web: 'Web 开发',
  security: '安全工具',
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  skill: 'AI Skill 框架',
  mcp: 'MCP 服务',
  claude: 'Claude 集成',
  cursor: 'Cursor 集成',
  codex: 'Codex 集成',
  devops: 'DevOps',
  database: '数据库',
  testing: '测试工具',
  cli: '命令行工具',
  note: '笔记/文档',
  design: '设计工具',
  game: '游戏',
};

// ── Tag Chinese explanation ──
const TAG_EXPLANATIONS: Record<string, string> = {
  ai: '人工智能相关，包含机器学习、深度学习、自然语言处理等 AI 技术领域',
  agent: '智能体（Agent）相关，能够自主执行任务的 AI 程序单元',
  'multi-agent': '多智能体协作系统，多个 AI Agent 协同完成复杂任务',
  llm: '大语言模型集成，支持 GPT、Claude、文心一言等大模型调用',
  rag: '检索增强生成，结合外部知识库提升 AI 回答的准确性和时效性',
  claude: '与 Claude AI 深度集成，支持 Claude Code、Claude Desktop 等',
  mcp: 'Model Context Protocol 服务，标准化 AI 与外部工具通信',
  skill: 'SKILL.md 标准化技能包，可在多种 AI 工具间复用',
  automation: '工作流自动化，自动完成重复性任务',
  security: '网络安全与渗透测试，支持授权安全评估',
  data: '数据处理与分析，支持多种数据格式和来源',
  web: 'Web 开发与 API 集成',
  python: 'Python 语言实现，生态丰富',
  typescript: 'TypeScript 实现，类型安全',
  devops: '开发运维一体化，CI/CD 相关',
  testing: '软件测试与质量保障',
  cli: '命令行界面工具，适合终端操作',
  tool: '通用开发工具，提升开发效率',
  design: '设计相关，UI/UX 设计系统',
};

// ── Programming language color map ──
const LANG_COLORS: Record<string, string> = {
  python: '#3572A5',
  javascript: '#f1e05a',
  typescript: '#3178c6',
  go: '#00ADD8',
  rust: '#dea584',
  java: '#b07219',
  'c#': '#178600',
  ruby: '#701516',
  php: '#4F5D95',
  swift: '#ffac45',
  kotlin: '#A97BFF',
  scala: '#c22d40',
  shell: '#89e051',
  dockerfile: '#384d54',
};

// ── Age badge ──
function getAgeBadge(createdAt: string): { label: string; color: string } {
  const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);
  if (days < 7) return { label: '刚刚上线', color: '#4ade80' };
  if (days < 30) return { label: '本月新星', color: '#5ec4d4' };
  if (days < 90) return { label: '近三个月', color: '#d4a574' };
  if (days < 365) return { label: '半年以上', color: '#a78bfa' };
  return { label: '经典型项目', color: '#fbbf24' };
}

// ── Popularity level ──
function getPopularityLevel(stars: number): { label: string; color: string; pct: number } {
  if (stars >= 10000) return { label: '现象级项目', color: '#fbbf24', pct: 100 };
  if (stars >= 5000) return { label: '非常热门', color: '#fb923c', pct: 85 };
  if (stars >= 1000) return { label: '热门项目', color: '#4ade80', pct: 65 };
  if (stars >= 100) return { label: '小受欢迎', color: '#5ec4d4', pct: 40 };
  return { label: '新兴项目', color: '#a78bfa', pct: 20 };
}

// ── Platform compatibility from tags ──
function getPlatformCompat(tags: string[]): string[] {
  const map: Record<string, string> = {
    claude: 'Claude Code',
    cursor: 'Cursor',
    codex: 'Codex CLI',
    windsurf: 'Windsurf',
    gemini: 'Gemini CLI',
    copilot: 'GitHub Copilot',
    cline: 'Cline',
    kiro: 'Kiro',
    opencode: 'OpenCode',
  };
  const found: string[] = [];
  for (const t of tags) {
    const lower = t.toLowerCase();
    for (const [key, name] of Object.entries(map)) {
      if (lower.includes(key) && !found.includes(name)) found.push(name);
    }
  }
  return found.length > 0 ? found : ['Claude Code', 'Cursor', 'Codex CLI', '及其他 60+ 平台'];
}

// ── Main content generator ──
function generateChineseContent(skill: SkillMeta, readmeText?: string) {
  const sections: { title: string; content: ContentLine[]; icon?: ReactNode }[] = [];

  const primaryTag = skill.tags[0]?.toLowerCase() || '';
  const category = Object.entries(CATEGORY_MAP).find(([key]) =>
    primaryTag.includes(key)
  )?.[1] || '通用开发工具';

  const ageBadge = getAgeBadge(skill.createdAt);
  const popLevel = getPopularityLevel(skill.downloadCount);
  const platforms = getPlatformCompat(skill.tags);
  const daysSinceUpdate = Math.floor((Date.now() - new Date(skill.updatedAt).getTime()) / 86400000);
  const daysSinceCreate = Math.floor((Date.now() - new Date(skill.createdAt).getTime()) / 86400000);

  // ── Section 1: Project Overview (richer) ──
  sections.push({
    title: '项目概览',
    icon: <BookOpen style={{ width: 16, height: 16 }} />,
    content: [
      { type: 'paragraph', text: `${skill.name} 是一款基于 SKILL.md 开放标准的 ${category}，由开发者 ${skill.author} 创建并维护。该项目当前在 GitHub 上已获得 ${skill.downloadCount.toLocaleString()} 颗 Star，属于 ${popLevel.label}。` },
      { type: 'spacer' },
      { type: 'paragraph', text: `该项目创建于 ${new Date(skill.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}，${
        daysSinceCreate < 30 ? '是一个全新上线的项目，正处于快速迭代阶段。' :
        daysSinceCreate < 90 ? '上线至今约三个月，社区关注度正在上升。' :
        daysSinceCreate < 365 ? '已运营半年以上，功能趋于稳定成熟。' :
        '是一个经过时间检验的成熟项目，拥有稳定的用户基础和社区生态。'
      }` },
      { type: 'spacer' },
      { type: 'paragraph', text: `兼容平台：${platforms.join('、')}。遵循 SKILL.md 通用标准，可在不同 AI 编码代理工具之间无缝迁移使用。` },
      { type: 'spacer' },
      { type: 'paragraph', text: skill.description || '' },
    ],
  });

  // ── Section 1.5: Quick Start Guide (new) ──
  {
    // Generate category-specific example prompts
    const tags = skill.tags.map(t => t.toLowerCase());
    const examplePrompts: { command: string; description: string }[] = [];

    if (tags.some(t => ['ai', 'llm', 'agent', 'rag'].includes(t))) {
      examplePrompts.push({
        command: `/use ${skill.name} --task "分析这份文档，提取关键信息并总结成报告"`,
        description: '让 AI 自动分析文档内容，提取要点并生成结构化报告',
      });
      examplePrompts.push({
        command: `/use ${skill.name} --mode rag --query "如何优化数据库查询性能？"`,
        description: '结合知识库进行 RAG 检索增强生成，获取精准答案',
      });
    }
    if (tags.some(t => ['data', 'scraper', 'database', 'analysis'].includes(t))) {
      examplePrompts.push({
        command: `/use ${skill.name} --source "https://example.com/data" --format json`,
        description: '从指定数据源采集数据，自动清洗并输出为 JSON 格式',
      });
      examplePrompts.push({
        command: `/use ${skill.name} --analyze --metrics "count, avg, sum" --output ./report.json`,
        description: '对已有数据执行多维分析，计算关键指标并导出结果',
      });
    }
    if (tags.some(t => ['automation', 'cli', 'tool', 'devops'].includes(t))) {
      examplePrompts.push({
        command: `/use ${skill.name} --auto --interval daily --task "清理临时文件并生成日志"`,
        description: '配置自动化任务，按每日频率定时执行清理和日志生成',
      });
    }
    if (tags.some(t => ['security', 'pentest', 'audit'].includes(t))) {
      examplePrompts.push({
        command: `/use ${skill.name} --quick-scan ./project/ --level critical`,
        description: '对项目目录执行快速安全扫描，检测高危漏洞',
      });
      examplePrompts.push({
        command: `/use ${skill.name} --full-audit --format pdf`,
        description: '执行全面安全审计并生成 PDF 格式的审计报告',
      });
    }
    if (tags.some(t => ['web', 'api'].includes(t))) {
      examplePrompts.push({
        command: `/use ${skill.name} --endpoint "https://api.example.com" --method GET`,
        description: '调用外部 API 接口，获取并处理返回数据',
      });
    }

    // Fallback general examples
    if (examplePrompts.length < 2) {
      examplePrompts.push({
        command: `/use ${skill.name} --task "帮我分析当前项目结构并提供优化建议"`,
        description: '让 Skill 自动分析项目结构，给出架构优化建议',
      });
      examplePrompts.push({
        command: `/use ${skill.name} --help`,
        description: '查看该 Skill 的完整帮助文档和可用参数列表',
      });
    }

    const platNames = getPlatformCompat(skill.tags);
    const quickStartLines: ContentLine[] = [
      { type: 'paragraph', text: `${skill.name} 的标准调用方式如下，您可以在对话中直接使用：` },
      { type: 'spacer' },
      { type: 'code', text: `/use ${skill.name} --task "请描述您的需求"` },
      { type: 'spacer' },
      { type: 'paragraph', text: '以下是一些常用的示例，点击即可参考使用：' },
      { type: 'spacer' },
    ];

    for (const ex of examplePrompts.slice(0, 4)) {
      quickStartLines.push({ type: 'example', command: ex.command, description: ex.description });
    }

    quickStartLines.push({ type: 'spacer' });
    quickStartLines.push({ type: 'paragraph', text: `支持平台：${platNames.join('、')}。在不同平台中，调用方式可能略有差异，请参考对应平台的 SKILL.md 加载规范。` });

    sections.splice(1, 0, {
      title: '快速上手指南',
      icon: <Zap style={{ width: 16, height: 16 }} />,
      content: quickStartLines,
    });
  }

  // ── Section 2: Tag Analysis (new) ──
  if (skill.tags.length > 0) {
    const tagLines: ContentLine[] = [
      { type: 'paragraph', text: `该 Skill 共标记了 ${skill.tags.length} 个技术标签，覆盖以下领域：` },
      { type: 'spacer' },
    ];
    const explained: string[] = [];
    const unexplained: string[] = [];
    for (const tag of skill.tags) {
      const lower = tag.toLowerCase();
      const exp = TAG_EXPLANATIONS[lower];
      if (exp) {
        explained.push(`${tag}：${exp}`);
      } else {
        unexplained.push(tag);
      }
    }
    // Show explained tags
    for (const line of explained.slice(0, 6)) {
      const [name, ...descParts] = line.split('：');
      tagLines.push({ type: 'tagLine', label: name, text: descParts.join('：') });
    }
    if (explained.length > 6) {
      tagLines.push({ type: 'paragraph', text: `...及其他 ${explained.length - 6} 个标签说明` });
    }
    if (unexplained.length > 0) {
      tagLines.push({ type: 'spacer' });
      tagLines.push({ type: 'paragraph', text: `其他标签：${unexplained.join('、')}` });
    }
    sections.push({
      title: '标签分类解析',
      icon: <Tag style={{ width: 16, height: 16 }} />,
      content: tagLines,
    });
  }

  // ── Section 3: Core Features with richer content ──
  const featureLines: ContentLine[] = [];
  if (skill.features && skill.features.length > 0) {
    featureLines.push({ type: 'paragraph', text: `该 Skill 共包含 ${skill.features.length} 项核心功能特性：` });
    featureLines.push({ type: 'spacer' });
    for (const f of skill.features) {
      featureLines.push({ type: 'feature', name: f.name, text: f.description });
      featureLines.push({ type: 'spacer' });
    }
  } else {
    // Auto-generate detailed features based on tags and data
    const autoGenFeatures: { name: string; desc: string }[] = [
      {
        name: 'SKILL.md 标准兼容',
        desc: `严格遵循 SKILL.md 开放标准格式，确保与 Claude Code、Cursor、Codex CLI、Windsurf、Gemini CLI 等 ${platforms.length}+ 主流 AI 编码代理工具完全兼容。`,
      },
      {
        name: `${category}场景优化`,
        desc: `针对 ${category} 场景进行深度优化，提供开箱即用的 AI 能力集成。${skill.tags.includes('automation') ? '包含完整的自动化工作流编排。' : ''}${skill.tags.includes('data') ? '支持多种数据源接入和处理流程。' : ''}`,
      },
      {
        name: '一键安装与测试',
        desc: '通过火眼金睛 Skill 平台即可一键完成下载、安装和功能测试，无需手动配置环境依赖，大幅降低使用门槛。',
      },
    ];
    if (skill.tags.length > 0) {
      const allTags = skill.tags.join('、');
      autoGenFeatures.push({
        name: '多技术栈融合',
        desc: `整合 ${allTags} 等技术栈，提供统一的 Skill 调用接口。${skill.tags.some(t => ['api', 'sdk', 'integration'].includes(t.toLowerCase())) ? '支持 RESTful API、SDK 等多种集成方式。' : ''}`,
      });
    }
    featureLines.push({ type: 'paragraph', text: `该 Skill 提供以下 ${autoGenFeatures.length} 项核心功能：` });
    featureLines.push({ type: 'spacer' });
    for (const f of autoGenFeatures) {
      featureLines.push({ type: 'feature', name: f.name, text: f.desc });
      featureLines.push({ type: 'spacer' });
    }
  }

  // Add compatibility list
  featureLines.push({ type: 'paragraph', text: `支持平台：${platforms.join('、')}。` });
  sections.push({
    title: '核心功能',
    icon: <Zap style={{ width: 16, height: 16 }} />,
    content: featureLines,
  });

  // ── Section 4: Use Cases (new) ──
  const useCases = generateUseCases(skill, category);
  if (useCases.length > 0) {
    const useCaseLines: ContentLine[] = [
      { type: 'paragraph', text: `根据 ${skill.name} 的技术特性和定位，推荐以下典型使用场景：` },
      { type: 'spacer' },
    ];
    for (const uc of useCases) {
      useCaseLines.push({ type: 'numbered', num: useCases.indexOf(uc) + 1, text: `**${uc.title}**：${uc.desc}` });
    }
    useCaseLines.push({ type: 'spacer' });
    useCaseLines.push({ type: 'paragraph', text: '以上场景覆盖了该 Skill 的主要应用方向，实际使用中可根据具体需求灵活组合。' });
    sections.push({
      title: '推荐使用场景',
      icon: <Activity style={{ width: 16, height: 16 }} />,
      content: useCaseLines,
    });
  }

  // ── Section 5: Community Activity (new) ──
  section_community: {
    // Calculate trend metrics from available data
    const stars = skill.downloadCount;
    const starPerDay = daysSinceCreate > 0 ? (stars / daysSinceCreate).toFixed(1) : 'N/A';
    const estForks = Math.floor(stars * 0.12);
    const estWatchers = Math.floor(stars * 0.18);

    const communityLines: ContentLine[] = [
      { type: 'paragraph', text: `该项目在 GitHub 上表现出${stars >= 5000 ? '色，社区关注度极高' : stars >= 1000 ? '良好，拥有稳定的社区基础' : '稳步增长的态势' }。以下为关键社区数据：` },
      { type: 'spacer' },
      { type: 'stat', label: 'GitHub Star', value: stars.toLocaleString(), icon: 'star' },
      { type: 'stat', label: '预估 Fork 数', value: estForks.toLocaleString(), icon: 'fork' },
      { type: 'stat', label: '预估关注者', value: estWatchers.toLocaleString(), icon: 'eye' },
      { type: 'stat', label: '日均获星', value: `${starPerDay} /天`, icon: 'trend' },
      { type: 'spacer' },
      {
        type: 'paragraph',
        text: `项目自发布以来已运行 ${daysSinceCreate} 天，${
          daysSinceUpdate < 7 ? '最近一周内有代码更新，维护非常活跃。' :
          daysSinceUpdate < 30 ? '最近一个月内有更新，处于积极维护状态。' :
          daysSinceUpdate < 90 ? '近三个月内有更新，维护节奏稳定。' :
          '更新频率较低，但核心功能已稳定可用。'
        }`,
      },
      { type: 'spacer' },
      { type: 'paragraph', text: `项目成熟度：${stars >= 10000 ? '⭐ 业界标杆级项目，被大量开发者采用和推荐。' : stars >= 5000 ? '⭐⭐ 社区广泛认可，已成为该领域的重要参考实现。' : stars >= 1000 ? '⭐⭐⭐ 稳定的社区项目，功能完善，文档齐全。' : '⭐⭐⭐⭐ 成长中的开源项目，有潜力成为领域内的优秀方案。'}` },
    ];
    sections.push({
      title: '社区活跃度',
      icon: <TrendingUp style={{ width: 16, height: 16 }} />,
      content: communityLines,
    });
  }

  // ── Section 6: README content (deep parsed) ──
  if (readmeText && readmeText.trim().length > 100) {
    const readmeSections = parseReadmeIntoSections(readmeText);
    if (readmeSections.length > 0) {
      const docLines: ContentLine[] = [];
      for (const rs of readmeSections.slice(0, 4)) { // Max 4 sections
        docLines.push({ type: 'header', text: rs.title });
        docLines.push({ type: 'spacer' });
        docLines.push({ type: 'paragraph', text: rs.content });
        docLines.push({ type: 'spacer' });
      }
      if (readmeSections.length > 4) {
        docLines.push({ type: 'paragraph', text: `...还有 ${readmeSections.length - 4} 个章节内容，请到 GitHub 查看完整文档。` });
      }
      sections.push({
        title: '详细文档',
        icon: <FileText style={{ width: 16, height: 16 }} />,
        content: docLines,
      });
    } else {
      // Fallback: show cleaned README
      const cleaned = cleanReadmeText(readmeText);
      if (cleaned.length > 100) {
        sections.push({
          title: '详细文档',
          icon: <FileText style={{ width: 16, height: 16 }} />,
          content: [{ type: 'paragraph', text: cleaned }],
        });
      }
    }
  }

  // ── Section 7: Technical Details (enriched) ──
  const langColor = LANG_COLORS[skill.tags.find(t => LANG_COLORS[t.toLowerCase()])?.toLowerCase() || ''];
  sections.push({
    title: '技术详情',
    icon: <Code style={{ width: 16, height: 16 }} />,
    content: [
      { type: 'detailRow', label: '项目来源', value: skill.source === 'github' ? 'GitHub 开源仓库' : skill.source === 'npm' ? 'npm 包管理器' : '其他来源' },
      { type: 'detailRow', label: '开发者', value: skill.author },
      { type: 'detailRow', label: '当前版本', value: `v${skill.version}` },
      { type: 'detailRow', label: '技术分类', value: category },
      ...(langColor ? [{ type: 'detailRow' as const, label: '主要语言', value: skill.tags.find(t => LANG_COLORS[t.toLowerCase()]) || 'N/A' }] : []),
      { type: 'detailRow', label: '创建日期', value: new Date(skill.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) },
      { type: 'detailRow', label: '最近更新', value: new Date(skill.updatedAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) },
      { type: 'detailRow', label: '项目年龄', value: ageBadge.label },
      { type: 'spacer' },
      { type: 'paragraph', text: `该项目共使用 ${skill.tags.length} 个技术标签进行标注，涵盖 ${
        skill.tags.slice(0, 5).join('、')
      }${skill.tags.length > 5 ? ` 等方向` : ''}。` },
    ],
  });

  // ── Section 8: Installation Guide (enriched) ──
  sections.push({
    title: '安装指南',
    icon: <Package style={{ width: 16, height: 16 }} />,
    content: [
      { type: 'header', text: '方式一：一键自动安装（推荐）' },
      { type: 'paragraph', text: `在火眼金睛 Skill 平台${skill.name}详情页中，点击底部的「下载安装」按钮，系统将自动拉取最新版本并完成安装配置。整个流程全自动完成，无需手动干预。` },
      { type: 'spacer' },
      { type: 'header', text: '方式二：Git Clone 手动安装' },
      { type: 'paragraph', text: `适合开发者或需要在离线环境安装的场景：` },
      { type: 'code', text: `git clone https://github.com/${skill.id}.git\ncd ${skill.name}\n# 将 SKILL.md 文件放入 AI 工具的 skills 目录\n# 例如 Claude Code: ~/.claude/skills/\n# 例如 Cursor: .cursor/skills/\n# 例如 Codex CLI: ~/.codex/skills/` },
      { type: 'spacer' },
      { type: 'header', text: '方式三：通过 MCP 服务安装' },
      { type: 'paragraph', text: '配置 MCP（Model Context Protocol）服务器地址指向本 Skill，AI 工具即可自动发现并加载该 Skill 提供的功能和能力。适用于需要通过远程服务调用 Skill 的场景。' },
      { type: 'spacer' },
      { type: 'header', text: '方式四：npm 安装' },
      {
        type: 'paragraph',
        text: skill.source === 'npm'
          ? `\`npm install ${skill.name}\` 或 \`yarn add ${skill.name}\``
          : '如果该 Skill 发布在 npm 上，可以直接通过包管理器安装。当前项目主要托管在 GitHub。',
      },
      { type: 'spacer' },
      { type: 'paragraph', text: `💡 提示：首次使用前请确保 AI 工具已正确配置 SKILL.md 加载路径。详细配置方法请参考各平台的官方文档。` },
    ],
  });

  // ── Section 9: Related Resources (new) ──
  sections.push({
    title: '相关资源',
    icon: <Globe style={{ width: 16, height: 16 }} />,
    content: [
      { type: 'paragraph', text: `以下是与 ${skill.name} 相关的资源链接：` },
      { type: 'spacer' },
      { type: 'link', label: 'GitHub 源代码仓库', url: skill.sourceUrl },
      { type: 'link', label: 'SKILL.md 规范文档', url: 'https://skill.md/' },
      { type: 'link', label: '火眼金睛 Skill 平台', url: 'https://qoder.com' },
      ...(skill.source === 'npm' ? [{ type: 'link' as const, label: 'npm 包页面', url: `https://www.npmjs.com/package/${skill.name}` }] : []),
      { type: 'spacer' },
      { type: 'paragraph', text: `如需获取最新版本信息或提交 Issue，请访问 GitHub 仓库。欢迎 Star、Fork 和贡献代码。` },
    ],
  });

  return sections;
}

// ── Use case generator ──
function generateUseCases(skill: SkillMeta, category: string): { title: string; desc: string }[] {
  const cases: { title: string; desc: string }[] = [];
  const tags = skill.tags.map(t => t.toLowerCase());

  if (tags.some(t => ['ai', 'llm', 'rag', 'agent'].includes(t))) {
    cases.push({
      title: 'AI 应用开发',
      desc: `利用 ${skill.name} 快速构建基于 ${tags.includes('rag') ? 'RAG 检索增强生成' : tags.includes('agent') ? '智能体' : 'AI'} 的应用，集成大语言模型能力，实现智能问答、内容生成、代码辅助等功能。`,
    });
  }
  if (tags.some(t => ['automation', 'cli', 'tool'].includes(t))) {
    cases.push({
      title: '自动化工作流',
      desc: `将 ${skill.name} 集成到日常开发工作流中，自动化处理重复性任务，如代码审查、文档生成、测试执行、部署发布等，提升团队开发效率。`,
    });
  }
  if (tags.some(t => ['data', 'scraper', 'database'].includes(t))) {
    cases.push({
      title: '数据处理与采集',
      desc: `使用 ${skill.name} 进行数据采集、清洗、转换和分析。支持多种数据源接入，提供结构化的数据处理能力，帮助团队快速获取有价值的业务洞察。`,
    });
  }
  if (tags.some(t => ['web', 'api', 'integration'].includes(t))) {
    cases.push({
      title: 'Web 服务与 API 集成',
      desc: `通过 ${skill.name} 快速对接外部 API 服务，构建 Web 应用后端或微服务网关。支持 RESTful、GraphQL 等多种 API 协议。`,
    });
  }
  if (tags.some(t => ['security', 'pentest', 'audit'].includes(t))) {
    cases.push({
      title: '安全审计与渗透测试',
      desc: `利用 ${skill.name} 进行授权安全评估、漏洞扫描、安全审计等工作。涵盖常见的安全检测场景，为团队提供可靠的安全保障。`,
    });
  }
  if (tags.some(t => ['design', 'ui', 'ux'].includes(t))) {
    cases.push({
      title: 'UI/UX 设计与开发',
      desc: `使用 ${skill.name} 加速 UI 设计和前端开发流程。提供设计系统组件、样式规范和代码生成能力，保持设计与实现的一致性。`,
    });
  }
  if (tags.some(t => ['devops', 'deploy', 'ci', 'cd'].includes(t))) {
    cases.push({
      title: 'DevOps 与持续交付',
      desc: `将 ${skill.name} 集成到 CI/CD 流水线中，实现代码构建、自动化测试、环境部署、监控告警等 DevOps 实践，提升软件交付质量和效率。`,
    });
  }

  // Generic fallback
  if (cases.length === 0) {
    cases.push({
      title: '日常开发辅助',
      desc: `使用 ${skill.name} 作为 AI 编码代理的 Skill 插件，在日常编码过程中获得智能辅助，包括代码补全、重构建议、Bug 检测、文档生成等功能。`,
    });
    cases.push({
      title: '技术学习与探索',
      desc: `通过 ${skill.name} 学习和了解 ${category} 领域的最佳实践。项目代码和文档是学习 ${category} 开发的优秀参考资料。`,
    });
    cases.push({
      title: '团队协作标准化',
      desc: `将 ${skill.name} 作为团队的技术标准之一，统一开发工具链和编码规范，降低新成员上手成本，提升团队整体协作效率。`,
    });
  }

  return cases.slice(0, 4); // Max 4 use cases
}

// ── Helper: Parse README into sections ──
function parseReadmeIntoSections(readme: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];

  // Remove badges, images, HTML comments
  let clean = readme
    .replace(/!\[.*?\]\(.*?\)/g, '[图片]')
    .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<picture>[\s\S]*?<\/picture>/g, '')
    .replace(/<source[\s\S]*?>/g, '')
    .replace(/<img[^>]*>/g, '')
    .trim();

  // Split by headings
  const parts = clean.split(/^##\s+/m);
  if (parts.length > 0) {
    // First part is before any heading
    let firstPart = parts[0].trim();
    if (firstPart.length > 50) {
      sections.push({ title: '项目概述', content: truncateText(firstPart, 800) });
    }
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const titleEnd = part.indexOf('\n');
      const title = titleEnd > 0 ? part.substring(0, titleEnd).trim() : part.trim();
      const content = titleEnd > 0 ? part.substring(titleEnd).trim() : '';
      if (content.length > 30 && !title.toLowerCase().includes('badge') && !title.toLowerCase().includes('license')) {
        sections.push({
          title,
          content: truncateText(
            content
              .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
              .replace(/```[\s\S]*?```/g, '(代码片段)')
              .replace(/#{1,6}\s+/g, '')
              .replace(/\n{3,}/g, '\n\n')
              .trim(),
            600
          ),
        });
      }
    }
  }
  return sections.slice(0, 6);
}

function cleanReadmeText(readme: string): string {
  return readme
    .replace(/^#\s+.*$/m, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/```[\s\S]*?```/g, '(代码片段)')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .substring(0, 1500);
}

function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen) + '...';
}

function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(1)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/* ═══════════════════════════════════════════════════
   Content line types for rendering
   ═══════════════════════════════════════════════════ */
type ContentLine =
  | { type: 'paragraph'; text: string }
  | { type: 'spacer' }
  | { type: 'header'; text: string }
  | { type: 'feature'; name: string; text: string }
  | { type: 'numbered'; num: number; text: string }
  | { type: 'tagLine'; label: string; text: string }
  | { type: 'stat'; label: string; value: string; icon: string }
  | { type: 'detailRow'; label: string; value: string }
  | { type: 'code'; text: string }
  | { type: 'link'; label: string; url: string }
  | { type: 'example'; command: string; description: string };

export {
  CATEGORY_MAP,
  TAG_EXPLANATIONS,
  LANG_COLORS,
  getAgeBadge,
  getPopularityLevel,
  getPlatformCompat,
  generateChineseContent,
  generateUseCases,
  parseReadmeIntoSections,
  cleanReadmeText,
  truncateText,
  formatCount,
};
export type { ContentLine };
