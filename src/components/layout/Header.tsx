import React from 'react';
import { useCourseData } from '../CourseContext';
import { Menu, Volume2 } from 'lucide-react';

export const Header: React.FC = () => {
  const { templateConfig, currentPage } = useCourseData();

  if (!templateConfig || !currentPage) {
    return <header className="header-placeholder" />;
  }

  return (
    <header className="main-header">
      <div className="header-left">
        {currentPage.settings.sidebar && <button className="menu-button"><Menu /></button>}
        <h1 className="course-title">{templateConfig.CourseName}</h1>
      </div>
      <div className="header-right">
        <h2 className="page-title">{currentPage.header}</h2>
        <button className="audio-button"><Volume2 /></button>
      </div>
    </header>
  );
};
