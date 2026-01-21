import React from 'react';
import { useCourse } from '../CourseContext';
import { Button } from '../ui/Button';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';

export const Footer: React.FC = () => {
  const { 
    template,
    currentPage, 
    goNext, 
    goBack, 
    toggleTranscript,
    currentPageIndex,
    totalPages,
    canAdvance
  } = useCourse();

  if (!currentPage) return null;

  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === totalPages - 1;
  const hasTranscript = !!currentPage.transcript && currentPage.transcript !== "<p>&nbsp</p>";
  
  return (
    <footer className="bg-white border-t border-gray-200 h-16 relative z-20 shrink-0">
      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        
        {/* Left: Transcript Button */}
        <div className="w-1/4">
            <button 
              onClick={toggleTranscript}
              disabled={!hasTranscript}
              className={`flex items-center justify-center p-2 rounded-lg transition-colors gap-2
                ${hasTranscript
                  ? 'text-gray-600 hover:bg-gray-100 hover:text-blue-600' 
                  : 'text-gray-300 cursor-not-allowed hidden md:flex'
                }`}
              aria-label={template.TranscriptName}
            >
              <FileText size={20} />
              <span className="hidden sm:inline text-sm font-medium">{template.TranscriptName}</span>
            </button>
        </div>

        {/* Center: Page Indicator */}
        <div className="flex-1 flex justify-center">
            <div className="text-xs md:text-sm text-gray-500 font-mono whitespace-nowrap">
                {currentPage.settings.pageNumber}
            </div>
        </div>

        {/* Right: Navigation Controls */}
        <div className="w-1/4 flex justify-end items-center space-x-2 md:space-x-3">
          <Button 
            onClick={goBack} 
            disabled={isFirstPage}
            variant="outline"
            size="sm"
            className="flex items-center px-2 md:px-3"
            aria-label={template.Prevtitle}
          >
            <ChevronLeft size={16} className="md:mr-1" /> 
            <span className="hidden md:inline">{template.Prevtitle}</span>
          </Button>

          <Button 
            onClick={goNext} 
            disabled={(!canAdvance && !isLastPage)} 
            variant="primary"
            size="sm"
            className={`flex items-center px-2 md:px-4 ${(!canAdvance && !isLastPage) ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={template.NextTitle}
          >
            <span className="hidden md:inline">{template.NextTitle}</span>
            <ChevronRight size={16} className="md:ml-1" />
          </Button>
        </div>

      </div>
    </footer>
  );
};
