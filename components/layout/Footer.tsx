import React from 'react';
import { useCourse } from '../CourseContext';
import { Button } from '../ui/Button';
import { ChevronLeft, ChevronRight, FileText, Volume2, VolumeX } from 'lucide-react';

export const Footer: React.FC = () => {
  const { 
    course,
    currentPage, 
    currentTopic, 
    goNext, 
    goBack, 
    toggleTranscript,
    currentGlobalPage,
    totalGlobalPages,
    audioProgress,
    currentTopicIndex,
    currentPageIndex,
    audioEnabled,
    setAudioEnabled,
    canAdvance,
    uiText
  } = useCourse();

  if (!currentPage || !currentTopic) return null;

  const isFirstPage = currentTopicIndex === 0 && currentPageIndex === 0;
  const hasTranscript = !!currentPage.transcript;
  const isAudioAllowed = course.globalSettings.allowAudio;

  return (
    <footer className="bg-white border-t border-gray-200 h-16 relative z-20">
      {/* Page Progress / Seek Bar (Audio Progress) */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-200" role="progressbar" aria-valuenow={audioProgress} aria-valuemin={0} aria-valuemax={100} aria-label="Audio progress">
        <div 
          className="h-full bg-blue-500 transition-all duration-200 linear"
          style={{ width: `${audioProgress}%` }}
        />
      </div>

      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        {/* Left: Transcript & Audio Toggle */}
        <div className="w-1/4 flex items-center space-x-4">
            <button 
              onClick={toggleTranscript}
              disabled={!hasTranscript || !isAudioAllowed}
              className={`flex items-center justify-center p-2 rounded-lg transition-colors gap-2
                ${hasTranscript && isAudioAllowed
                  ? 'text-gray-600 hover:bg-gray-100 hover:text-blue-600' 
                  : 'text-gray-300 cursor-not-allowed'
                }`}
              title={!isAudioAllowed ? uiText.audioDisabled : (hasTranscript ? uiText.viewTranscript : uiText.noTranscript)}
              aria-label={uiText.transcript}
            >
              <FileText size={20} />
              <span className="hidden sm:inline text-sm font-medium">{uiText.transcript}</span>
            </button>

            <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block"></div>

            <button 
              onClick={() => setAudioEnabled(!audioEnabled)}
              disabled={!isAudioAllowed}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2
                ${isAudioAllowed
                    ? 'text-gray-600 hover:bg-gray-100'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              aria-label={!isAudioAllowed ? uiText.audioDisabled : (audioEnabled ? uiText.mute : uiText.unmute)}
              title={!isAudioAllowed ? uiText.audioDisabled : (audioEnabled ? uiText.mute : uiText.unmute)}
            >
              {audioEnabled && isAudioAllowed ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
        </div>

        {/* Center: Spacer for balance */}
        <div className="hidden md:block w-1/4"></div>

        {/* Right: Navigation Controls with Page Indicator in the middle */}
        <div className="w-3/4 md:w-1/2 flex justify-end items-center space-x-2 md:space-x-4">
          <Button 
            onClick={goBack} 
            disabled={isFirstPage}
            variant="outline"
            size="sm"
            className="flex items-center"
            aria-label={uiText.back}
          >
            <ChevronLeft size={16} className="mr-1" /> {uiText.back}
          </Button>

          <div className="text-sm text-gray-500 font-mono whitespace-nowrap min-w-[80px] text-center" aria-live="polite">
             {uiText.page} {currentGlobalPage} {uiText.of} {totalGlobalPages}
          </div>

          <Button 
            onClick={goNext} 
            disabled={!canAdvance}
            variant="primary"
            size="sm"
            className="flex items-center"
            aria-label={uiText.next}
          >
            {uiText.next} <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      </div>
    </footer>
  );
};