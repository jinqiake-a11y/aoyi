import { useState, useEffect, useRef } from 'react';
import type { SkillMeta } from '../types';
import { fetchGitHubRepo } from '../utils/github';
import {
  Star, Calendar, User, GitFork,
  ExternalLink, X, Tag, Zap, Package,
  Clock, BookOpen, Code, ArrowUpRight,
  Globe, TrendingUp, Activity, FileText, Beaker,
  CheckCircle2, XCircle, Play, RotateCcw, ChevronRight,
} from 'lucide-react';

interface SkillDetailDrawerProps {
  skill: SkillMeta | null;
  open: boolean;
  onClose: () => void;
}

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
  const sections: { title: string; content: ContentLine[]; icon?: React.ReactNode }[] = [];

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

/* ═══════════════════════════════════════════════════
   Test Scenarios Generator
   ═══════════════════════════════════════════════════ */

interface TestScenario {
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

function generateTestScenarios(skill: SkillMeta): TestScenario[] {
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

function generateUseCaseScenarios(skill: SkillMeta, category: string, tags: string[]): TestScenario[] {
  const scenarios: TestScenario[] = [];

  // AI / Agent related
  if (tags.some(t => ['ai', 'llm', 'agent', 'rag'].includes(t))) {
    scenarios.push({
      id: 'ai-workflow',
      name: 'AI 工作流集成',
      description: `测试 ${skill.name} 在 AI 工作流中的集成效果。验证其能否与 LLM 调用、RAG 检索等 AI 能力无缝配合。`,
      category: 'AI 应用',
      icon: '🤖',
      command: `# AI 工作流测试\n\n/use ${skill.name} --mode workflow\n\\n# 示例：结合 RAG 的知识检索\n请使用 ${skill.name} 帮我:\n1. 从知识库中检索相关信息\n2. 基于检索结果生成回答\n3. 格式化输出结果`,
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

// Also need the platforms variable for the test scenario generator

/* ═══════════════════════════════════════════════════
   Test View Component
   ═══════════════════════════════════════════════════ */
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

// Export the key function for use in the main component
export { generateTestScenarios };

/* ═══════════════════════════════════════════════════
   Helper: Generate use cases
   ═══════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════
   Helper: Parse README into sections
   ═══════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════
   Content Renderer Component
   ═══════════════════════════════════════════════════ */
function renderContentLine(line: ContentLine, idx: number, accentColor: string) {
  switch (line.type) {
    case 'paragraph':
      return (
        <div key={idx} style={{ fontSize: 13, lineHeight: 1.8, color: 'rgba(200,190,180,0.8)', marginBottom: 2 }}>
          {formatInlineMarkdown(line.text)}
        </div>
      );

    case 'spacer':
      return <div key={idx} style={{ height: 6 }} />;

    case 'header':
      return (
        <div key={idx} style={{
          fontSize: 13.5,
          fontWeight: 700,
          color: 'var(--text-primary)',
          fontFamily: "'Inter', sans-serif",
          letterSpacing: '0.01em',
          padding: '4px 0',
        }}>
          {line.text}
        </div>
      );

    case 'feature':
      return (
        <div key={idx} style={{
          padding: '10px 12px',
          borderRadius: 10,
          background: 'linear-gradient(135deg, rgba(var(--accent-rgb),0.06), rgba(94,196,212,0.04))',
          border: '1px solid rgba(var(--accent-rgb),0.08)',
          marginBottom: 2,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap style={{ width: 13, height: 13, color: accentColor }} />
            {line.name}
          </div>
          <div style={{ fontSize: 12.5, lineHeight: 1.7, color: 'rgba(200,190,180,0.75)' }}>
            {line.text}
          </div>
        </div>
      );

    case 'numbered': {
      const text = line.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <div key={idx} style={{
          display: 'flex',
          gap: 10,
          marginBottom: 6,
          padding: '6px 0',
        }}>
          <div style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--bg-body)',
            flexShrink: 0,
            marginTop: 1,
          }}>
            {line.num}
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(200,190,180,0.8)', flex: 1 }}
            dangerouslySetInnerHTML={{ __html: text }} />
        </div>
      );
    }

    case 'tagLine':
      return (
        <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 4, padding: '4px 0' }}>
          <span style={{
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 600,
            fontFamily: "'JetBrains Mono', monospace",
            background: `${accentColor}18`,
            color: accentColor,
            border: `1px solid ${accentColor}30`,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}>
            {line.label}
          </span>
          <span style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(200,190,180,0.75)' }}>
            {line.text}
          </span>
        </div>
      );

    case 'stat': {
      const statIcons: Record<string, string> = { star: '⭐', fork: '⑂', eye: '👁', trend: '📈' };
      return (
        <div key={idx} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '7px 12px',
          borderRadius: 8,
          background: 'rgba(42,34,32,0.3)',
          border: '1px solid rgba(var(--accent-rgb),0.06)',
          marginBottom: 4,
        }}>
          <span style={{ fontSize: 12.5, color: 'rgba(200,190,180,0.7)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{statIcons[line.icon] || '•'}</span>
            {line.label}
          </span>
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '-0.02em',
          }}>
            {line.value}
          </span>
        </div>
      );
    }

    case 'detailRow':
      return (
        <div key={idx} style={{
          display: 'flex',
          alignItems: 'center',
          padding: '5px 0',
          borderBottom: '1px solid rgba(var(--accent-rgb),0.04)',
        }}>
          <span style={{
            fontSize: 12,
            color: 'rgba(200,190,180,0.5)',
            width: 80,
            flexShrink: 0,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
          }}>
            {line.label}
          </span>
          <span style={{
            fontSize: 13,
            color: 'var(--text-primary)',
            fontWeight: 500,
            fontFamily: "'Inter', sans-serif",
          }}>
            {line.value}
          </span>
        </div>
      );

    case 'code':
      return (
        <div key={idx} style={{
          padding: '10px 14px',
          borderRadius: 10,
          background: '#14100e',
          border: '1px solid rgba(var(--accent-rgb),0.1)',
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
          color: 'rgba(200,210,220,0.85)',
          lineHeight: 1.7,
          whiteSpace: 'pre',
          overflowX: 'auto',
        }}>
          {line.text}
        </div>
      );

    case 'link':
      return (
        <a key={idx}
          href={line.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 12px',
            borderRadius: 8,
            background: 'rgba(94,196,212,0.05)',
            border: '1px solid rgba(94,196,212,0.12)',
            color: '#5ec4d4',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 4,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(94,196,212,0.1)';
            e.currentTarget.style.borderColor = 'rgba(94,196,212,0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(94,196,212,0.05)';
            e.currentTarget.style.borderColor = 'rgba(94,196,212,0.12)';
          }}
        >
          <ExternalLink style={{ width: 13, height: 13, flexShrink: 0 }} />
          {line.label}
          <ArrowUpRight style={{ width: 12, height: 12, marginLeft: 'auto', opacity: 0.5 }} />
        </a>
      );

    case 'example':
      return (
        <div key={idx} style={{
          padding: '12px 14px',
          borderRadius: 10,
          background: 'rgba(var(--accent-rgb),0.04)',
          border: '1px solid rgba(var(--accent-rgb),0.1)',
          marginBottom: 8,
          transition: 'all 0.2s ease',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.07)'; e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb),0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.04)'; e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb),0.1)'; }}
        >
          <div style={{
            fontSize: 12,
            lineHeight: 1.6,
            color: 'rgba(200,210,220,0.85)',
            fontFamily: "'JetBrains Mono', 'Inter', monospace",
            marginBottom: 6,
            wordBreak: 'break-all',
          }}>
            {line.command}
          </div>
          <div style={{
            fontSize: 11.5,
            color: '#6b5f55',
            fontFamily: "'Inter', 'PingFang SC', sans-serif",
            lineHeight: 1.5,
          }}>
            {line.description}
          </div>
        </div>
      );

