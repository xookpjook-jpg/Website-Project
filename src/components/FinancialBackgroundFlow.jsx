import React from 'react'

export default function FinancialBackgroundFlow() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40 select-none" aria-hidden="true">
      {/* Background Radial Glow Matrix */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.12),transparent_70%)]" />

      {/* Income Stream Light (Emerald Glowing Orb) */}
      <div 
        className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-emerald-500/15 blur-[120px] animate-float-particle" 
        style={{ animationDelay: '0s', animationDuration: '14s' }}
      />
      
      {/* Expense Stream Light (Rose Glowing Orb) */}
      <div 
        className="absolute top-1/3 -right-24 w-[32rem] h-[32rem] rounded-full bg-rose-500/12 blur-[140px] animate-float-particle" 
        style={{ animationDelay: '4s', animationDuration: '16s' }}
      />

      {/* Net Balance Stream Light (Indigo/Violet Glow) */}
      <div 
        className="absolute -bottom-24 left-1/3 w-[36rem] h-[36rem] rounded-full bg-indigo-600/18 blur-[160px] animate-float-particle" 
        style={{ animationDelay: '8s', animationDuration: '18s' }}
      />

      {/* Golden Wealth Accent Light */}
      <div 
        className="absolute top-2/3 left-10 w-72 h-72 rounded-full bg-amber-500/10 blur-[100px] animate-float-particle" 
        style={{ animationDelay: '6s', animationDuration: '12s' }}
      />

      {/* Subtle Flow Vector Streams */}
      <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgFlowGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="bgFlowGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path
          d="M -100 200 Q 300 50 700 400 T 1500 200 T 2200 600"
          fill="none"
          stroke="url(#bgFlowGrad1)"
          strokeWidth="1.5"
          className="animate-flow-dash"
        />
        <path
          d="M -50 600 Q 400 800 900 450 T 1700 700"
          fill="none"
          stroke="url(#bgFlowGrad2)"
          strokeWidth="1"
          className="animate-flow-dash"
          style={{ animationDuration: '2.8s' }}
        />
      </svg>
    </div>
  )
}
