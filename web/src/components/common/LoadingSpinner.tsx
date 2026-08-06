import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px] w-full bg-surface-50 dark:bg-surface-950 transition-colors duration-200">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-surface-200 dark:border-surface-700"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-surface-500 dark:text-surface-400 font-medium animate-pulse">Yükleniyor...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
