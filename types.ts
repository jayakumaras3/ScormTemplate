// --------------------------------------------------
// JSON CONTRACT: template.json
// --------------------------------------------------

export interface ResourceItem {
  Title: string;
  URL: string;
}

export interface LearningAids {
  Title: string;
  Resources: ResourceItem[];
}

export interface ResourceArea {
  LearningAids: LearningAids;
}

export interface TemplateConfig {
  master: boolean;
  lmsStatus: "Passed/Failed";
  QuizAttempt: string;
  AudioVersionEnable: boolean;
  CertificateEnabled: boolean;
  PageLevelCourseComplete: boolean;
  LearningAidsTitle: string;
  MenuShowHideBool: string;
  Menutitle: string;
  NextTitle: string;
  Prevtitle: string;
  MenuName: string;
  TranscriptName: string;
  ResumeTitle: string;
  ResumeHeader: string;
  ResumeYES: string;
  ResumeNO: string;
  VttLanguage: string;
  CourseName: string;
  VttLabel: string;
  spanCliContinue: string;
  Resource: boolean;
  ResourceArea: ResourceArea;
}

// --------------------------------------------------
// JSON CONTRACT: toc.json
// --------------------------------------------------

export type ContentType = 'captivate' | 'video';

export interface ContentItem {
  type: ContentType;
  path: string;
  functionName?: string; // Specific to "captivate"
  onendnextscrn?: string;  // Specific to "video"
}

export interface PreloaderItem {
  src: string;
  id: string;
}

export interface PageSettings {
  sidebar: boolean;
  header: boolean;
  footer: boolean;
  fullScreen: boolean;
  pageNumber: string;
  module: number;
  preloader: PreloaderItem[];
  content: ContentItem[];
}

export interface Page {
  name: string;
  title: string;
  header: string;
  transcript: string;
  settings: PageSettings;
}

/**
 * The root structure of toc.json.
 * It is an object where keys are module identifiers (e.g., "0")
 * and values are arrays of Page objects.
 */
export type Toc = Record<string, Page[]>;
