import React, { useState, useEffect } from 'react'
import { fetchRecords } from '../lib/api'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ScaleIcon } from '@heroicons/react/24/outline'

export default function MonthComparison() {
  const [records, setRecords] = useState([])

  const loadData = () => {
    fetchRecords().then(setRecords).catch(() => setRecords([]))
  }

  useEffect(() => {
    loadData()
    const onUpdate = () => loadData()
    window.addEventListener('recordsUpdated', onUpdate)
    return () => window.removeEventListener('recordsUpdated', onUpdate)
  }, [])

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1)
  const prevYear = prevMonthDate.getFullYear()
  const prevMonth = prevMonthDate.getMonth()

  let currIncome = 0
  let currExpense = 0
  let prevIncome = 0
  let prevExpense = 0

  records.forEach(r => {
    const d = new Date(r.date)
    const rYear = d.getFullYear()
    const rMonth = d.getMonth()

    if (rYear === currentYear && rMonth === currentMonth) {
      if (r.type === 'income') currIncome += r.amount
      else currExpense += r.amount
    } else if (rYear === prevYear && rMonth === prevMonth) {
      if (r.type === 'income') prevIncome += r.amount
      else prevExpense += r.amount
    }
  })

  const expenseDiff = currExpense - prevExpense
  const expensePct = prevExpense > 0 ? Math.round((expenseDiff / prevExpense) * 100) : 0

  const incomeDiff = currIncome - prevIncome
  const incomePct = prevIncome > 0 ? Math.round((incomeDiff / prevIncome) * 100) : 0

  return (
    <div className="glass card-shadow p-5 rounded-2xl border border-slate-700/50">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            📊 รายงานเปรียบเทียบเดือนต่อเดือน (Month-over-Month Analytics)
          </h3>
          <p className="text-xs text-slate-400">เปรียบเทียบพฤติกรรมการใช้จ่ายและรายได้กับเดือนที่แล้ว</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <ScaleIcon className="w-4 h-4" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Expense Comparison Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 font-medium">
            <span>รายจ่ายเทียบเดือนก่อน</span>
            {expenseDiff <= 0 ? (
              <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <ArrowTrendingDownIcon className="w-3.5 h-3.5" />
                ลดลง {Math.abs(expensePct)}%
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
                เพิ่มขึ้น {expensePct}%
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 font-mono">
            <div>
              <div className="text-[10px] text-slate-500">เดือนนี้</div>
              <div className="text-sm font-bold text-slate-100">฿{currExpense.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">เดือนที่แล้ว</div>
              <div className="text-sm font-bold text-slate-400">฿{prevExpense.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Income Comparison Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 font-medium">
            <span>รายรับเทียบเดือนก่อน</span>
            {incomeDiff >= 0 ? (
              <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
                เพิ่มขึ้น +{incomePct}%
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <ArrowTrendingDownIcon className="w-3.5 h-3.5" />
                ลดลง {Math.abs(incomePct)}%
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 font-mono">
            <div>
              <div className="text-[10px] text-slate-500">เดือนนี้</div>
              <div className="text-sm font-bold text-emerald-400">฿{currIncome.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">เดือนที่แล้ว</div>
              <div className="text-sm font-bold text-slate-400">฿{prevIncome.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