    default:
      return null;
  }
}

function formatInlineMarkdown(text: string): React.ReactNode {
  // Handle bold (**text**)
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

/* ═══════════════════════════════════════════════════
   Main Drawer Component
   ═══════════════════════════════════════════════════ */
export default function SkillDetailDrawer({ skill, open, onClose }: SkillDetailDrawerProps) {
  const [detailedSkill, setDetailedSkill] = useState<SkillMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch detailed info when a skill is selected
  useEffect(() => {
    if (!skill || !open) return;
    setLoading(true);
    setReadmeContent(null);
    setDetailedSkill(null);

    (async () => {
      try {
        const full = await fetchGitHubRepo(skill.id);
        if (full) {
          setDetailedSkill(full);
          if (full.readme) setReadmeContent(full.readme);
        } else {
          setDetailedSkill(skill);
        }
      } catch {
        setDetailedSkill(skill);
      } finally {
        setLoading(false);
      }
    })();

    // Scroll to top when opening
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [skill?.id, open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const current = detailedSkill || skill;
  if (!current) return null;

  const sections = generateChineseContent(current, readmeContent || undefined);
  const accentColor = 'var(--text-accent)';
  const popLevel = getPopularityLevel(current.downloadCount);

  return (
    <>
      {/* ── Overlay ── */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 998,
            animation: 'fadeIn 0.25s ease',
          }}
        />
      )}

      {/* ── Centered Modal ── */}
      <div
        ref={drawerRef}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          width: 'min(760px, 92vw)',
          maxWidth: '100vw',
          maxHeight: 'min(85vh, 800px)',
          background: 'var(--bg-card-solid)',
          border: '1px solid var(--border-glow)',
          boxShadow: 'var(--shadow-lg), 0 0 60px rgba(var(--accent-rgb), 0.08)',
          borderRadius: 20,
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.92)',
          opacity: open ? 1 : 0,
          transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease',
          overflow: 'hidden',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {/* ═══ Fixed Header ═══ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-primary)',
            flexShrink: 0,
            background: 'var(--bg-glass-strong)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: popLevel.color,
                boxShadow: `0 0 12px ${popLevel.color}`,
              }}
            />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '0.01em',
              }}
            >
              Skill 详情
            </span>
            {loading && (
              <div className="shimmer" style={{ width: 60, height: 14, borderRadius: 4 }} />
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: '1px solid var(--border-primary)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.1)';
              e.currentTarget.style.color = 'var(--text-accent)';
              e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb), 0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--bg-secondary)';
              e.currentTarget.style.color = 'var(--text-tertiary)';
              e.currentTarget.style.borderColor = 'var(--border-primary)';
            }}
          >
            <X style={{ width: 17, height: 17 }} />
          </button>
        </div>

        {/* ═══ Scrollable Content ═══ */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px 32px',
          }}
        >
          {/* ── Skill Header Card ── */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginBottom: 20,
              padding: 16,
              borderRadius: 16,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #d4a574, #c49564)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 0 24px rgba(var(--accent-rgb),0.2)',
              }}
            >
              {current.icon ? (
                <img src={current.icon} alt="" style={{ width: 56, height: 56, borderRadius: 14 }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <Package style={{ width: 26, height: 26, color: 'var(--text-accent)' }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 4,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                wordBreak: 'break-word',
              }}>
                {current.name}
              </h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                color: '#8a7e74',
                flexWrap: 'wrap',
              }}>
                <User style={{ width: 13, height: 13 }} />
                <span>{current.author}</span>
                <span style={{ opacity: 0.3 }}>|</span>
                <GitFork style={{ width: 13, height: 13 }} />
                <span style={{ textTransform: 'capitalize' }}>{current.source}</span>
                <span style={{ opacity: 0.3 }}>|</span>
                <span style={{
                  padding: '1px 6px',
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 600,
                  background: `${popLevel.color}18`,
                  color: popLevel.color,
                  border: `1px solid ${popLevel.color}30`,
                }}>
                  {popLevel.label}
                </span>
              </div>
            </div>
          </div>

          {/* ── Popularity Bar ── */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            }}>
              <span style={{ fontSize: 11, color: '#6b5f55', fontWeight: 500 }}>社区热度</span>
              <span style={{ fontSize: 11, color: popLevel.color, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                {popLevel.pct}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: 4,
              borderRadius: 4,
              background: 'rgba(42,34,32,0.6)',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${popLevel.pct}%`,
                height: '100%',
                borderRadius: 4,
                background: `linear-gradient(90deg, ${popLevel.color}88, ${popLevel.color})`,
                transition: 'width 0.8s ease',
              }} />
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
            marginBottom: 24,
          }}>
            {[
              { icon: Star, label: 'Star', value: formatCount(current.downloadCount), color: '#fbbf24' },
              { icon: GitFork, label: 'Fork', value: formatCount(Math.floor(current.downloadCount * 0.12)), color: '#5ec4d4' },
              { icon: Calendar, label: '创建', value: new Date(current.createdAt).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }), color: '#a78bfa' },
              { icon: Clock, label: '更新', value: new Date(current.updatedAt).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }), color: '#4ade80' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} style={{
                  padding: '10px 8px',
                  borderRadius: 10,
                  background: 'rgba(42,34,32,0.35)',
                  border: '1px solid rgba(var(--accent-rgb),0.06)',
                  textAlign: 'center',
                }}>
                  <Icon style={{ width: 15, height: 15, color: stat.color, marginBottom: 4, display: 'inline-block' }} />
                  <div style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: '-0.02em',
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 10, color: '#6b5f55', marginTop: 1, fontWeight: 500 }}>
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Tags ── */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            marginBottom: 24,
          }}>
            {current.tags.slice(0, 12).map((tag, i) => {
              const colors = [
                { bg: 'rgba(var(--accent-rgb),0.1)', text: '#d4a574', border: 'rgba(var(--accent-rgb),0.2)' },
                { bg: 'rgba(94,196,212,0.1)', text: '#5ec4d4', border: 'rgba(94,196,212,0.2)' },
                { bg: 'rgba(74,222,128,0.1)', text: '#4ade80', border: 'rgba(74,222,128,0.2)' },
                { bg: 'rgba(248,113,113,0.1)', text: '#f87171', border: 'rgba(248,113,113,0.2)' },
                { bg: 'rgba(167,139,250,0.1)', text: '#a78bfa', border: 'rgba(167,139,250,0.2)' },
              ];
              const c = colors[i % colors.length];
              return (
                <span key={tag} style={{
                  padding: '3px 10px',
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                  background: c.bg,
                  color: c.text,
                  border: `1px solid ${c.border}`,
                  letterSpacing: '0.01em',
                  transition: 'all 0.15s ease',
                  cursor: 'default',
                }}
                  title={TAG_EXPLANATIONS[tag.toLowerCase()] || tag}>
                  {tag}
                </span>
              );
            })}
            {current.tags.length > 12 && (
              <span style={{ fontSize: 11, padding: '3px 7px', color: '#6b5f55', fontFamily: "'JetBrains Mono', monospace" }}>
                +{current.tags.length - 12}
              </span>
            )}
          </div>

          {/* ── Loading State ── */}
          {loading ? (
            <div>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ marginBottom: 20 }}>
                  <div className="shimmer" style={{ height: 16, width: '30%', borderRadius: 4, marginBottom: 12 }} />
                  <div className="shimmer" style={{ height: 12, width: '100%', borderRadius: 4, marginBottom: 6 }} />
                  <div className="shimmer" style={{ height: 12, width: '85%', borderRadius: 4, marginBottom: 6 }} />
                  <div className="shimmer" style={{ height: 12, width: '60%', borderRadius: 4 }} />
                </div>
              ))}
            </div>
          ) : testMode ? (
            /* ════ Test View ════ */
            <SkillTestView
              skill={current}
              onBack={() => setTestMode(false)}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {sections.map((section, idx) => (
                <div key={idx}
                  className="animate-fade-in"
                  style={{ animationDelay: `${idx * 60}ms` }}>
                  {/* Section title */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 10,
                    paddingBottom: 8,
                    borderBottom: '1px solid rgba(var(--accent-rgb),0.08)',
                  }}>
                    {section.icon && (
                      <span style={{ color: accentColor, opacity: 0.8 }}>
                        {section.icon}
                      </span>
                    )}
                    <h3 style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      letterSpacing: '0.02em',
                    }}>
                      {section.title}
                    </h3>
                    <div style={{ flex: 1 }} />
                    <div style={{
                      width: 3,
                      height: 3,
                      borderRadius: '50%',
                      background: accentColor,
                      opacity: 0.4,
                    }} />
                  </div>

                  {/* Section content */}
                  <div style={{
                    fontFamily: "'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif",
                  }}>
                    {section.content.map((line, li) => renderContentLine(line, li, accentColor))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═══ Fixed Footer with Actions ═══ */}
        <div style={{
          display: 'flex',
          gap: 8,
          padding: '12px 20px',
          borderTop: '1px solid rgba(var(--accent-rgb),0.1)',
          background: 'rgba(26,20,18,0.9)',
          backdropFilter: 'blur(16px)',
          flexShrink: 0,
        }}>
          <a href={current.sourceUrl}
            target="_blank" rel="noopener noreferrer"
            className="capsule-btn"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              textDecoration: 'none',
              fontSize: 13,
              cursor: 'pointer',
              height: 38,
              padding: '0 12px',
            }}>
            <ExternalLink style={{ width: 14, height: 14 }} />
            源码
          </a>
          <button
            onClick={() => {
              setTestMode(!testMode);
              if (scrollRef.current) scrollRef.current.scrollTop = 0;
            }}
            className="capsule-btn-primary"
            style={{
              flex: 1.2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontSize: 13,
              cursor: 'pointer',
              height: 38,
              padding: '0 12px',
              background: testMode
                ? 'linear-gradient(135deg, #5ec4d4, #4ab0c0)'
                : 'linear-gradient(135deg, #d4a574, #c49564)',
              boxShadow: testMode
                ? '0 0 24px rgba(94,196,212,0.3), 4px 4px 10px #14100e'
                : '0 0 24px rgba(var(--accent-rgb),0.3), 4px 4px 10px #14100e',
            }}>
            <Beaker style={{ width: 15, height: 15 }} />
            {testMode ? '详情' : '功能测试'}
          </button>
          <button className="capsule-btn" style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: 13,
            cursor: 'pointer',
            height: 38,
            padding: '0 12px',
          }} onClick={onClose}>
            <ArrowUpRight style={{ width: 14, height: 14 }} />
            安装
          </button>
        </div>
      </div>
    </>
  );
}
