import type { SkillMeta } from '../types';
import { repoToSkill } from './github';
import type { GitHubRepo } from './github';

const GITHUB_API = 'https://api.github.com';

/**
 * Fetch top 15 most-starred AI/skill repos from GitHub
 */
export async function fetchMostStarred(): Promise<SkillMeta[]> {
  const queries = [
    'SKILL.md in:path sort:stars-desc',
    'topic:ai-skill sort:stars-desc',
    'topic:skill sort:stars-desc',
  ];

  const seen = new Set<string>();
  const results: SkillMeta[] = [];

  for (const q of queries) {
    if (results.length >= 15) break;
    try {
      const res = await fetch(
        `${GITHUB_API}/search/repositories?q=${encodeURIComponent(q)}&per_page=15&page=1`,
        { headers: { 'Accept': 'application/vnd.github.v3+json' } },
      );
      if (!res.ok) continue;
      const data = await res.json();
      for (const repo of (data.items || []) as GitHubRepo[]) {
        if (!seen.has(repo.full_name) && results.length < 15) {
          seen.add(repo.full_name);
          results.push(repoToSkill(repo));
        }
      }
    } catch {
      continue;
    }
  }

  return results;
}

/**
 * Fetch top 15 trending repos created/updated in the last 7 days
 */
export async function fetchTrending(): Promise<SkillMeta[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dateStr = sevenDaysAgo.toISOString().split('T')[0];

  const queries = [
    `SKILL.md in:path created:>${dateStr} sort:stars-desc`,
    `topic:ai created:>${dateStr} sort:stars-desc`,
    `created:>${dateStr} sort:stars-desc`,
  ];

  const seen = new Set<string>();
  const results: SkillMeta[] = [];

  for (const q of queries) {
    if (results.length >= 15) break;
    try {
      const res = await fetch(
        `${GITHUB_API}/search/repositories?q=${encodeURIComponent(q)}&per_page=15&page=1`,
        { headers: { 'Accept': 'application/vnd.github.v3+json' } },
      );
      if (!res.ok) continue;
      const data = await res.json();
      for (const repo of (data.items || []) as GitHubRepo[]) {
        if (!seen.has(repo.full_name) && results.length < 15) {
          seen.add(repo.full_name);
          results.push(repoToSkill(repo));
        }
      }
    } catch {
      continue;
    }
  }

  return results;
}
