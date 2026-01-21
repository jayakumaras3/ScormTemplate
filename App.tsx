import React from 'react';
import { CourseProvider, useCourse } from './components/CourseContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ContentRenderer } from './components/templates/ContentRenderer';
import { X, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TemplateType } from './types';

const SidebarMenu = () => {
  const { course, goToPage, menuOpen, toggleMenu, currentPage, isPageLocked, uiText } = useCourse();
  if (!menuOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex">
      <div className="bg-white w-80 h-full shadow-2xl flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-lg text-gray-800">{uiText.menu}</h2>
          <button onClick={toggleMenu} aria-label={uiText.close}><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {course.topics.map((topic) => (
            <div key={topic.id}>
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-2">{topic.title}</h3>
              <ul className="space-y-1 ml-2 border-l-2 border-gray-100 pl-2">
                {topic.pages.filter(page => {
                    // Hide individual questions in Assessment topics, only show Intro and Result
                    if (topic.isAssessment) {
                        return page.template === TemplateType.ASSESSMENT_INTRO || page.template === TemplateType.ASSESSMENT_RESULT;
                    }
                    return true;
                }).map((page) => {
                    const isActive = page.id === currentPage?.id;
                    const locked = isPageLocked(page.id);

                    return (
                        <li key={page.id}>
                            <button 
                                onClick={() => !locked && goToPage(topic.id, page.id)}
                                disabled={locked}
                                className={`text-sm text-left w-full py-1 px-2 rounded transition-colors flex justify-between items-center
                                    ${isActive ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}
                                    ${locked ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                <span className="truncate">{page.title}</span>
                                {locked && <Lock size={12} className="text-gray-400 ml-2" aria-label={uiText.locked} />}
                            </button>
                        </li>
                    );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 bg-black bg-opacity-50" onClick={toggleMenu} role="presentation"></div>
    </div>
  );
};

const TranscriptModal = () => {
  const { currentPage, transcriptOpen, toggleTranscript, uiText } = useCourse();
  const hasContent = transcriptOpen && currentPage?.transcript;

  return (
    <AnimatePresence>
      {hasContent && (
        <motion.div 
            initial={{ opacity: 0, y: 20, x: -20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, x: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute bottom-4 left-4 lg:left-8 z-40 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col h-[500px]"
            role="dialog"
            aria-label={uiText.audioTranscript}
        >
            <div className="bg-gray-100 p-3 flex justify-between items-center border-b shrink-0">
                <h3 className="font-bold text-sm text-gray-700">{uiText.audioTranscript}</h3>
                <button onClick={toggleTranscript} className="text-gray-500 hover:text-gray-700" aria-label={uiText.close}><X size={16}/></button>
            </div>
            <div 
                className="p-4 overflow-y-auto text-sm text-gray-600 leading-relaxed flex-1 min-h-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>p]:mb-3 [&>b]:font-bold [&>strong]:font-bold [&>i]:italic [&>em]:italic"
                dangerouslySetInnerHTML={{ __html: currentPage.transcript || '' }}
            />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const AppContent = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
       <Header />
       <main className="flex-1 relative overflow-hidden">
          <ContentRenderer />
          <SidebarMenu />
          <TranscriptModal />
       </main>
       <Footer />
    </div>
  );
}

const App: React.FC = () => {
  return (
    <CourseProvider>
        <AppContent />
    </CourseProvider>
  );
};

export default App;