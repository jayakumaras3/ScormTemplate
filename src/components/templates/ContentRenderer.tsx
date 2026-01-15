import React, { useEffect, useRef } from 'react';
import { Page } from '../../types';
import { useCourseData } from '../CourseContext';

interface VideoPlayerProps {
  path: string;
  onEnded: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ path, onEnded }) => {
  const { templateConfig } = useCourseData();
  const vttSrc = `assets/vtt/${templateConfig?.VttLanguage}.vtt`;

  return (
    <video controls onEnded={onEnded} className="w-full h-full object-contain" autoPlay>
      <source src={path} type="video/mp4" />
      {templateConfig?.VttLanguage && (
        <track kind="subtitles" srcLang={templateConfig.VttLanguage} src={vttSrc} label={templateConfig.VttLabel} default />
      )}
      Your browser does not support the video tag.
    </video>
  );
};

interface CaptivatePlayerProps {
  path: string;
  onCompletion: () => void;
}

const CaptivatePlayer: React.FC<CaptivatePlayerProps> = ({ path, onCompletion }) => {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.status === 'completed') {
        onCompletion();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onCompletion]);

  return (
    <iframe
      src={path}
      frameBorder="0"
      scrolling="no"
      className="w-full h-full"
      title="Captivate Content"
      sandbox="allow-scripts allow-same-origin"
    />
  );
};

interface ContentRendererProps {
  page: Page;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ page }) => {
  const contentItem = page.settings.content[0];

  if (!contentItem) {
    return <div className="error-message">Error: No content defined for this page.</div>;
  }

  const handleCompletion = () => {
    // Will be implemented later
  };

  return (
    <div className="content-container">
      {contentItem.type === 'video' && (
        <VideoPlayer 
          path={contentItem.path}
          onEnded={handleCompletion}
        />
      )}
      {contentItem.type === 'captivate' && (
        <CaptivatePlayer 
          path={contentItem.path}
          onCompletion={handleCompletion}
        />
      )}
    </div>
  );
};
