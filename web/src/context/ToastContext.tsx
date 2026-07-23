import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  addToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center justify-between p-4 mb-2 w-80 text-sm bg-white rounded-lg shadow-lg border-l-4 ${
              toast.type === 'success' ? 'border-accent-500' :
              toast.type === 'error' ? 'border-danger-500' : 'border-info-500'
            }`}
            role="alert"
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-accent-500" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-danger-500" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-info-500" />}
              <span className="font-medium text-surface-700">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-surface-400 hover:text-surface-900 focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
