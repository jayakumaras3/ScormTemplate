import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';

interface ResumeDialogProps {
  onResume: () => void;
  onRestart: () => void;
  open: boolean;
  title: string;
  message: string;
  yesLabel: string;
  noLabel: string;
}

export const ResumeDialog: React.FC<ResumeDialogProps> = ({ 
  onResume, 
  onRestart, 
  open,
  title,
  message,
  yesLabel,
  noLabel
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-md w-full mx-4 border border-gray-100"
        role="alertdialog"
        aria-labelledby="resume-title"
        aria-describedby="resume-desc"
      >
        <div className="p-8 text-center bg-gray-50 border-b border-gray-100">
          <h2 id="resume-title" className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
          <p id="resume-desc" className="text-gray-600">
            {message}
          </p>
        </div>
        <div className="p-8 flex flex-col gap-3">
          <Button 
            onClick={onResume} 
            variant="primary" 
            className="w-full py-3 text-lg justify-center shadow-lg shadow-blue-500/30"
          >
            {yesLabel}
          </Button>
          <Button 
            onClick={onRestart} 
            variant="ghost" 
            className="w-full justify-center text-gray-500 hover:bg-gray-100 mt-2"
          >
            {noLabel}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
