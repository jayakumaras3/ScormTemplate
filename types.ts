export enum TemplateType {
  LANDING = 'landing',
  TOPIC_MENU = 'topic_menu',
  TEXT_ONLY = 'text_only',
  TEXT_IMAGE = 'text_image',
  VIDEO = 'video',
  TABS = 'tabs',
  ACCORDION = 'accordion',
  FLIP_CARDS = 'flip_cards',
  NARRATIVE = 'narrative',
  CHAT = 'chat',
  SAMC = 'samc', // Single Answer Multiple Choice
  MAMC = 'mamc', // Multiple Answer Multiple Choice
  MATCHING = 'matching',
  SLIDER = 'slider',
  SORTING = 'sorting',
  ASSESSMENT_INTRO = 'assessment_intro',
  ASSESSMENT_RESULT = 'assessment_result'
}

export enum LayoutType {
  FULL = 'full',
  LEFT_MEDIA = 'left_media',
  RIGHT_MEDIA = 'right_media'
}

export interface MediaAsset {
  type: 'image' | 'video' | 'youtube';
  src: string;
  alt?: string;
  poster?: string; // For videos
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean; // For KC
  matchId?: string; // For matching
}

export interface PageContent {
  heading?: string;
  body?: string; // HTML string allowed
  media?: MediaAsset;
  items?: { title: string; content: string }[]; // For tabs, accordion, carousel
  options?: QuestionOption[]; // For questions
  conversation?: { speaker: string; text: string; avatar: string }[]; // For chat
  instruction?: string; // Optional override for instruction text
  // New content types
  matchingPairs?: { id: string; left: string; right: string }[];
  slider?: { min: number; max: number; step: number; correctValue: number; unit?: string; labels?: { value: number; label: string }[] };
  sortingItems?: { id: string; text: string }[]; // The source array is assumed to be the correct order
}

export interface Page {
  id: string;
  title: string;
  template: TemplateType;
  layout: LayoutType;
  audioSrc?: string;
  transcript?: string;
  content: PageContent;
  settings?: {
    requiredToProceed?: boolean;
    attemptsAllowed?: number; // For KC
  };
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  pages: Page[];
  isLocked?: boolean;
  isAssessment?: boolean;
  duration?: string; // e.g. "10 Mins"
  hideStars?: boolean;
}

export interface GlobalSettings {
  passScore: number;
  allowAudio: boolean;
  shuffleAssessment: boolean;
  lockModules: boolean; // New: Lock future modules
  lockPages: boolean;   // New: Lock future pages
  gamification: boolean; // Control visibility of gamification UI
  multiLanguage: boolean; // Enable language switching
  supportedLanguages: { code: string; label: string }[]; // List of available languages
}

export interface CourseData {
  id: string;
  title: string;
  description: string;
  featureImage: string;
  topics: Topic[];
  globalSettings: GlobalSettings;
}

export interface UserProgress {
  [pageId: string]: {
    visited: boolean;
    completed: boolean;
    score: number; // Stars (0-3)
    attempts: number;
    answer?: string | string[] | Record<string, string>; // User selection
    isLocked: boolean;
  };
}

export interface GlobalState {
  currentTopicIndex: number;
  currentPageIndex: number; // Relative to topic
  audioEnabled: boolean;
  audioPlaying: boolean;
  progress: UserProgress;
  totalStars: number;
  assessmentScore: number;
  menuOpen: boolean;
  transcriptOpen: boolean;
  assessmentQuestions: Page[]; // Randomized subset
}