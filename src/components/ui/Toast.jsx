import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast, removeToast }}>
      {children}
      <div 
        style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          width: '90%',
          maxWidth: '420px',
          pointerEvents: 'none'
        }}
      >
        {toasts.map(t => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const borderColor = isSuccess ? 'rgba(52, 199, 89, 0.4)' : isError ? 'rgba(255, 59, 48, 0.4)' : 'rgba(196, 251, 109, 0.4)';
          const bgColor = isSuccess ? 'rgba(18, 38, 24, 0.92)' : isError ? 'rgba(40, 16, 16, 0.92)' : 'rgba(20, 24, 28, 0.92)';

          return (
            <div
              key={t.id}
              className="animate-fade"
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '16px',
                background: bgColor,
                border: `1px solid ${borderColor}`,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                color: 'white',
                fontSize: '0.88rem',
                fontWeight: '500'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isSuccess && <CheckCircle2 size={18} color="#34c759" />}
                {isError && <AlertCircle size={18} color="#ff3b30" />}
                {!isSuccess && !isError && <Info size={18} color="var(--primary)" />}
                <span>{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex'
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: (msg) => console.log('Toast:', msg),
      removeToast: () => {}
    };
  }
  return context;
}
