export interface TemplateConfig {
  CourseName: string;
  AudioVersionEnable?: boolean;
  Master?: boolean;
  Menutitle?: string;
  TranscriptName?: string;
  ResumeHeader?: string;
  [key: string]: unknown;
}

export interface TocContentItem {
  type: string;
  path: string;
  functionName?: string;
  onendnextscrn?: string;
}

export interface TocPageSettings {
  module: number;
  content: TocContentItem[];
  [key: string]: unknown;
}

export interface TocPage {
  name: string;
  title: string;
  header?: string;
  transcript?: string;
  settings: TocPageSettings;
}

export interface CourseConfig {
  template: TemplateConfig;
  pages: TocPage[];
}

export interface TranscriptEntry {
  pageId: string;
  title: string;
  completed: boolean;
  transcript: string;
}

export interface CourseProgress {
  courseName: string;
  currentPageIndex: number;
  moduleId: number;
  visitedPageIds: string[];
  completedPageIds: string[];
  completionPercentage: number;
  updatedAt: string;
}