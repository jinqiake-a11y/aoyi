import type { SkillMeta } from '../types';

const GITHUB_API = 'https://api.github.com';

export interface GitHubRepo {
  full_name: string;
  name: string;
  description: string;
  html_url: string;
  owner: { login: string; avatar_url: string };
  stargazers_count: number;
  updated_at: string;
  created_at: string;
  topics: string[];
  language: string;
  default_branch: string;
}

interface GitHubContent {
  name: string;
  content: string;
  encoding: string;
  download_url: string;
}

export async function searchGitHubSkills(query: string, page = 1): Promise<SkillMeta[]> {
  const searchQueries = [
    `${query} SKILL.md in:path`,
    `${query} topic:skill OR topic:agent-skill OR topic:ai-skill`,
    `${query} skill.md in:name`,
  ];

  const results: SkillMeta[] = [];
  const seen = new Set<string>();

  for (const q of searchQueries) {
    try {
      const res = await fetch(
        `${GITHUB_API}/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=20&page=${page}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (!res.ok) continue;

      const data = await res.json();
      for (const repo of (data.items || []) as GitHubRepo[]) {
        if (!seen.has(repo.full_name)) {
          seen.add(repo.full_name);
          results.push(repoToSkill(repo));
        }
      }
    } catch (err) {
      console.warn('GitHub search failed for query:', q, err);
    }
  }

  if (results.length === 0) {
    return searchGenericGitHub(query, page);
  }

  return results;
}

async function searchGenericGitHub(query: string, page = 1): Promise<SkillMeta[]> {
  try {
    const res = await fetch(
      `${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=30&page=${page}`,
      {
        headers: { 'Accept': 'application/vnd.github.v3+json' },
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return (data.items || [] as GitHubRepo[]).map(repoToSkill);
  } catch {
    return [];
  }
}

export async function fetchGitHubRepo(repoFullName: string): Promise<SkillMeta | null> {
  try {
    const res = await fetch(`${GITHUB_API}/repos/${repoFullName}`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    });
    if (!res.ok) return null;
    const repo: GitHubRepo = await res.json();
    const skill = repoToSkill(repo);

    const readme = await fetchReadme(repoFullName, repo.default_branch);
    if (readme) skill.readme = readme;

    const skillMd = await fetchSkillMd(repoFullName, repo.default_branch);
    if (skillMd) {
      const parsed = parseSkillMd(skillMd);
      Object.assign(skill, parsed);
    }

    return skill;
  } catch {
    return null;
  }
}

async function fetchReadme(repo: string, branch: string): Promise<string | null> {
  try {
    const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/README.md?ref=${branch}`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    });
    if (!res.ok) return null;
    const data: GitHubContent = await res.json();
    return atob(data.content);
  } catch {
    return null;
  }
}

async function fetchSkillMd(repo: string, branch: string): Promise<string | null> {
  try {
    const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/SKILL.md?ref=${branch}`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    });
    if (!res.ok) return null;
    const data: GitHubContent = await res.json();
    return atob(data.content);
  } catch {
    return null;
  }
}

function parseSkillMd(content: string): Partial<SkillMeta> {
  const result: Partial<SkillMeta> = {};

  const nameMatch = content.match(/^#\s+(.+)/m);
  if (nameMatch) result.name = nameMatch[1].trim();

  const descMatch = content.match(/^>\s*(.+)/m) || content.match(/^##\s*Description\s*\n+(.+)/im);
  if (descMatch) result.description = descMatch[1].trim();

  const features: { name: string; description: string }[] = [];
  const featureSection = content.match(/##\s*Features\s*\n([\s\S]*?)(?=\n##|$)/i);
  if (featureSection) {
    const items = featureSection[1].matchAll(/[-*]\s*\*\*(.+?)\*\*[:\-]\s*(.+)/g);
    for (const item of items) {
      features.push({ name: item[1].trim(), description: item[2].trim() });
    }
  }
  if (features.length > 0) result.features = features;

  const tags: string[] = [];
  const tagMatch = content.match(/tags?:\s*(.+)/i);
  if (tagMatch) {
    tags.push(...tagMatch[1].split(',').map(t => t.trim()).filter(Boolean));
  }
  if (tags.length > 0) result.tags = tags;

  result.longDescription = content;
  return result;
}

export function repoToSkill(repo: GitHubRepo): SkillMeta {
  return {
    id: repo.full_name,
    name: repo.name,
    description: repo.description || 'No description available',
    longDescription: repo.description || '',
    author: repo.owner.login,
    version: '1.0.0',
    source: 'github',
    sourceUrl: repo.html_url,
    tags: repo.topics || [],
    rating: Math.min(5, (repo.stargazers_count / 100) + 3),
    downloadCount: repo.stargazers_count,
    createdAt: repo.created_at,
    updatedAt: repo.updated_at,
    icon: repo.owner.avatar_url,
    features: [],
    requirements: [],
    status: 'not_downloaded',
  };
}

export function parseGitHubUrl(url: string): string | null {
  const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
  return match ? match[1].replace(/\.git$/, '') : null;
}

export async function searchNpmSkills(query: string): Promise<SkillMeta[]> {
  try {
    const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=20`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.objects || []).map((obj: any) => ({
      id: `npm:${obj.package.name}`,
      name: obj.package.name,
      description: obj.package.description || 'No description',
      longDescription: obj.package.description || '',
      author: obj.package.author?.name || 'unknown',
      version: obj.package.version || '1.0.0',
      source: 'npm' as const,
      sourceUrl: `https://www.npmjs.com/package/${obj.package.name}`,
      tags: obj.package.keywords || [],
      rating: 4,
      downloadCount: 0,
      createdAt: obj.package.date || new Date().toISOString(),
      updatedAt: obj.package.date || new Date().toISOString(),
      features: [],
      requirements: [],
      status: 'not_downloaded' as const,
    }));
  } catch {
    return [];
  }
}
