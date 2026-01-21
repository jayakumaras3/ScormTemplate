import React, { createContext, useContext, useEffect, useState } from 'react';
import { TemplateConfig, TocData, TocPage, PageState } from '../types';
import { SCORM } from '../services/scormService';

interface CourseContextType {
  template: TemplateConfig;
  toc: TocData;
  moduleId: string;
  currentPageIndex: number;
  currentPage: TocPage | null;
  totalPages: number;
  
  goNext: () => void;
  goBack: () => void;
  goToPage: (index: number) => void;
  canAdvance: boolean;
  
  progress: Record<string, PageState>;
  markComplete: (pageName: string) => void;
  
  menuOpen: boolean;
  toggleMenu: () => void;
  transcriptOpen: boolean;
  toggleTranscript: () => void;
  showResumeDialog: boolean;
  resumeCourse: () => void;
  restartCourse: () => void;
  
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  
  isLoading: boolean;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [template, setTemplate] = useState<TemplateConfig | null>(null);
  const [toc, setToc] = useState<TocData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [moduleId, setModuleId] = useState("0");
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  
  const [audioEnabled, setAudioEnabled] = useState(false); // Initialized after load
  
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedState, setSavedState] = useState<{idx: number} | null>(null);

  const [progress, setProgress] = useState<Record<string, PageState>>({});

  // 1. FETCH CONFIGURATION
  useEffect(() => {
    const loadConfig = async () => {
        try {
            console.log("Loading configuration...");
            // Use relative path from root (public folder) with cache busting
            const timestamp = new Date().getTime();
            const [tplRes, tocRes] = await Promise.all([
                fetch(`assets/json/template.json?t=${timestamp}`),
                fetch(`assets/json/toc.json?t=${timestamp}`)
            ]);
            
            if (!tplRes.ok || !tocRes.ok) throw new Error("Failed to load configuration files (template.json or toc.json)");
            
            const tplData = await tplRes.json();
            const tocData = await tocRes.json();
            
            setTemplate(tplData);
            setToc(tocData);

            // Dynamically set Module ID from TOC
            const modules = Object.keys(tocData);
            if (modules.length > 0) {
                setModuleId(modules[0]);
            }

            setAudioEnabled(tplData.AudioVersionEnable);
            
            // Initialize SCORM
            SCORM.init();
            
            // Load Saved Progress
            const saved = localStorage.getItem(`course_progress_${tplData.CourseName}`);
            if (saved) {
                try {
                const parsed = JSON.parse(saved);
                if (parsed.idx !== undefined) {
                    setSavedState({ idx: parsed.idx });
                    if (parsed.progress) setProgress(parsed.progress);
                    // Show resume dialog only if we actually have progress
                    // (Optional: check if index > 0 or at least one page completed)
                    setShowResumeDialog(true);
                }
                } catch (e) {
                console.error("Failed to load progress", e);
                }
            }
            
            setIsLoading(false);

        } catch (err: any) {
            console.error(err);
            setError(err.message);
            setIsLoading(false);
        }
    };

    loadConfig();

    return () => { SCORM.terminate(); };
  }, []);

  const pages = toc && toc[moduleId] ? toc[moduleId] : [];
  const currentPage = pages[currentPageIndex] || null;
  const totalPages = pages.length;

  // 2. SAVE PROGRESS
  useEffect(() => {
    if (template && !showResumeDialog && !isLoading) {
      const state = {
        idx: currentPageIndex,
        progress: progress
      };
      localStorage.setItem(`course_progress_${template.CourseName}`, JSON.stringify(state));
    }
  }, [currentPageIndex, progress, showResumeDialog, template, isLoading]);

  // 3. SCROLL TO TOP
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPageIndex]);

  const resumeCourse = () => {
    if (savedState) {
      setCurrentPageIndex(savedState.idx);
    }
    setShowResumeDialog(false);
  };

  const restartCourse = () => {
    setCurrentPageIndex(0);
    setProgress({});
    if (template) localStorage.removeItem(`course_progress_${template.CourseName}`);
    setShowResumeDialog(false);
  };

  const markComplete = (pageName: string) => {
    setProgress(prev => {
        if (prev[pageName]?.completed) return prev;
        
        // Check for course completion (all pages visited?)
        // Simple check: This logic runs whenever a page completes.
        
        return {
            ...prev,
            [pageName]: { ...prev[pageName], visited: true, completed: true }
        };
    });
  };

  const goNext = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(p => p + 1);
    }
  };

  const goBack = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(p => p - 1);
    }
  };

  const goToPage = (index: number) => {
    if (index >= 0 && index < totalPages) {
      setCurrentPageIndex(index);
      setMenuOpen(false);
    }
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleTranscript = () => setTranscriptOpen(!transcriptOpen);

  if (isLoading || error || !template || !toc) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            {error ? (
                <div className="text-red-500 font-bold p-4 bg-white rounded shadow">
                    Error: {error}
                </div>
            ) : (
                <div className="text-gray-500 animate-pulse font-medium">Loading Course...</div>
            )}
        </div>
      );
  }

  const isMaster = template.master;
  const currentProgress = currentPage ? progress[currentPage.name] : undefined;
  const canAdvance = !isMaster || (currentProgress?.completed ?? false);

  const value = {
    template,
    toc,
    moduleId,
    currentPageIndex,
    currentPage,
    totalPages,
    goNext,
    goBack,
    goToPage,
    canAdvance,
    progress,
    markComplete,
    menuOpen,
    toggleMenu,
    transcriptOpen,
    toggleTranscript,
    showResumeDialog,
    resumeCourse,
    restartCourse,
    audioEnabled,
    setAudioEnabled,
    isLoading
  };

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};
