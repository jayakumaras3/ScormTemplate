import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TemplateConfig, Toc, Page } from '../types';
import { loadTemplateConfig, loadToc } from '../services/courseDataService';

interface CourseContextData {
  templateConfig: TemplateConfig | null;
  toc: Toc | null;
  currentPage: Page | null;
  currentPageIndex: number;
  setCurrentPageIndex: (index: number) => void;
}

const CourseContext = createContext<CourseContextData | undefined>(undefined);

export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig | null>(null);
  const [toc, setToc] = useState<Toc | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [config, tocData] = await Promise.all([loadTemplateConfig(), loadToc()]);
        setTemplateConfig(config);
        setToc(tocData);
      } catch (error) {
        console.error('Error loading course data:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (toc && toc.length > 0) {
      setCurrentPage(toc[currentPageIndex]);
    }
  }, [toc, currentPageIndex]);

  const contextValue: CourseContextData = {
    templateConfig,
    toc,
    currentPage,
    currentPageIndex,
    setCurrentPageIndex,
  };

  return <CourseContext.Provider value={contextValue}>{children}</CourseContext.Provider>;
};

export const useCourseData = (): CourseContextData => {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourseData must be used within a CourseProvider');
  }
  return context;
};
