import React, { useEffect, useRef } from 'react';
import { useCourse } from '../CourseContext';

const ContentRenderer: React.FC = () => {
  // @ts-ignore - The context type is updated but TS might drag behind in this environment if files aren't synced perfectly
  const { currentPage, goNext } = useCourse();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.load();
    }
  }, [currentPage]);

  if (!currentPage) return <div className="p-10">Loading...</div>;

  const content = currentPage.settings.content[0];
  const showHeader = currentPage.settings.header;

  return (
    <div className="w-full h-full flex flex-col">
       {showHeader && (
           <div className="bg-slate-50 p-4 border-b">
               <h1 className="text-2xl font-bold text-gray-800">{currentPage.header}</h1>
           </div>
       )}
       
       <div className="flex-1 relative overflow-auto">
           {content.type === 'captivate' && (
               <iframe 
                   src={content.path}
                   title={currentPage.title}
                   className="w-full h-full border-0 min-h-[600px]"
                   allow="autoplay"
                   sandbox="allow-same-origin allow-scripts allow-forms"
               />
           )}

           {content.type === 'video' && (
               <div className="flex justify-center items-center h-full bg-black">
                   <video 
                       ref={videoRef}
                       controls 
                       className="max-h-full max-w-full"
                       src={content.path}
                       onEnded={() => {
                           if (content.onendnextscrn === "true") {
                               goNext();
                           }
                       }}
                   >
                       Your browser does not support the video tag.
                   </video>
               </div>
           )}
       </div>
    </div>
  );
};

export default ContentRenderer;
