import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { CourseData, GlobalState, Page, Topic, UserProgress, TemplateType, QuestionOption } from '../types';
import { COURSE_DATA, COURSE_MAP, UI_DICTIONARY } from '../constants';
import { SCORM } from '../services/scormService';

interface CourseContextType extends GlobalState {
  course: CourseData;
  currentPage: Page | null;
  currentTopic: Topic | null;
  currentGlobalPage: number;
  totalGlobalPages: number;
  audioProgress: number; // 0 to 100
  setAudioEnabled: (enabled: boolean) => void;
  toggleMenu: () => void;
  toggleTranscript: () => void;
  goNext: () => void;
  goBack: () => void;
  goToPage: (topicId: string, pageId: string) => void;
  submitAnswer: (pageId: string, answer: any, isCorrect: boolean) => void;
  markComplete: (pageId: string) => void;
  playAudio: () => void;
  pauseAudio: () => void;
  canAdvance: boolean;
  isTopicLocked: (topicId: string) => boolean;
  isPageLocked: (pageId: string) => boolean;
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  uiText: Record<string, string>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [course, setCourse] = useState<CourseData>(COURSE_DATA);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  
  // Navigation State
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  // UI State
  const [menuOpen, setMenuOpen] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  
  // Audio State
  const [audioEnabled, setAudioEnabled] = useState(course.globalSettings.allowAudio);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  // User Progress & Gamification
  const [progress, setProgress] = useState<UserProgress>({});
  const [totalStars, setTotalStars] = useState(0);
  const [assessmentScore, setAssessmentScore] = useState(0);
  const [assessmentQuestions, setAssessmentQuestions] = useState<Page[]>([]);

  // Derived state
  const currentTopic = course.topics[currentTopicIndex];
  const currentPage = currentTopic?.pages[currentPageIndex];
  const uiText = UI_DICTIONARY[currentLanguage] || UI_DICTIONARY['en'];

  // Global Page Logic
  const allPages = course.topics.flatMap(t => t.pages);
  const currentGlobalPage = currentPage ? allPages.findIndex(p => p.id === currentPage.id) + 1 : 1;
  const totalGlobalPages = allPages.length;

  // Identify Interactive Templates
  const interactiveTemplates = [
    TemplateType.TABS,
    TemplateType.ACCORDION,
    TemplateType.FLIP_CARDS,
    TemplateType.NARRATIVE,
    TemplateType.CHAT,
    TemplateType.SAMC,
    TemplateType.MAMC,
    TemplateType.MATCHING,
    TemplateType.SLIDER,
    TemplateType.SORTING
  ];

  // Initialize SCORM and Assessment
  useEffect(() => {
    SCORM.init();
    
    // Prepare Assessment Questions (Randomization logic would go here)
    const assessTopic = course.topics.find(t => t.isAssessment);
    if (assessTopic) {
        setAssessmentQuestions(assessTopic.pages.filter(p => 
            p.template !== TemplateType.ASSESSMENT_INTRO && 
            p.template !== TemplateType.ASSESSMENT_RESULT
        ));
    }

    return () => {
      SCORM.terminate();
    };
  }, [course]);

