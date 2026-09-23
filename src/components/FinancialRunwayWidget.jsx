import React, { useEffect, useState } from 'react'
import { fetchRecords } from '../lib/api'
import { ShieldCheckIcon, BanknotesIcon, ChartPieIcon } from '@heroicons/react/24/outline'

export default function FinancialRunwayWidget() {
  const [runwayData, setRunwayData] = useState({
    monthlyAvgExpense: 0,
    currentSavings: 0,
    runwayMonths: 0,
    topExpenseCategory: 'ยังไม่มีข้อมูล',
    topExpenseAmount: 0
  })

  const calculateRunway = async () => {
    try {
      const records = await fetchRecords()
      if (!records || records.length === 0) return

      const totalIncome = records.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
      const totalExpense = records.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
      const netSavings = Math.max(0, totalIncome - totalExpense)

      // Calculate category spending
      const categoryMap = {}
      records.filter(r => r.type === 'expense').forEach(r => {
        categoryMap[r.category] = (categoryMap[r.category] || 0) + r.amount
      })

      let topCat = 'ทั่วไป'
      let topAmt = 0
      Object.entries(categoryMap).forEach(([cat, amt]) => {
        if (amt > topAmt) {
          topAmt = amt
          topCat = cat
        }
      })

      // Monthly average calculation (default assume current records cover ~1 month or proportional)
      const monthlyExpense = totalExpense > 0 ? totalExpense : 1
      const months = (netSavings / monthlyExpense).toFixed(1)

      setRunwayData({
        monthlyAvgExpense: totalExpense,
        currentSavings: netSavings,
        runwayMonths: Number(months),
        topExpenseCategory: topCat,
        topExpenseAmount: topAmt
      })
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    calculateRunway()
    const onUpdate = () => calculateRunway()
    window.addEventListener('recordsUpdated', onUpdate)
    return () => window.removeEventListener('recordsUpdated', onUpdate)
  }, [])

  const months = runwayData.runwayMonths
  let statusBadge = { label: 'ปลอดภัยสูง 🛡️', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' }
  if (months < 1) {
    statusBadge = { label: 'เสี่ยงสูง 🚨', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' }
  } else if (months < 3) {
    statusBadge = { label: 'ควรระวัง ⚠️', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' }
  }

  return (
    <div className="glass card-shadow p-5 rounded-2xl border border-slate-700/50">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <ShieldCheckIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">ดัชนีเงินสำรองฉุกเฉิน (Runway)</h3>
            <p className="text-[11px] text-slate-400">ระยะเวลาอยู่ได้หากไม่มีรายรับเข้ามา</p>
          </div>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusBadge.color}`}>
          {statusBadge.label}
        </span>
      </div>

      <div className="space-y-3">
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">ระยะเวลาเงินสำรองคงเหลือ</div>
            <div className="text-xl font-extrabold text-cyan-400 mt-0.5">
              {runwayData.runwayMonths} <span className="text-xs font-semibold text-slate-300">เดือน</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium">หมวดจ่ายสูงสุด</div>
            <div className="text-xs font-bold text-slate-200 mt-0.5 flex items-center gap-1 justify-end">
              <ChartPieIcon className="w-3.5 h-3.5 text-indigo-400" />
              {runwayData.topExpenseCategory}
            </div>
            <div className="text-[10px] text-rose-400 font-mono">
              ฿{runwayData.topExpenseAmount.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/80">
          💡 <span className="font-medium text-slate-300">ข้อแนะนำทางการเงิน:</span> ควรมีเงินสำรองฉุกเฉินอย่างน้อย <span className="text-emerald-400 font-bold">3-6 เดือน</span> ของค่าใช้จ่าย เพื่อความมั่นคงทางการเงินในระยะยาว
        </div>
      </div>
    </div>
  )
}
