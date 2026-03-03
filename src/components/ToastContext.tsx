import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const getBackgroundColor = (type: ToastType) => {
    switch (type) {
      case 'success': return 'rgba(34, 197, 94, 0.9)'; // Green
      case 'error': return 'rgba(239, 68, 68, 0.9)';   // Red
      case 'warning': return 'rgba(245, 158, 11, 0.9)'; // Orange
      case 'info': return 'rgba(59, 130, 246, 0.9)';    // Blue
      default: return 'rgba(58, 36, 21, 0.9)';         // Dark
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none'
      }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              padding: '12px 24px',
              backgroundColor: getBackgroundColor(toast.type),
              color: '#fff',
              borderRadius: '12px',
              boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(8px)',
              fontSize: '14px',
              fontWeight: 600,
              minWidth: '200px',
              textAlign: 'center',
              animation: 'slideIn 0.3s ease-out forwards',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              pointerEvents: 'auto'
            }}
          >
            <span>{toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : '🔔'}</span>
            {toast.message}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
