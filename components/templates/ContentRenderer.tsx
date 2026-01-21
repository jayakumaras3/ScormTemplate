import React, { useState, useEffect, useMemo } from 'react';
import { useCourse } from '../CourseContext';
import { Page, TemplateType, LayoutType } from '../../types';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, ChevronLeft, CheckCircle, XCircle, Lock, Square, CheckSquare, GripVertical, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';

// --- CONSTANTS ---
// Removed h-full from layout to allow natural growth, preventing double scrollbars.
const PAGE_LAYOUT = "w-full max-w-6xl mx-auto p-6 lg:p-12";

// --- Sub-Components for Templates ---

const InstructionText = ({ text }: { text?: string }) => {
    if (!text) return null;
    return (
        <p className="text-sm text-blue-600 italic mb-4" role="note">
            {text}
        </p>
    );
};

const TextContent = ({ title, body }: { title?: string, body: string }) => (
  <div className="prose prose-blue max-w-none mb-4">
    {title && <h2 className="text-2xl font-bold mb-4 text-gray-800">{title}</h2>}
    <div dangerouslySetInnerHTML={{ __html: body }} />
  </div>
);

const MediaContent = ({ media }: { media: any }) => {
  if (!media) return null;
  return (
    <div className="rounded-lg overflow-hidden shadow-lg border border-gray-100">
      {media.type === 'image' && (
        <img src={media.src} alt="content" className="w-full h-auto object-cover" />
      )}
      {media.type === 'video' && (
        <video controls poster={media.poster} className="w-full">
          <source src={media.src} type="video/mp4" />
        </video>
      )}
    </div>
  );
};

// --- Helper: Interactive Footer ---

interface InteractiveFooterProps {
    isCorrect: boolean;
    attemptsExhausted: boolean;
    showFeedback: boolean;
    canRetry: boolean;
    isSubmitDisabled: boolean;
    viewingCorrect: boolean;
    onSubmit: () => void;
    onRetry: () => void;
    onToggleAnswers: (showCorrect: boolean) => void;
    uiText: Record<string, string>;
    onContinue: () => void;
}

