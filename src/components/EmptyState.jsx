import React from 'react'

export default function EmptyState({ 
  title = 'ไม่พบข้อมูลรายการ', 
  subtitle = 'ยังไม่มีข้อมูลรายการทำธุรกรรม หรือค้นหาไม่พบในขณะนี้',
  actionLabel = null,
  onAction = null
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      {/* Modern Fintech SVG Piggy & Coin Illustration */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Glow Sphere */}
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />

        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10">
          <defs>
            <linearGradient id="piggyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* Floating Receipt Base */}
          <rect x="25" y="30" width="70" height="75" rx="10" fill="#1e293b" stroke="#334155" strokeWidth="3" />
          <line x1="38" y1="48" x2="82" y2="48" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          <line x1="38" y1="62" x2="70" y2="62" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          <line x1="38" y1="76" x2="60" y2="76" stroke="#475569" strokeWidth="4" strokeLinecap="round" />

          {/* Floating Golden Coin */}
          <circle cx="78" cy="78" r="16" fill="url(#coinGrad)" className="animate-bounce" />
          <circle cx="78" cy="78" r="11" stroke="#78350f" strokeWidth="2" fill="none" />
          <text x="78" y="83" textAnchor="middle" fill="#78350f" fontSize="14" fontWeight="bold">฿</text>
        </svg>
      </div>

      <div>
        <h4 className="text-base font-bold text-slate-200">{title}</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">{subtitle}</p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
