import React from 'react';
import { useCourseData } from '../CourseContext';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';

export const Footer: React.FC = () => {
  const { templateConfig, toc, currentPage, currentPageIndex, setCurrentPageIndex } = useCourseData();

  if (!templateConfig || !currentPage || !toc) {
    return <footer className="footer-placeholder" />;
  }

  const isPrevEnabled = currentPageIndex > 0;
  const isNextEnabled = currentPageIndex < toc.length - 1;

  const handlePrev = () => {
    if (isPrevEnabled) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const handleNext = () => {
    if (isNextEnabled) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  return (
    <footer className="main-footer">
      <div className="footer-left">
        <button className="transcript-button" disabled={!currentPage.transcript || currentPage.transcript === '<p>&nbsp</p>'}>
          <FileText />
          <span>{templateConfig.TranscriptName}</span>
        </button>
      </div>
      <div className="footer-center">
        <button onClick={handlePrev} disabled={!isPrevEnabled} className="nav-button prev-button">
          <ChevronLeft />
          {templateConfig.Prevtitle}
        </button>
        <span className="page-number">
          {currentPage.settings.pageNumber || `${currentPageIndex + 1}/${toc.length}`}
        </span>
        <button onClick={handleNext} disabled={!isNextEnabled} className="nav-button next-button">
          {templateConfig.NextTitle}
          <ChevronRight />
        </button>
      </div>
      <div className="footer-right"></div>
    </footer>
  );
};
