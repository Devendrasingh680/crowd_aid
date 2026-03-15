import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: 'var(--bg2)', border: `1px solid ${t.type==='error'?'rgba(239,68,68,.4)':'rgba(34,211,165,.4)'}`,
            borderRadius: 12, padding: '13px 18px', fontSize: 14, minWidth: 260, maxWidth: 360,
            display: 'flex', alignItems:'center', gap:10, boxShadow:'0 8px 32px rgba(0,0,0,.5)',
            animation: 'fadeUp .3s ease',
          }}>
            <span>{t.type==='error'?'❌':'✅'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);