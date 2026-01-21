import React from 'react';
import { CourseProvider, useCourse } from './components/CourseContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import ContentRenderer from './components/templates/ContentRenderer';
import { ResumeDialog } from './components/ResumeDialog';
import { X, CheckCircle, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarMenu = () => {
  const { 
      toc, 
      moduleId, 
      goToPage, 
      menuOpen, 
      toggleMenu, 
      currentPageIndex, 
      progress, 
      template
  } = useCourse();
  
  if (!toc || !template) return null;
  
  const pages = toc[moduleId] || [];

  return (
    <AnimatePresence>
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={template.MenuName}>
           {/* Backdrop */}
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 bg-black bg-opacity-50"
             onClick={toggleMenu}
           />
           
           {/* Panel */}
           <motion.div 
             initial={{ x: '100%' }}
             animate={{ x: 0 }}
             exit={{ x: '100%' }}
             transition={{ type: "spring", stiffness: 300, damping: 30 }}
             className="relative bg-white w-full md:w-96 h-full shadow-2xl flex flex-col z-50"
           >
              <div className="p-4 border-b flex justify-between items-center bg-gray-50 shrink-0 h-16">
                <h2 className="font-bold text-lg text-gray-800">{template.Menutitle}</h2>
                <button onClick={toggleMenu} aria-label="Close Menu" className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  <ul className="space-y-1">
                      {pages.map((page, index) => {
                          const isActive = index === currentPageIndex;
                          const pState = progress[page.name];
                          const completed = pState?.completed;
                          
                          // Simplified locking: allow navigation if previous page visited/completed?
                          // For now, allow free navigation in menu, assuming 'master' primarily controls "Next" button flow.
                          
                          return (
                              <li key={index}>
                                  <button 
                                      onClick={() => goToPage(index)}
                                      className={`text-sm text-left w-full py-2 px-3 rounded-lg transition-colors flex justify-between items-center group
                                          ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}
                                      `}
                                  >
                                      <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="shrink-0 text-gray-400">
                                            {completed ? <CheckCircle size={14} className="text-green-500" /> : <Circle size={14} />}
                                        </div>
                                        <span className="truncate">{page.title}</span>
                                      </div>
                                  </button>
                              </li>
                          );
                      })}
                  </ul>
              </div>
           </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const TranscriptModal = () => {
    const { currentPage, transcriptOpen, toggleTranscript, template } = useCourse();
    
    // Check if transcript content exists and isn't just an empty paragraph
    const hasTranscript = transcriptOpen && currentPage?.transcript && currentPage.transcript !== "<p>&nbsp</p>";

    if (!template) return null;

    return (
        <AnimatePresence>
            {hasTranscript && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                     <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={toggleTranscript}
                     />
                     <motion.div 
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col relative z-10"
                     >
                         <div className="p-4 border-b flex justify-between items-center">
                             <h3 className="font-bold text-gray-800">{template.TranscriptName}</h3>
                             <button onClick={toggleTranscript} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                         </div>
                         <div className="p-6 overflow-y-auto prose prose-blue max-w-none">
                             <div dangerouslySetInnerHTML={{ __html: currentPage.transcript }} />
                         </div>
                     </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const CourseContent = () => {
    const { showResumeDialog, resumeCourse, restartCourse, template, isLoading } = useCourse();
    
    if (isLoading || !template) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-hidden relative">
                <ContentRenderer />
                <SidebarMenu />
                <TranscriptModal />
            </main>
            <Footer />
            <ResumeDialog 
                open={showResumeDialog} 
                onResume={resumeCourse} 
                onRestart={restartCourse}
                title={template.ResumeTitle}
                message={template.ResumeHeader}
                yesLabel={template.ResumeYES}
                noLabel={template.ResumeNO}
            />
        </div>
    );
};

export default function App() {
  return (
    <CourseProvider>
      <CourseContent />
    </CourseProvider>
  );
}
