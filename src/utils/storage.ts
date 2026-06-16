import type { SkillMeta, TagInfo } from '../types';

const SKILLS_KEY = 'skill_tester_skills';
const TAGS_KEY = 'skill_tester_tags';

export function saveSkills(skills: SkillMeta[]): void {
  try {
    localStorage.setItem(SKILLS_KEY, JSON.stringify(skills));
  } catch (e) {
    console.warn('Failed to save skills to localStorage:', e);
  }
}

export function loadSkills(): SkillMeta[] {
  try {
    const data = localStorage.getItem(SKILLS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveTags(tags: TagInfo[]): void {
  try {
    localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
  } catch (e) {
    console.warn('Failed to save tags:', e);
  }
}

export function loadTags(): TagInfo[] {
  try {
    const data = localStorage.getItem(TAGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function downloadSkillAsFile(skill: SkillMeta): void {
  const content = {
    ...skill,
    exportedAt: new Date().toISOString(),
    exportedBy: 'SkillTester',
  };

  const blob = new Blob([JSON.stringify(content, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${skill.name.replace(/\s+/g, '-').toLowerCase()}-${skill.version}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