const InteractiveFooter: React.FC<InteractiveFooterProps> = ({
    isCorrect,
    attemptsExhausted,
    showFeedback,
    canRetry,
    isSubmitDisabled,
    viewingCorrect,
    onSubmit,
    onRetry,
    onToggleAnswers,
    uiText,
    onContinue
}) => {
    return (
        <div className="mt-8">
            <div className="flex flex-wrap items-center gap-4">
                {/* 1. SUCCESS STATE - Show Disabled Submit */}
                {isCorrect && showFeedback && (
                    <Button disabled className="px-8">
                        {uiText.submit}
                    </Button>
                )}

                {/* 2. EXHAUSTED STATE */}
                {!isCorrect && attemptsExhausted && (
                    <div className="flex gap-4 items-center">
                        <Button 
                            onClick={() => onToggleAnswers(false)} 
                            variant={!viewingCorrect ? 'primary' : 'outline'}
                            className={!viewingCorrect ? 'bg-blue-600' : ''}
                        >
                            {uiText.myAnswers}
                        </Button>
                        <Button 
                            onClick={() => onToggleAnswers(true)} 
                            variant={viewingCorrect ? 'primary' : 'outline'}
                            className={viewingCorrect ? 'bg-green-600 border-green-600 text-white hover:bg-green-700' : ''}
                        >
                            {uiText.showAnswers}
                        </Button>
                    </div>
                )}

                {/* 3. RETRY STATE */}
                {!isCorrect && !attemptsExhausted && showFeedback && (
                    <Button onClick={onRetry} className="bg-orange-500 hover:bg-orange-600 focus:ring-orange-400">
                        {uiText.retry}
                    </Button>
                )}

                {/* 4. INPUT STATE (Default) */}
                {!showFeedback && (
                     <Button onClick={onSubmit} disabled={isSubmitDisabled} className="px-8">
                        {uiText.submit}
                    </Button>
                )}
            </div>

            {/* FEEDBACK MESSAGE */}
            <AnimatePresence>
                {showFeedback && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`mt-4 p-4 rounded-lg flex items-center gap-3 font-medium text-lg
                            ${isCorrect ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}
                        `}
                    >
                        {isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
                        <span>
                            {isCorrect 
                                ? uiText.correct 
                                : attemptsExhausted 
                                    ? uiText.attemptsExhausted 
                                    : uiText.incorrect}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Templates ---

const LandingTemplate = ({ page, onStart }: { page: Page, onStart: () => void }) => {
    const { uiText } = useCourse();
    // Use min-h-full to allow scrolling if content is tall, but fill screen otherwise.
    return (
        <div className="flex flex-col md:flex-row min-h-full">
            <div className="w-full md:w-1/2 p-6 lg:p-12 flex flex-col justify-center bg-blue-50">
                <h1 className="text-4xl lg:text-5xl font-extrabold text-blue-900 mb-6 leading-tight">
                    {page.content.heading}
                </h1>
                <p className="text-lg text-blue-700 mb-8 leading-relaxed">
                    {page.content.body}
                </p>
                <div>
                    <Button size="lg" onClick={onStart}>{uiText.startCourse}</Button>
                </div>
            </div>
            <div className="w-full md:w-1/2 min-h-[300px] md:min-h-full bg-cover bg-center" style={{ backgroundImage: `url('${page.content.media?.src || 'https://picsum.photos/id/20/800/800'}')` }} role="img" aria-label="Course cover image" />
        </div>
    );
};

const TopicMenuTemplate = () => {
  const { course, goToPage, progress, isTopicLocked, uiText } = useCourse();
  const visibleTopics = course.topics.filter(t => t.id !== 't_intro');

  return (
    <div className={`${PAGE_LAYOUT}`}>
      <h2 className="text-3xl font-bold mb-8 text-left text-gray-800">{uiText.menu}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
        {visibleTopics.map((topic, tIdx) => {
            let topicStars = 0;
            topic.pages.forEach(p => {
                if(progress[p.id]?.score) topicStars += progress[p.id].score;
            });
            
            const locked = isTopicLocked(topic.id);

            return (
              <div 
                key={topic.id} 
                className={`bg-white p-6 rounded-xl shadow border transition-all flex flex-col relative
                    ${locked ? 'border-gray-200 opacity-60 cursor-not-allowed' : 'border-gray-100 hover:shadow-lg cursor-pointer group'}
                `}
                onClick={() => !locked && goToPage(topic.id, topic.pages[0].id)}
                role="listitem"
                tabIndex={locked ? -1 : 0}
                onKeyDown={(e) => {
                    if (!locked && (e.key === 'Enter' || e.key === ' ')) {
                        goToPage(topic.id, topic.pages[0].id);
                    }
                }}
              >
                {locked && (
                    <div className="absolute top-4 right-4 text-gray-400" aria-label={uiText.locked}>
                        <Lock size={20} />
                    </div>
                )}
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded ${locked ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-600'}`}>
                    {uiText.module} {tIdx + 1}
                  </span>
                  {!topic.isAssessment && !topic.hideStars && !locked && course.globalSettings.gamification && (
                      <div className="flex items-center text-yellow-500">
                        <span className="font-bold mr-1">{topicStars}</span> 
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      </div>
                  )}
                </div>
                <h3 className={`text-xl font-bold mb-2 ${locked ? 'text-gray-500' : 'text-gray-800 group-hover:text-blue-600'} transition-colors`}>{topic.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">{topic.description}</p>
                {topic.duration && (
                    <div className="text-xs text-gray-500 font-medium pt-3 border-t border-gray-100">
                        {uiText.duration}: {topic.duration}
                    </div>
                )}
              </div>
            );
        })}
      </div>
    </div>
  );
};

const StandardTemplate = ({ page }: { page: Page }) => {
  const isRightMedia = page.layout === LayoutType.RIGHT_MEDIA;
  const isLeftMedia = page.layout === LayoutType.LEFT_MEDIA;
  
  return (
    <div className={`${PAGE_LAYOUT} flex flex-col min-h-full justify-center ${isRightMedia ? 'md:flex-row' : isLeftMedia ? 'md:flex-row-reverse' : ''} gap-6 items-center`}>
      <div className={`w-full ${page.layout !== LayoutType.FULL ? 'md:w-1/2' : ''}`}>
        <TextContent title={page.content.heading} body={page.content.body || ''} />
        <InstructionText text={page.content.instruction} />
      </div>
      {page.content.media && (
        <div className="w-full md:w-1/2">
          <MediaContent media={page.content.media} />
        </div>
      )}
    </div>
  );
};

const TabsTemplate = ({ page }: { page: Page }) => {
  const { markComplete, progress } = useCourse();
  const [activeTab, setActiveTab] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const items = page.content.items || [];

  const handleTabClick = (idx: number) => {
      setActiveTab(idx);
      setVisited(prev => new Set(prev).add(idx));
  };

  useEffect(() => {
      if (visited.size === items.length && !progress[page.id]?.completed) {
          markComplete(page.id);
      }
  }, [visited, items.length, page.id, progress, markComplete]);

  return (
    <div className={`${PAGE_LAYOUT} flex flex-col min-h-full`}>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{page.content.heading}</h2>
      
      {page.content.body && (
          <div className="prose prose-blue max-w-none mb-6 text-gray-600" dangerouslySetInnerHTML={{ __html: page.content.body }} />
      )}
      
      <InstructionText text={page.content.instruction} />

      <div className="flex space-x-2 border-b border-gray-200 mb-6 overflow-x-auto" role="tablist">
        {items.map((item, idx) => (
          <button
            key={idx}
            role="tab"
            aria-selected={activeTab === idx}
            onClick={() => handleTabClick(idx)}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === idx 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {item.title}
            {visited.has(idx) && <CheckCircle size={12} className="text-green-500" aria-hidden="true" />}
          </button>
        ))}
      </div>
      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex-1"
        role="tabpanel"
      >
        <div className="prose" dangerouslySetInnerHTML={{ __html: items[activeTab].content }} />
      </motion.div>
    </div>
  );
};

const AccordionTemplate = ({ page }: { page: Page }) => {
  const { markComplete, progress } = useCourse();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const items = page.content.items || [];

  const handleToggle = (idx: number) => {
      const isOpen = openIndex === idx;
      setOpenIndex(isOpen ? null : idx);
      if(!isOpen) {
          setVisited(prev => new Set(prev).add(idx));
      }
  };

  useEffect(() => {
    if (visited.size === items.length && !progress[page.id]?.completed) {
        markComplete(page.id);
    }
  }, [visited, items.length, page.id, progress, markComplete]);

  return (
    <div className={`${PAGE_LAYOUT} min-h-full`}>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{page.content.heading}</h2>
      
      {page.content.body && (
          <div className="prose prose-blue max-w-none mb-6 text-gray-600" dangerouslySetInnerHTML={{ __html: page.content.body }} />
      )}
      
      <InstructionText text={page.content.instruction} />

      <div className="space-y-4">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
              <button
                onClick={() => handleToggle(idx)}
                aria-expanded={isOpen}
                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{item.title}</span>
                    {visited.has(idx) && <CheckCircle size={14} className="text-green-500" aria-hidden="true" />}
                </div>
                <ChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} size={20} />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 border-t border-gray-100 prose text-gray-600">
                        {item.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const NarrativeTemplate = ({ page }: { page: Page }) => {
    const { markComplete, progress } = useCourse();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visited, setVisited] = useState<Set<number>>(new Set([0]));
    const items = page.content.items || [];
    const currentItem = items[currentIndex];

    const nextSlide = () => {
        const nextIdx = Math.min(currentIndex + 1, items.length - 1);
        setCurrentIndex(nextIdx);
        setVisited(prev => new Set(prev).add(nextIdx));
    };

    const prevSlide = () => setCurrentIndex(prev => Math.max(prev - 1, 0));

    useEffect(() => {
        if (visited.size === items.length && !progress[page.id]?.completed) {
            markComplete(page.id);
        }
    }, [visited, items.length, page.id, progress, markComplete]);

    return (
        <div className={`${PAGE_LAYOUT} flex flex-col min-h-full`}>
             <h2 className="text-2xl font-bold mb-4 text-gray-800">{page.content.heading}</h2>
             
             {page.content.body && (
                <div className="prose prose-blue max-w-none mb-6 text-gray-600" dangerouslySetInnerHTML={{ __html: page.content.body }} />
             )}

             <div className="flex-1 flex flex-col md:flex-row gap-6 items-center">
                 <div className="w-full md:w-1/2 h-64 md:h-96 bg-blue-100 rounded-xl flex items-center justify-center text-blue-300" aria-hidden="true">
                    <span className="text-6xl font-bold opacity-50">{currentIndex + 1}</span>
                 </div>
                 <div className="w-full md:w-1/2 flex flex-col justify-center h-full">
                     <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-4"
                        role="region"
                        aria-live="polite"
                     >
                        <h3 className="text-xl font-bold mb-3 text-blue-900">{currentItem.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{currentItem.content}</p>
                     </motion.div>
                     
                     <InstructionText text={page.content.instruction} />

                     <div className="flex space-x-4">
                         <Button onClick={prevSlide} disabled={currentIndex === 0} variant="outline" size="sm" aria-label="Previous slide">
                             <ChevronLeft size={20} />
                         </Button>
                         <div className="flex space-x-2 items-center" role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemin={1} aria-valuemax={items.length}>
                            {items.map((_, idx) => (
                                <div key={idx} className={`w-2 h-2 rounded-full ${idx === currentIndex ? 'bg-blue-600' : 'bg-gray-300'}`} />
                            ))}
                         </div>
                         <Button onClick={nextSlide} disabled={currentIndex === items.length - 1} variant="outline" size="sm" aria-label="Next slide">
                             <ChevronRight size={20} />
                         </Button>
                     </div>
                 </div>
             </div>
        </div>
    );
};

const FlipCardTemplate = ({ page }: { page: Page }) => {
    const { markComplete, progress } = useCourse();
    const [flipped, setFlipped] = useState<number | null>(null);
    const [visited, setVisited] = useState<Set<number>>(new Set());
    const items = page.content.items || [];
    
    const handleFlip = (idx: number) => {
        setFlipped(flipped === idx ? null : idx);
        setVisited(prev => new Set(prev).add(idx));
    };

    useEffect(() => {
        if (visited.size === items.length && !progress[page.id]?.completed) {
            markComplete(page.id);
        }
    }, [visited, items.length, page.id, progress, markComplete]);
  
    return (
      <div className={`${PAGE_LAYOUT} min-h-full`}>
        <h2 className="text-2xl font-bold mb-4 text-left text-gray-800">{page.content.heading}</h2>
        
        {page.content.body && (
            <div className="prose prose-blue max-w-none mb-6 text-gray-600" dangerouslySetInnerHTML={{ __html: page.content.body }} />
        )}
        
        <InstructionText text={page.content.instruction} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <div 
                key={idx} 
                className="h-64 cursor-pointer perspective-1000 group"
                onClick={() => handleFlip(idx)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleFlip(idx)}
                tabIndex={0}
                role="button"
                aria-pressed={flipped === idx}
            >
                <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${flipped === idx ? 'rotate-y-180' : ''}`}>
                    <div className="absolute inset-0 w-full h-full bg-blue-600 text-white rounded-xl shadow-lg flex flex-col justify-center p-4 backface-hidden items-start text-left">
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <p className="absolute bottom-4 left-4 text-xs opacity-70">Select to flip</p>
                        {visited.has(idx) && (
                             <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                                <CheckCircle size={12} className="text-blue-600" />
                             </div>
                        )}
                    </div>
                    <div className="absolute inset-0 w-full h-full bg-white text-gray-800 rounded-xl shadow-lg border border-blue-100 flex flex-col justify-center p-6 rotate-y-180 backface-hidden items-start text-left">
                        <p>{item.content}</p>
                    </div>
                </div>
            </div>
          ))}
        </div>
      </div>
    );
};

const ChatTemplate = ({ page }: { page: Page }) => {
    const { markComplete, progress } = useCourse();
    const conversations = page.content.conversation || [];
    const [visibleCount, setVisibleCount] = useState(1);
    
    const showNext = () => {
        setVisibleCount(prev => Math.min(prev + 1, conversations.length));
    };

    useEffect(() => {
        if (visibleCount === conversations.length && !progress[page.id]?.completed) {
            markComplete(page.id);
        }
    }, [visibleCount, conversations.length, page.id, progress, markComplete]);

    return (
        <div className={`${PAGE_LAYOUT} h-full flex flex-col`}>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">{page.content.heading}</h2>
            
            {page.content.body && (
                <div className="prose prose-blue max-w-none mb-6 text-gray-600" dangerouslySetInnerHTML={{ __html: page.content.body }} />
            )}
            
            <InstructionText text={page.content.instruction} />

            <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4" role="log" aria-live="polite">
                {conversations.slice(0, visibleCount).map((msg, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-start gap-4 ${idx % 2 !== 0 ? 'flex-row-reverse' : ''}`}
                    >
                        <img src={msg.avatar} alt={msg.speaker} className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300" />
                        <div className={`p-4 rounded-2xl max-w-[80%] shadow-sm ${idx % 2 === 0 ? 'bg-white border border-gray-200 rounded-tl-none' : 'bg-blue-100 text-blue-900 rounded-tr-none'}`}>
                            <p className="text-xs font-bold mb-1 opacity-70">{msg.speaker}</p>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                    </motion.div>
                ))}
                
                {visibleCount < conversations.length && (
                    <div className="flex justify-center pt-2">
                        <button 
                            onClick={showNext}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full p-2 transition-colors animate-bounce shadow-sm border border-blue-200"
                            aria-label="Next message"
                        >
                            <ChevronDown size={24} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- INTERACTIVE TEMPLATES (Quiz, Matching, Slider, Sorting) ---

const QuizTemplate = ({ page }: { page: Page }) => {
  const { progress, submitAnswer, uiText, goNext } = useCourse();
  const [selected, setSelected] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [viewingCorrect, setViewingCorrect] = useState(false);
  
  const pageState = progress[page.id]; 
  const isMulti = page.template === TemplateType.MAMC;
  const attempts = pageState?.attempts || 0;
  const maxAttempts = page.settings?.attemptsAllowed || 1;
  const attemptsExhausted = attempts >= maxAttempts;
  
  // Robust correctness check
  const isCorrect = useMemo(() => {
    if (!pageState?.answer) return false;
    const correctOptions = page.content.options?.filter(o => o.isCorrect).map(o => o.id) || [];
    
    let ans: string[] = [];
    if (Array.isArray(pageState.answer)) {
        ans = pageState.answer;
    } else if (typeof pageState.answer === 'string') {
        ans = [pageState.answer];
    }
    
    if (ans.length === 0) return false;

    if (isMulti) {
        return correctOptions.every(id => ans.includes(id)) && ans.every(id => correctOptions.includes(id));
    } else {
        return correctOptions.includes(ans[0]);
    }
  }, [pageState?.answer, page.content.options, isMulti]);

  // Sync state
  useEffect(() => {
     if(pageState?.answer) {
         if (Array.isArray(pageState.answer)) {
             setSelected(pageState.answer);
         } else if (typeof pageState.answer === 'string') {
             setSelected([pageState.answer]);
         }
         setShowFeedback(true);
     } else {
         setSelected([]);
         setShowFeedback(false);
     }
  }, [pageState?.answer, page.id]);

  const handleSelect = (id: string) => {
    if (showFeedback) return;
    if (isMulti) {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    } else {
        setSelected([id]);
    }
  };

  const handleRetry = () => {
      setSelected([]);
      setShowFeedback(false);
      setViewingCorrect(false);
  };

  const handleSubmit = () => {
    const correctOptions = page.content.options?.filter(o => o.isCorrect).map(o => o.id) || [];
    let correct = false;
    if (isMulti) {
        const allCorrectSelected = correctOptions.every(id => selected.includes(id));
        const noIncorrectSelected = selected.every(id => correctOptions.includes(id));
        correct = allCorrectSelected && noIncorrectSelected;
    } else {
        correct = correctOptions.includes(selected[0]);
    }
    submitAnswer(page.id, selected, correct);
  };

  // Determine which selection to visualize
  // If Viewing Correct: Show Correct Ids
  // Else: Show User Selection (My Answers or Current Input)
  const displayedSelection = viewingCorrect 
    ? (page.content.options?.filter(o => o.isCorrect).map(o => o.id) || [])
    : selected;

  return (
    <div className={`${PAGE_LAYOUT} flex flex-col min-h-full`}>
       <div className="w-full mb-2">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">{page.content.heading}</h2>
          <div className="prose prose-blue mb-4" dangerouslySetInnerHTML={{ __html: page.content.body || '' }} />
          {page.content.media && <div className="mb-6 max-w-md"><MediaContent media={page.content.media} /></div>}
       </div>
       
       <InstructionText text={page.content.instruction} />

       <div className="w-full max-w-3xl mt-2">
          <div className="space-y-3 mb-8" role="group" aria-label={isMulti ? "Multiple choice options" : "Single choice options"}>
             {page.content.options?.map(opt => (
                 <div 
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all flex items-center
                        ${displayedSelection.includes(opt.id) 
                            ? (viewingCorrect 
                                ? 'border-green-500 bg-green-50 ring-1 ring-green-500' // Show Correct Style
                                : 'border-blue-500 bg-blue-50 ring-1 ring-blue-500') // My Answer Style
                            : 'border-gray-200 hover:bg-gray-50'}
                        ${showFeedback ? 'cursor-default' : ''}
                    `}
                 >
                     <div className={`mr-3 ${displayedSelection.includes(opt.id) 
                         ? (viewingCorrect ? 'text-green-600' : 'text-blue-600') 
                         : 'text-gray-300'}`}>
                         {isMulti ? (
                             displayedSelection.includes(opt.id) ? <CheckSquare size={24} /> : <Square size={24} />
                         ) : (
                             <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${displayedSelection.includes(opt.id) 
                                 ? (viewingCorrect ? 'border-green-600 bg-green-600' : 'border-blue-600 bg-blue-600') 
                                 : 'border-gray-300'}`}>
                                {displayedSelection.includes(opt.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                             </div>
                         )}
                     </div>
                     <span className="text-gray-700 font-medium">{opt.text}</span>
                 </div>
             ))}
          </div>
          
          <InteractiveFooter 
            isCorrect={isCorrect}
            attemptsExhausted={attemptsExhausted}
            showFeedback={showFeedback}
            canRetry={!isCorrect && !attemptsExhausted && showFeedback}
            isSubmitDisabled={selected.length === 0}
            viewingCorrect={viewingCorrect}
            onSubmit={handleSubmit}
            onRetry={handleRetry}
            onToggleAnswers={setViewingCorrect}
            uiText={uiText}
            onContinue={goNext}
          />
       </div>
    </div>
  );
};

const MatchingTemplate = ({ page }: { page: Page }) => {
    const { submitAnswer, uiText, progress, goNext } = useCourse();
    const pairs = page.content.matchingPairs || [];
    const [matches, setMatches] = useState<Record<string, string>>({});
    const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [viewingCorrect, setViewingCorrect] = useState(false);

    const pageState = progress[page.id];
    const attempts = pageState?.attempts || 0;
    const maxAttempts = page.settings?.attemptsAllowed || 1;
    const attemptsExhausted = attempts >= maxAttempts;

    const isCorrect = useMemo(() => {
        if (!pageState?.answer) return false;
        const ans = pageState.answer as Record<string, string>;
        if (Object.keys(ans).length !== pairs.length) return false;
        return pairs.every(p => ans[p.id] === p.id);
    }, [pageState?.answer, pairs]);

    useEffect(() => {
        if(pageState?.answer) {
             setMatches(pageState.answer as Record<string, string>);
             setShowFeedback(true);
        } else {
             setMatches({});
             setShowFeedback(false);
        }
    }, [pageState?.answer, page.id]);

    const handleLeftClick = (id: string) => {
        if (showFeedback) return;
        if (matches[id]) {
             const newMatches = { ...matches };
             delete newMatches[id];
             setMatches(newMatches);
        } else {
             setSelectedLeft(id);
        }
    };

    const handleRightClick = (id: string) => {
        if (showFeedback) return;
        if (selectedLeft) {
            const existingLeft = Object.keys(matches).find(key => matches[key] === id);
            const newMatches = { ...matches };
            if (existingLeft) delete newMatches[existingLeft];
            
            newMatches[selectedLeft] = id;
            setMatches(newMatches);
            setSelectedLeft(null);
        }
    };
    
    const handleRetry = () => {
        setMatches({});
        setShowFeedback(false);
        setViewingCorrect(false);
    };

    const handleToggleAnswers = (show: boolean) => {
        setViewingCorrect(show);
        if (show) {
            const perfectMatches: Record<string, string> = {};
            pairs.forEach(p => perfectMatches[p.id] = p.id);
            setMatches(perfectMatches);
        } else {
            // Restore user answer
            if (pageState?.answer) setMatches(pageState.answer as Record<string, string>);
        }
    };

    const handleSubmit = () => {
        if (Object.keys(matches).length !== pairs.length) {
             alert(uiText.matchError);
             return;
        }
        let correct = true;
        pairs.forEach(p => {
             if (matches[p.id] !== p.id) correct = false;
        });
        submitAnswer(page.id, matches, correct);
    };

    const [rightItems, setRightItems] = useState<{id: string, text: string}[]>([]);
    useEffect(() => {
        if (rightItems.length === 0) {
            const shuffled = [...pairs].sort(() => Math.random() - 0.5).map(p => ({ id: p.id, text: p.right }));
            setRightItems(shuffled);
        }
    }, [pairs]);

    return (
        <div className={`${PAGE_LAYOUT} flex flex-col min-h-full`}>
             <h2 className="text-2xl font-bold mb-4 text-gray-800">{page.content.heading}</h2>
             <div className="prose prose-blue mb-4" dangerouslySetInnerHTML={{ __html: page.content.body || '' }} />
             <InstructionText text={page.content.instruction} />

             <div className="flex flex-col md:flex-row gap-8 md:gap-16 justify-center mt-4">
                 <div className="flex flex-col gap-4 w-full md:w-1/3">
                     {pairs.map(p => {
                         const isMatched = !!matches[p.id];
                         const isSelected = selectedLeft === p.id;
                         return (
                             <button
                                key={p.id}
                                onClick={() => handleLeftClick(p.id)}
                                disabled={showFeedback}
                                className={`p-4 border-2 rounded-lg text-left transition-all
                                    ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}
                                    ${isMatched 
                                        ? (viewingCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-blue-50 border-blue-200 text-blue-800') 
                                        : 'hover:border-blue-300'}
                                `}
                             >
                                 {p.left}
                             </button>
                         )
                     })}
                 </div>
                 <div className="flex flex-col gap-4 w-full md:w-1/3">
                     {rightItems.map(item => {
                         const isMatched = Object.values(matches).includes(item.id);
                         return (
                             <button
                                key={item.id}
                                onClick={() => handleRightClick(item.id)}
                                disabled={showFeedback}
                                className={`p-4 border-2 rounded-lg text-left transition-all
                                    ${isMatched 
                                        ? (viewingCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-blue-50 border-blue-200 text-blue-800') 
                                        : 'border-gray-200 hover:border-blue-300'}
                                `}
                             >
                                 {item.text}
                             </button>
                         )
                     })}
                 </div>
             </div>

             <InteractiveFooter 
                isCorrect={isCorrect}
                attemptsExhausted={attemptsExhausted}
                showFeedback={showFeedback}
                canRetry={!isCorrect && !attemptsExhausted && showFeedback}
                isSubmitDisabled={Object.keys(matches).length < pairs.length}
                viewingCorrect={viewingCorrect}
                onSubmit={handleSubmit}
                onRetry={handleRetry}
                onToggleAnswers={handleToggleAnswers}
                uiText={uiText}
                onContinue={goNext}
            />
        </div>
    );
};

const SliderTemplate = ({ page }: { page: Page }) => {
    const { submitAnswer, uiText, progress, goNext } = useCourse();
    const config = page.content.slider!;
    const [value, setValue] = useState(config.min);
    const [showFeedback, setShowFeedback] = useState(false);
    const [viewingCorrect, setViewingCorrect] = useState(false);

    const pageState = progress[page.id];
    const attempts = pageState?.attempts || 0;
    const maxAttempts = page.settings?.attemptsAllowed || 1;
    const attemptsExhausted = attempts >= maxAttempts;

    const isCorrect = useMemo(() => {
        if (!pageState?.answer) return false;
        return Math.abs(Number(pageState.answer) - config.correctValue) < config.step / 2;
    }, [pageState?.answer, config]);

    useEffect(() => {
        if(pageState?.answer) {
            setValue(Number(pageState.answer));
            setShowFeedback(true);
        } else {
             setValue(config.min);
             setShowFeedback(false);
        }
    }, [pageState?.answer, page.id]);

    const handleRetry = () => {
        setShowFeedback(false);
        setValue(config.min);
        setViewingCorrect(false);
    };

    const handleToggleAnswers = (show: boolean) => {
        setViewingCorrect(show);
        if (show) setValue(config.correctValue);
        else if (pageState?.answer) setValue(Number(pageState.answer));
    };

    const handleSubmit = () => {
        const correct = Math.abs(value - config.correctValue) < config.step / 2;
        submitAnswer(page.id, value, correct);
    };

    return (
        <div className={`${PAGE_LAYOUT} flex flex-col min-h-full`}>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">{page.content.heading}</h2>
            <div className="prose prose-blue mb-4" dangerouslySetInnerHTML={{ __html: page.content.body || '' }} />
            <InstructionText text={page.content.instruction} />

            <div className={`bg-gray-50 p-8 rounded-xl border mb-8 mt-4 ${viewingCorrect ? 'border-green-300 ring-2 ring-green-100' : 'border-gray-200'}`}>
                 <div className="text-3xl font-bold text-blue-600 mb-6">{value} {config.unit}</div>
                 <input 
                    type="range"
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={value}
                    onChange={(e) => setValue(parseFloat(e.target.value))}
                    disabled={showFeedback}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                 />
                 <div className="flex justify-between mt-2 text-sm text-gray-500 font-medium">
                     {config.labels?.map((l, idx) => (
                         <span key={idx}>{l.label} ({l.value})</span>
                     )) || (
                         <>
                            <span>{config.min}</span>
                            <span>{config.max}</span>
                         </>
                     )}
                 </div>
            </div>

            <InteractiveFooter 
                isCorrect={isCorrect}
                attemptsExhausted={attemptsExhausted}
                showFeedback={showFeedback}
                canRetry={!isCorrect && !attemptsExhausted && showFeedback}
                isSubmitDisabled={false}
                viewingCorrect={viewingCorrect}
                onSubmit={handleSubmit}
                onRetry={handleRetry}
                onToggleAnswers={handleToggleAnswers}
                uiText={uiText}
                onContinue={goNext}
            />
        </div>
    );
};

const SortingTemplate = ({ page }: { page: Page }) => {
    const { submitAnswer, uiText, progress, goNext } = useCourse();
    const correctOrder = page.content.sortingItems!.map(i => i.id);
    const [items, setItems] = useState(page.content.sortingItems!);
    const [showFeedback, setShowFeedback] = useState(false);
    const [viewingCorrect, setViewingCorrect] = useState(false);

    const pageState = progress[page.id];
    const attempts = pageState?.attempts || 0;
    const maxAttempts = page.settings?.attemptsAllowed || 1;
    const attemptsExhausted = attempts >= maxAttempts;

    const isCorrect = useMemo(() => {
        if (!pageState?.answer) return false;
        const orderIds = pageState.answer as string[];
        return JSON.stringify(orderIds) === JSON.stringify(correctOrder);
    }, [pageState?.answer, correctOrder]);

    useEffect(() => {
        if(pageState?.answer) {
            const orderIds = pageState.answer as string[];
            const orderedItems = orderIds.map(id => page.content.sortingItems!.find(i => i.id === id)!);
            setItems(orderedItems);
            setShowFeedback(true);
        } else if (!showFeedback) {
             setItems([...page.content.sortingItems!].sort(() => Math.random() - 0.5));
        }
    }, [pageState?.answer, page.id]);

    const handleRetry = () => {
        setShowFeedback(false);
        setViewingCorrect(false);
        setItems([...page.content.sortingItems!].sort(() => Math.random() - 0.5));
    };

    const handleToggleAnswers = (show: boolean) => {
        setViewingCorrect(show);
        if(show) {
             setItems([...page.content.sortingItems!]);
        } else if(pageState?.answer) {
            const orderIds = pageState.answer as string[];
            const orderedItems = orderIds.map(id => page.content.sortingItems!.find(i => i.id === id)!);
            setItems(orderedItems);
        }
    };

    const moveItem = (index: number, direction: -1 | 1) => {
        if (showFeedback) return;
        const newItems = [...items];
        const targetIndex = index + direction;
        if (targetIndex >= 0 && targetIndex < newItems.length) {
            [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
            setItems(newItems);
        }
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        if (showFeedback) return;
        e.dataTransfer.setData("text/plain", index.toString());
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        if (showFeedback) return;
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));
        if (dragIndex === dropIndex) return;
        const newItems = [...items];
        const [removed] = newItems.splice(dragIndex, 1);
        newItems.splice(dropIndex, 0, removed);
        setItems(newItems);
    };

    const handleSubmit = () => {
        const currentIds = items.map(i => i.id);
        const correct = JSON.stringify(currentIds) === JSON.stringify(correctOrder);
        submitAnswer(page.id, currentIds, correct);
    };

    return (
        <div className={`${PAGE_LAYOUT} flex flex-col min-h-full`}>
             <h2 className="text-2xl font-bold mb-4 text-gray-800">{page.content.heading}</h2>
             <div className="prose prose-blue mb-4" dangerouslySetInnerHTML={{ __html: page.content.body || '' }} />
             <InstructionText text={page.content.instruction} />

             <div className={`space-y-3 mt-4 ${viewingCorrect ? 'p-4 border border-green-300 rounded-xl bg-green-50' : ''}`}>
                 {items.map((item, idx) => (
                     <motion.div
                        layout
                        key={item.id}
                        draggable={!showFeedback}
                        onDragStart={(e) => handleDragStart(e as any, idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e as any, idx)}
                        className={`bg-white p-4 rounded-lg border shadow-sm flex items-center gap-4 ${showFeedback ? '' : 'cursor-move hover:shadow-md hover:border-blue-300'}`}
                     >
                         <div className="text-gray-400 cursor-grab"><GripVertical size={20} /></div>
                         <div className="flex-1 font-medium text-gray-700">{item.text}</div>
                         {!showFeedback && (
                             <div className="flex flex-col gap-1">
                                 <button onClick={() => moveItem(idx, -1)} disabled={idx === 0} className="text-gray-400 hover:text-blue-600 disabled:opacity-30"><ArrowUp size={16}/></button>
                                 <button onClick={() => moveItem(idx, 1)} disabled={idx === items.length - 1} className="text-gray-400 hover:text-blue-600 disabled:opacity-30"><ArrowDown size={16}/></button>
                             </div>
                         )}
                     </motion.div>
                 ))}
             </div>

             <InteractiveFooter 
                isCorrect={isCorrect}
                attemptsExhausted={attemptsExhausted}
                showFeedback={showFeedback}
                canRetry={!isCorrect && !attemptsExhausted && showFeedback}
                isSubmitDisabled={false}
                viewingCorrect={viewingCorrect}
                onSubmit={handleSubmit}
                onRetry={handleRetry}
                onToggleAnswers={handleToggleAnswers}
                uiText={uiText}
                onContinue={goNext}
            />
        </div>
    );
};


// --- Main Renderer ---

export const ContentRenderer: React.FC = () => {
  const { currentPage, goNext, uiText } = useCourse();

  if (!currentPage) return <div>Loading...</div>;

  return (
    <motion.div 
        key={currentPage.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        // Added overflow-x-hidden to prevent horizontal scrolling during transitions or content overflow
        className="h-full overflow-y-auto overflow-x-hidden relative"
    >
      {currentPage.template === TemplateType.LANDING && <LandingTemplate page={currentPage} onStart={goNext} />}
      {currentPage.template === TemplateType.TOPIC_MENU && <TopicMenuTemplate />}
      {(currentPage.template === TemplateType.TEXT_ONLY || currentPage.template === TemplateType.TEXT_IMAGE || currentPage.template === TemplateType.VIDEO) && (
          <StandardTemplate page={currentPage} />
      )}
      {currentPage.template === TemplateType.TABS && <TabsTemplate page={currentPage} />}
      {currentPage.template === TemplateType.FLIP_CARDS && <FlipCardTemplate page={currentPage} />}
      {currentPage.template === TemplateType.CHAT && <ChatTemplate page={currentPage} />}
      {currentPage.template === TemplateType.ACCORDION && <AccordionTemplate page={currentPage} />}
      {currentPage.template === TemplateType.NARRATIVE && <NarrativeTemplate page={currentPage} />}
      {(currentPage.template === TemplateType.SAMC || currentPage.template === TemplateType.MAMC) && (
          <QuizTemplate page={currentPage} />
      )}
      {currentPage.template === TemplateType.MATCHING && <MatchingTemplate page={currentPage} />}
      {currentPage.template === TemplateType.SLIDER && <SliderTemplate page={currentPage} />}
      {currentPage.template === TemplateType.SORTING && <SortingTemplate page={currentPage} />}
      
      {currentPage.template === TemplateType.ASSESSMENT_INTRO && (
          <div className={`${PAGE_LAYOUT} flex flex-col justify-center min-h-full`}>
              <h1 className="text-3xl font-bold mb-4">{currentPage.content.heading}</h1>
              <p className="text-lg text-gray-600 mb-8">{currentPage.content.body}</p>
              <div><Button onClick={goNext} size="lg">{uiText.startAssessment}</Button></div>
          </div>
      )}
      {currentPage.template === TemplateType.ASSESSMENT_RESULT && (
          <div className={`${PAGE_LAYOUT} flex flex-col justify-center min-h-full`}>
              <h1 className="text-3xl font-bold mb-4">{uiText.assessmentComplete}</h1>
              <p className="text-lg text-gray-600 mb-8">{uiText.assessmentrecorded}</p>
          </div>
      )}
    </motion.div>
  );
};