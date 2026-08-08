import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

const OfflineBadge: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="bg-red-500 text-white px-4 py-2 flex items-center justify-center gap-2 shadow-md">
        <WifiOff size={18} />
        <span className="font-medium text-sm sm:text-base">
          Şu anda çevrimdışısınız. Bazı özellikler kullanılamayabilir.
        </span>
      </div>
    </div>
  );
};

export default OfflineBadge;
