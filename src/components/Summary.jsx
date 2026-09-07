import React, { useEffect, useState } from 'react'
import CountUp from 'react-countup'
import { fetchRecords } from '../lib/api'
import FinancialSummaryModal from './FinancialSummaryModal'
import { SparklesIcon } from '@heroicons/react/24/outline'

export default function Summary() {
  const [income, setIncome] = useState(0)
  const [expense, setExpense] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadData = () => {
    fetchRecords().then(records => {
      const totalIncome = records.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
      const totalExpense = records.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
      setIncome(totalIncome)
      setExpense(totalExpense)
    }).catch(() => {})
  }

  useEffect(() => {
    loadData()
    const onUpdate = () => loadData()
    window.addEventListener('recordsUpdated', onUpdate)
    return () => window.removeEventListener('recordsUpdated', onUpdate)
  }, [])

  const profit = income - expense
  const savingsRate = income > 0 ? Math.max(0, Math.round((profit / income) * 100)) : 0

  return (
    <>
      <div className="glass card-shadow p-5 rounded-2xl border border-slate-700/50 mb-6 bg-gradient-to-r from-[#131c31] via-[#16223d] to-[#131c31]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-extrabold text-slate-100 truncate">✨ สรุปภาพรวมทางการเงิน (Cash Flow)</h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-200 text-xs font-bold transition-all shadow-md hover:scale-105 active:scale-95"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>สรุปยอดวันนี้</span>
              <SparklesIcon className="w-4 h-4 text-indigo-300" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 mt-4 border-t border-slate-800/80">
          <div className="text-left">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider truncate">รายรับทั้งหมด</div>
            <div className="text-lg sm:text-xl font-extrabold text-emerald-400 mt-0.5 truncate">
              <CountUp end={income} prefix="฿" duration={1.0} separator="," decimals={2} />
            </div>
          </div>

          <div className="text-left">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider truncate">รายจ่ายทั้งหมด</div>
            <div className="text-lg sm:text-xl font-extrabold text-rose-400 mt-0.5 truncate">
              <CountUp end={expense} prefix="฿" duration={1.0} separator="," decimals={2} />
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 text-left sm:text-right">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider truncate">คงเหลือสุทธิ / ออม</div>
            <div className={`text-lg sm:text-xl font-extrabold mt-0.5 truncate ${profit >= 0 ? 'text-indigo-400' : 'text-amber-400'}`}>
              <CountUp end={profit} prefix="฿" duration={1.0} separator="," decimals={2} />
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              อัตราการออม: <span className="font-semibold text-emerald-400">{savingsRate}%</span>
            </div>
          </div>
        </div>
      </div>

      <FinancialSummaryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}


