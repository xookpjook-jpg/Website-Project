import React, { useEffect, useState } from 'react'
import CountUp from 'react-countup'
import { fetchRecords } from '../lib/api'
import { HeartIcon } from '@heroicons/react/24/outline'

export default function FinancialHealthScoreCard() {
  const [score, setScore] = useState(0)
  const [grade, setGrade] = useState({ label: 'รอข้อมูล', color: 'text-slate-400 border-slate-700 bg-slate-800/40' })

  const calculateHealthScore = async () => {
    try {
      const records = await fetchRecords()
      if (!records || records.length === 0) {
        setScore(0)
        setGrade({ label: 'ไม่มีข้อมูล', color: 'text-slate-400 border-slate-700 bg-slate-800/40' })
        return
      }

      const totalIncome = records.filter(r => r.type === 'income').reduce((s, r) => s + Number(r.amount || 0), 0)
      const totalExpense = records.filter(r => r.type === 'expense').reduce((s, r) => s + Number(r.amount || 0), 0)
      const profit = totalIncome - totalExpense
      const savingsRate = totalIncome > 0 ? Math.max(0, Math.min(100, Math.round((profit / totalIncome) * 100))) : 0

      // Calculate score based on savings rate (50%), cash flow positivity (30%), activity count (20%)
      let calculatedScore = 0
      calculatedScore += Math.round(savingsRate * 0.5) // Up to 50 pts
      if (profit > 0) calculatedScore += 30 // 30 pts for positive cash flow
      const activityScore = Math.min(20, records.length * 4) // Up to 20 pts
      calculatedScore += activityScore

      calculatedScore = Math.min(100, Math.max(0, calculatedScore))
      setScore(calculatedScore)

      if (calculatedScore >= 80) {
        setGrade({ label: 'ยอดเยี่ยม ✨', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' })
      } else if (calculatedScore >= 60) {
        setGrade({ label: 'ดีมาก 👍', color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' })
      } else if (calculatedScore >= 40) {
        setGrade({ label: 'ปานกลาง ⚖️', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' })
      } else {
        setGrade({ label: 'ควรปรับปรุง ⚠️', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' })
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    calculateHealthScore()
    const onUpdate = () => calculateHealthScore()
    window.addEventListener('recordsUpdated', onUpdate)
    return () => window.removeEventListener('recordsUpdated', onUpdate)
  }, [])

  // SVG Progress ring math
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (circumference * score) / 100

  return (
    <div className="glass card-shadow p-5 rounded-2xl border border-slate-700/50">
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <HeartIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">สุขภาพทางการเงิน</h3>
            <p className="text-[11px] text-slate-400">Financial Health Score</p>
          </div>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${grade.color}`}>
          {grade.label}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* SVG Circular Progress Ring */}
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#1e293b"
              strokeWidth="7"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="url(#healthGrad)"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Score Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-xl font-black text-slate-100 tracking-tight">
              <CountUp end={score} duration={1.2} />
            </div>
            <div className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">
              / 100
            </div>
          </div>
        </div>

        {/* Score Details */}
        <div className="space-y-1.5 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>กระแสเงินสดสุทธิเป็นบวก</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>การจัดสรรเงินออมสะสม</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>ความสม่ำเสมอการทำรายการ</span>
          </div>
        </div>
      </div>
    </div>
  )
}