  // Audio Manager & Auto-Completion Logic
  useEffect(() => {
    const audio = audioRef.current;
    const isInteractive = currentPage ? interactiveTemplates.includes(currentPage.template) : false;
    
    // Stop previous audio
    audio.pause();
    audio.currentTime = 0;
    setAudioPlaying(false);
    setAudioProgress(0);

    const handleTimeUpdate = () => {
        if (audio.duration) {
            setAudioProgress((audio.currentTime / audio.duration) * 100);
        }
    };

    const handleEnded = () => {
        setAudioPlaying(false);
        setAudioProgress(100);
        // Only mark complete automatically if the page is NOT interactive.
        // Interactive pages require user interaction to complete.
        if (!isInteractive && currentPage) {
            markComplete(currentPage.id);
        }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    if (currentPage?.audioSrc) {
        if(audioEnabled) {
          audio.src = currentPage.audioSrc;
          audio.load();
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => setAudioPlaying(true))
              .catch(err => console.log("Audio autoplay blocked", err));
          }
        }
        
        // If audio exists but is disabled, we check if we can auto-complete.
        if (!audioEnabled) {
             if (!isInteractive) {
                 markComplete(currentPage.id);
             }
        }
    } else {
        // If no audio, mark complete immediately only if NOT interactive.
        if (currentPage && !isInteractive) {
            markComplete(currentPage.id);
        }
    }

    return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.pause();
    };
  }, [currentPage, audioEnabled]);


  const markComplete = (pageId: string) => {
    setProgress(prev => ({
        ...prev,
        [pageId]: { 
            visited: true, 
            completed: true, 
            score: prev[pageId]?.score || 0,
            attempts: prev[pageId]?.attempts || 0,
            answer: prev[pageId]?.answer,
            isLocked: false
        }
    }));
  };

  const submitAnswer = (pageId: string, answer: any, isCorrect: boolean) => {
    setProgress(prev => {
        const currentProgress = prev[pageId] || { visited: false, completed: false, score: 0, attempts: 0, isLocked: false };
        const newAttempts = (currentProgress.attempts || 0) + 1;
        let stars = 0;

        // Gamification Logic (Only for Knowledge Checks, not final assessment, and if topic allows stars)
        if (!currentTopic.isAssessment && !currentTopic.hideStars && isCorrect && !currentProgress.completed) {
            if (newAttempts === 1) stars = 3;
            else if (newAttempts === 2) stars = 2;
            else stars = 1;
        }

        // Update Total Stars if newly earned
        if (stars > 0) {
            setTotalStars(s => s + stars);
        }
        
        // Completion Logic:
        // - Assessment questions always complete on submission.
        // - Knowledge Checks complete if Correct OR Max attempts reached.
        const maxAttempts = currentPage?.settings?.attemptsAllowed || 1;
        const attemptsExhausted = newAttempts >= maxAttempts;
        const isComplete = currentTopic.isAssessment || isCorrect || attemptsExhausted;

        return {
            ...prev,
            [pageId]: {
                visited: true,
                completed: isComplete,
                attempts: newAttempts,
                score: stars,
                answer: answer,
                isLocked: false
            }
        };
    });
  };

  const isTopicLocked = (topicId: string) => {
      if (!course.globalSettings.lockModules) return false;
      const tIdx = course.topics.findIndex(t => t.id === topicId);
      if (tIdx <= 0) return false; // First topic always open
      
      // Check if previous topic is complete (all pages visited/completed)
      const prevTopic = course.topics[tIdx - 1];
      const lastPageId = prevTopic.pages[prevTopic.pages.length - 1].id;
      return !progress[lastPageId]?.completed;
  };

  const isPageLocked = (pageId: string) => {
      // Find page and topic to determine template type
      let page: Page | undefined;
      let topic: Topic | undefined;
      for (const t of course.topics) {
          const p = t.pages.find(pg => pg.id === pageId);
          if (p) {
              page = p;
              topic = t;
              break;
          }
      }

      // Special Logic: Assessment Result strictly requires all assessment questions to be completed
      if (page?.template === TemplateType.ASSESSMENT_RESULT && topic) {
          const questions = topic.pages.filter(p => p.template === TemplateType.SAMC || p.template === TemplateType.MAMC);
          const allAnswered = questions.every(q => progress[q.id]?.completed);
          if (!allAnswered) {
              return true; // Strictly locked until assessment is done
          }
          // If assessment is done, we allow access (return false unlocks it)
          return false;
      }

      if (!course.globalSettings.lockPages) return false;
      
      // Find where this page is
      let tIdx = -1;
      let pIdx = -1;
      
      course.topics.forEach((t, ti) => {
          const pi = t.pages.findIndex(p => p.id === pageId);
          if (pi !== -1) {
              tIdx = ti;
              pIdx = pi;
          }
      });
      
      if (tIdx === -1) return false;
      
      // First page of first topic is always open
      if (tIdx === 0 && pIdx === 0) return false;

      // If it's the first page of a subsequent topic, check if previous topic is done
      if (pIdx === 0) {
          return isTopicLocked(course.topics[tIdx].id);
      }

      // Otherwise check if previous page in same topic is completed
      const prevPageId = course.topics[tIdx].pages[pIdx - 1].id;
      return !progress[prevPageId]?.completed;
  };

  const checkCanAdvance = () => {
      if (!course.globalSettings.lockPages) return true;
      if (!currentPage) return false;
      
      // Always allow advancing from Menu or Landing
      if (currentPage.template === TemplateType.TOPIC_MENU || currentPage.template === TemplateType.LANDING) {
          return true;
      }
      
      const pState = progress[currentPage.id];
      // If page is completed, we can advance
      if (pState?.completed) return true;
      
      return false;
  };

  const canAdvance = checkCanAdvance();

  const goNext = () => {
    if (!canAdvance) {
        return;
    }

    if (currentPageIndex < currentTopic.pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    } else if (currentTopicIndex < course.topics.length - 1) {
      setCurrentTopicIndex(prev => prev + 1);
      setCurrentPageIndex(0);
    } else {
        // End of course
        SCORM.setCompletion('completed', 100);
        alert("Course Completed!");
    }
  };

  const goBack = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    } else if (currentTopicIndex > 0) {
      const prevTopic = course.topics[currentTopicIndex - 1];
      setCurrentTopicIndex(prev => prev - 1);
      setCurrentPageIndex(prevTopic.pages.length - 1);
    }
  };

  const goToPage = (topicId: string, pageId: string) => {
      if (isPageLocked(pageId)) return;

      const tIdx = course.topics.findIndex(t => t.id === topicId);
      if (tIdx > -1) {
          const pIdx = course.topics[tIdx].pages.findIndex(p => p.id === pageId);
          if (pIdx > -1) {
              setCurrentTopicIndex(tIdx);
              setCurrentPageIndex(pIdx);
              setMenuOpen(false);
          }
      }
  };
  
  const setLanguage = (lang: string) => {
      if (COURSE_MAP[lang]) {
          setCourse(COURSE_MAP[lang]);
          setCurrentLanguage(lang);
      }
  };

  return (
    <CourseContext.Provider value={{
      course,
      currentTopicIndex,
      currentPageIndex,
      currentTopic,
      currentPage,
      currentGlobalPage,
      totalGlobalPages,
      audioEnabled,
      audioPlaying,
      audioProgress,
      progress,
      totalStars,
      assessmentScore,
      assessmentQuestions,
      menuOpen,
      transcriptOpen,
      setAudioEnabled,
      toggleMenu: () => setMenuOpen(prev => !prev),
      toggleTranscript: () => setTranscriptOpen(prev => !prev),
      goNext,
      goBack,
      goToPage,
      submitAnswer,
      markComplete,
      playAudio: () => audioRef.current.play(),
      pauseAudio: () => audioRef.current.pause(),
      canAdvance,
      isTopicLocked,
      isPageLocked,
      currentLanguage,
      setLanguage,
      uiText
    }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) throw new Error("useCourse must be used within a CourseProvider");
  return context;
};