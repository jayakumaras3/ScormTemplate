import React from 'react';
import { useCourse } from '../CourseContext';
import { Menu } from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    template, 
    toggleMenu
  } = useCourse();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 shadow-sm z-20 relative shrink-0">
      
      {/* Left: Empty or Logo */}
      <div className="flex items-center w-1/4">
      </div>

      {/* Center: Course Title */}
      <div className="flex-1 flex justify-center w-2/4">
        <h1 className="text-base md:text-lg font-bold text-gray-800 truncate text-center">{template.CourseName}</h1>
      </div>

      {/* Right: Hamburger */}
      <div className="flex items-center justify-end space-x-2 md:space-x-4 w-1/4">
        
        {/* Hamburger Menu */}
        <button 
          onClick={toggleMenu}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex flex-col items-center"
          aria-label={template.MenuName}
        >
          <Menu size={24} />
          <span className="text-[10px] font-medium">{template.MenuName}</span>
        </button>

      </div>
    </header>
  );
};
