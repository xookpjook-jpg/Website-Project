import React, { useState, useEffect } from 'react'
import CountUp from 'react-countup'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchRecords } from '../lib/api'
import { XMarkIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function FinancialSummaryModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [data, setData] = useState({ income: 0, expense: 0, balance: 0, count: 0 })
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setStep(0)
      setProgress(0)
      setIsDone(false)
      return
    }

    // Load real metrics
    fetchRecords().then(records => {
      const income = records.filter(r => r.type === 'income').reduce((s, r) => s + Number(r.amount || 0), 0)
      const expense = records.filter(r => r.type === 'expense').reduce((s, r) => s + Number(r.amount || 0), 0)
      setData({
        income,
        expense,
        balance: income - expense,
        count: records.length
      })
    }).catch(() => {})

    // Progress bar animation timer (1.2s total)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 50)

    // Step-by-step checklist timers
    const t1 = setTimeout(() => setStep(1), 300)
    const t2 = setTimeout(() => setStep(2), 600)
    const t3 = setTimeout(() => setStep(3), 900)
    const t4 = setTimeout(() => {
      setStep(4)
      setIsDone(true)
    }, 1250)

    return () => {
      clearInterval(interval)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSkip = () => {
    setIsDone(true)
    setProgress(100)
    setStep(4)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900/90 p-6 sm:p-8 shadow-2xl shadow-indigo-950/50 glass"
        >
          {/* Header & Skip/Close Button */}
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-indigo-400 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Financial Summary Flow</h3>
                <p className="text-xs text-slate-400">วิเคราะห์กระแสเงินสดประจำวัน</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-slate-700/60 bg-slate-800/60 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all flex items-center gap-1.5"
            >
              <span>{isDone ? 'ปิด' : 'ข้าม'}</span>
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Analysis Status */}
          <div className="text-center mb-6">
            <div className="text-base sm:text-lg font-bold text-slate-100 flex items-center justify-center gap-2">
              {isDone ? (
                <span className="text-emerald-400 font-extrabold">✨ สรุปการเงินของคุณพร้อมแล้ว</span>
              ) : (
                <span className="text-indigo-300">กำลังวิเคราะห์กระแสเงิน...</span>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mt-3 h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-indigo-500 to-rose-400 transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Checklist Animation */}
          <div className="grid grid-cols-2 gap-2.5 mb-6 text-xs font-medium">
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${step >= 1 ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-slate-800 bg-slate-900/40 text-slate-500'}`}>
              <CheckCircleIcon className={`w-4 h-4 ${step >= 1 ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span>วิเคราะห์รายรับ</span>
            </div>
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${step >= 2 ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' : 'border-slate-800 bg-slate-900/40 text-slate-500'}`}>
              <CheckCircleIcon className={`w-4 h-4 ${step >= 2 ? 'text-rose-400' : 'text-slate-600'}`} />
              <span>วิเคราะห์รายจ่าย</span>
            </div>
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${step >= 3 ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300' : 'border-slate-800 bg-slate-900/40 text-slate-500'}`}>
              <CheckCircleIcon className={`w-4 h-4 ${step >= 3 ? 'text-indigo-400' : 'text-slate-600'}`} />
              <span>วิเคราะห์เงินคงเหลือ</span>
            </div>
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${step >= 4 ? 'border-purple-500/30 bg-purple-500/10 text-purple-300' : 'border-slate-800 bg-slate-900/40 text-slate-500'}`}>
              <CheckCircleIcon className={`w-4 h-4 ${step >= 4 ? 'text-purple-400' : 'text-slate-600'}`} />
              <span>วิเคราะห์แนวโน้ม</span>
            </div>
          </div>

          {/* Animated Flow Light Vector Stream (Income -> Expense -> Balance) */}
          <div className="relative mb-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 overflow-hidden">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3 text-center">
              กระแสการไหลของเงิน (Financial Flow Stream)
            </div>

            {/* SVG Connecting Light Stream */}
            <svg className="w-full h-12 mb-2 overflow-visible" viewBox="0 0 400 40">
              <defs>
                <linearGradient id="streamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <path
                d="M 40 20 C 120 0, 160 40, 200 20 C 240 0, 280 40, 360 20"
                fill="none"
                stroke="url(#streamGrad)"
                strokeWidth="3.5"
                className="animate-flow-dash"
              />
              <circle cx="40" cy="20" r="5" fill="#10b981" className="animate-pulse" />
              <circle cx="200" cy="20" r="5" fill="#f43f5e" className="animate-pulse" />
              <circle cx="360" cy="20" r="5" fill="#6366f1" className="animate-pulse" />
            </svg>

            {/* Metrics Cards with CountUp */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-[10px] text-emerald-400 font-semibold uppercase">รายรับ</div>
                <div className="text-sm sm:text-base font-extrabold text-emerald-400 mt-1">
                  {isDone ? (
                    <CountUp end={data.income} prefix="฿" duration={1.0} separator="," decimals={2} />
                  ) : (
                    '฿0.00'
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <div className="text-[10px] text-rose-400 font-semibold uppercase">รายจ่าย</div>
                <div className="text-sm sm:text-base font-extrabold text-rose-400 mt-1">
                  {isDone ? (
                    <CountUp end={data.expense} prefix="฿" duration={1.0} separator="," decimals={2} />
                  ) : (
                    '฿0.00'
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <div className="text-[10px] text-indigo-400 font-semibold uppercase">คงเหลือ</div>
                <div className="text-sm sm:text-base font-extrabold text-indigo-400 mt-1">
                  {isDone ? (
                    <CountUp end={data.balance} prefix="฿" duration={1.0} separator="," decimals={2} />
                  ) : (
                    '฿0.00'
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3">
            {!isDone ? (
              <button
                onClick={handleSkip}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all border border-slate-700/60"
              >
                ⏩ ข้ามวิเคราะห์
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all"
              >
                ดูสรุปหน้า Dashboard ✨
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
