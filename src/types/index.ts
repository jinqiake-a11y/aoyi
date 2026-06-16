export interface SkillMeta {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  author: string;
  version: string;
  source: 'github' | 'npm' | 'local' | 'url';
  sourceUrl: string;
  tags: string[];
  rating: number;
  userRating?: number;
  userTags?: string[];
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  icon?: string;
  readme?: string;
  features: SkillFeature[];
  requirements: string[];
  screenshots?: string[];
  status: SkillStatus;
  installPath?: string;
  testResults?: TestResult[];
}

export interface SkillFeature {
  name: string;
  description: string;
  icon?: string;
  demoContent?: string;
}

export interface TestResult {
  featureName: string;
  status: 'pass' | 'fail' | 'pending' | 'running';
  output: string;
  duration?: number;
}

export type SkillStatus =
  | 'not_downloaded'
  | 'downloaded'
  | 'installing'
  | 'installed'
  | 'testing'
  | 'tested'
  | 'error';

export interface SearchResult {
  skill: SkillMeta;
  relevanceScore: number;
}

export interface InstallLog {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface TestEnvironment {
  skillId: string;
  status: 'idle' | 'building' | 'ready' | 'running' | 'error';
  url?: string;
  logs: InstallLog[];
}

export interface SkillLibrary {
  skills: SkillMeta[];
  tags: TagInfo[];
  totalSkills: number;
}

export interface TagInfo {
  name: string;
  count: number;
  color: string;
}

export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'rating' | 'downloads' | 'updated';
export type ThemeMode = 'light' | 'dark' | 'system';
