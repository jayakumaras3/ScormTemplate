import React, { useState } from 'react';
import { useCourse } from '../CourseContext';
import { Menu, Star, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Header: React.FC = () => {
  const { 
    course, 
    currentTopic, 
    totalStars, 
    toggleMenu,
    currentLanguage,
    setLanguage,
    uiText
  } = useCourse();

  const [langMenuOpen, setLangMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 shadow-sm z-20 relative">
      
      {/* Left: Hamburger & Breadcrumb */}
      <div className="flex items-center space-x-4 w-1/3">
        <button 
          onClick={toggleMenu}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          aria-label={uiText.menu}
        >
          <Menu size={20} />
        </button>
        {/* Updated Breadcrumb: Topic Title Only */}
        <div className="hidden md:flex items-center text-xs font-medium text-gray-700">
            <span className="truncate">{currentTopic?.title}</span>
        </div>
      </div>

      {/* Center: Course Title */}
      <div className="flex-1 flex justify-center w-1/3">
        <h1 className="text-lg font-bold text-gray-800 truncate text-center">{course.title}</h1>
      </div>

      {/* Right: Stats & Language */}
      <div className="flex items-center justify-end space-x-4 w-1/3">
        {/* Gamification Stats */}
        {course.globalSettings.gamification && (
          <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
            <Star size={16} className="text-yellow-500 fill-yellow-500" aria-hidden="true" />
            <span className="text-sm font-bold text-yellow-700" aria-label={`Total Stars: ${totalStars}`}>{totalStars}</span>
          </div>
        )}

        {/* Language Selector */}
        {course.globalSettings.multiLanguage && (
            <div className="relative">
                <button 
                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-1"
                    aria-label={uiText.changeLanguage}
                    aria-expanded={langMenuOpen}
                    aria-haspopup="true"
                >
                    <Globe size={20} />
                    <span className="text-xs font-bold uppercase">{currentLanguage}</span>
                </button>
                
                <AnimatePresence>
                    {langMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setLangMenuOpen(false)} aria-hidden="true" />
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-20 overflow-hidden"
                                role="menu"
                            >
                                {course.globalSettings.supportedLanguages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        role="menuitem"
                                        onClick={() => {
                                            setLanguage(lang.code);
                                            setLangMenuOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex justify-between items-center
                                            ${currentLanguage === lang.code ? 'font-bold text-blue-600 bg-blue-50' : 'text-gray-700'}
                                        `}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        )}
      </div>
    </header>
  );
};