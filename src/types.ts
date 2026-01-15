
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
      Resources: {
        Title: string;
        URL: string;
      }[];
    };
  };
}

export interface Content {
  type: 'captivate' | 'video';
  path: string;
  functionName?: string; // for captivate
  onendnextscrn?: string; // for video
}

export interface Preloader {
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
  preloader: Preloader[];
  content: Content[];
}

export interface Page {
  name: string;
  title: string;
  header: string;
  transcript: string;
  settings: PageSettings;
}

export type Toc = Page[];
