import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((t) => {
    const id = Date.now() + Math.random()
    setToasts(s => [...s, { id, ...t }])
    setTimeout(() => setToasts(s => s.filter(x => x.id !== id)), t.duration || 5000)
  }, [])

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed right-4 bottom-6 space-y-2.5 z-50 max-w-sm w-full pointer-events-none px-2 sm:px-0">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto glass p-3.5 rounded-2xl shadow-2xl border text-xs backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-300 ${
              t.type === 'error'
                ? 'border-rose-500/40 bg-slate-900/95 text-rose-200'
                : (t.type === 'success' ? 'border-emerald-500/40 bg-slate-900/95 text-emerald-200' : 'border-indigo-500/40 bg-slate-900/95 text-slate-100')
            }`}
          >
            <div className="font-bold text-sm leading-snug">{t.title || t.message}</div>
            {t.desc && (
              <div className="text-[11px] text-slate-300 mt-1 leading-relaxed opacity-90">{t.desc}</div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
