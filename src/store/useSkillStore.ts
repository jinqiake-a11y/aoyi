import { create } from 'zustand';
import type { SkillMeta, InstallLog, TestResult, TestEnvironment, TagInfo } from '../types';

const TAG_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#22c55e', '#06b6d4', '#ef4444', '#6366f1',
  '#14b8a6', '#f97316', '#84cc16', '#a855f7',
];

function computeTags(skills: SkillMeta[]): TagInfo[] {
  const tagMap = new Map<string, number>();
  skills.forEach(skill => {
    const allTags = [...new Set([...skill.tags, ...(skill.userTags || [])])];
    allTags.forEach(tag => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });
  return Array.from(tagMap.entries())
    .map(([name, count], i) => ({
      name,
      count,
      color: TAG_COLORS[i % TAG_COLORS.length],
    }))
    .sort((a, b) => b.count - a.count);
}

interface SkillState {
  skills: SkillMeta[];
  currentSkill: SkillMeta | null;
  searchResults: SkillMeta[];
  searchQuery: string;
  searchLoading: boolean;
  installLogs: InstallLog[];
  testEnvironment: TestEnvironment | null;
  testResults: TestResult[];
  tags: TagInfo[];
  selectedTag: string | null;

  setSearchQuery: (query: string) => void;
  setSearchLoading: (loading: boolean) => void;
  setSearchResults: (results: SkillMeta[]) => void;
  setCurrentSkill: (skill: SkillMeta | null) => void;
  addSkill: (skill: SkillMeta) => void;
  updateSkill: (id: string, updates: Partial<SkillMeta>) => void;
  removeSkill: (id: string) => void;
  addInstallLog: (log: InstallLog) => void;
  clearInstallLogs: () => void;
  setTestEnvironment: (env: TestEnvironment | null) => void;
  addTestResult: (result: TestResult) => void;
  clearTestResults: () => void;
  setSelectedTag: (tag: string | null) => void;
  rateSkill: (id: string, rating: number) => void;
  tagSkill: (id: string, tags: string[]) => void;
  getSkillsByTag: (tag: string) => SkillMeta[];
  getAllTags: () => TagInfo[];
}

export const useSkillStore = create<SkillState>((set, get) => ({
  skills: [],
  currentSkill: null,
  searchResults: [],
  searchQuery: '',
  searchLoading: false,
  installLogs: [],
  testEnvironment: null,
  testResults: [],
  tags: [],
  selectedTag: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchLoading: (loading) => set({ searchLoading: loading }),
  setSearchResults: (results) => set({ searchResults: results }),
  setCurrentSkill: (skill) => set({ currentSkill: skill }),

  addSkill: (skill) => {
    const existing = get().skills.find(s => s.id === skill.id);
    if (!existing) {
      const newSkills = [...get().skills, skill];
      set({
        skills: newSkills,
        tags: computeTags(newSkills),
      });
    }
  },

  updateSkill: (id, updates) => set(state => ({
    skills: state.skills.map(s => s.id === id ? { ...s, ...updates } : s),
    currentSkill: state.currentSkill?.id === id
      ? { ...state.currentSkill, ...updates }
      : state.currentSkill,
  })),

  removeSkill: (id) => set(state => ({
    skills: state.skills.filter(s => s.id !== id),
    currentSkill: state.currentSkill?.id === id ? null : state.currentSkill,
  })),

  addInstallLog: (log) => set(state => ({
    installLogs: [...state.installLogs, log],
  })),

  clearInstallLogs: () => set({ installLogs: [] }),

  setTestEnvironment: (env) => set({ testEnvironment: env }),

  addTestResult: (result) => set(state => ({
    testResults: [...state.testResults, result],
  })),

  clearTestResults: () => set({ testResults: [] }),

  setSelectedTag: (tag) => set({ selectedTag: tag }),

  rateSkill: (id, rating) => {
    get().updateSkill(id, { userRating: rating });
  },

  tagSkill: (id, tags) => {
    const skill = get().skills.find(s => s.id === id);
    if (skill) {
      const allTags = [...new Set([...(skill.tags || []), ...tags])];
      get().updateSkill(id, { userTags: tags, tags: allTags });
      set(state => ({
        tags: computeTags(state.skills),
      }));
    }
  },

  getSkillsByTag: (tag) => {
    return get().skills.filter(s =>
      s.tags.includes(tag) || (s.userTags && s.userTags.includes(tag))
    );
  },

  getAllTags: () => get().tags,
}));
