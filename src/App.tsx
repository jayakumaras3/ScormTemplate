import React from 'react';
import { CourseProvider, useCourseData } from './components/CourseContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ContentRenderer } from './components/templates/ContentRenderer';

const AppContent: React.FC = () => {
  const { currentPage } = useCourseData();

  if (!currentPage) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">
        <ContentRenderer page={currentPage} />
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <CourseProvider>
      <AppContent />
    </CourseProvider>
  );
};

export default App;
