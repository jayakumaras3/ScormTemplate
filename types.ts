export interface TemplateConfig {
  master: boolean;
  lmsStatus: string;
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
  ResourceArea: {
    LearningAids: {
      Title: string;
      Resources: { Title: string; URL: string }[];
    };
  };
}

export interface TocContent {
  type: "captivate" | "video";
  path: string;
  functionName?: string;
  onendnextscrn?: string;
}

export interface TocPreloader {
  src: string;
  id: string;
}

export interface TocSettings {
  sidebar: boolean;
  header: boolean;
  footer: boolean;
  fullScreen: boolean;
  pageNumber: string;
  module: number;
  preloader: TocPreloader[];
  content: TocContent[];
}

export interface TocPage {
  name: string;
  title: string;
  header: string;
  transcript: string;
  settings: TocSettings;
}

export type TocData = Record<string, TocPage[]>;

export interface PageState {
  visited: boolean;
  completed: boolean;
  score?: number;
  attempts?: number;
  answer?: any;
  isLocked?: boolean;
}
