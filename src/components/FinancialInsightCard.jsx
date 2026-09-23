import React, { useEffect, useState } from 'react'
import { fetchRecords } from '../lib/api'
import { SparklesIcon, LightBulbIcon } from '@heroicons/react/24/outline'

export default function FinancialInsightCard() {
  const [insights, setInsights] = useState(null)

  const calculateInsights = async () => {
    try {
      const records = await fetchRecords()
      if (!records || records.length === 0) {
        setInsights({ empty: true })
        return
      }

      const totalIncome = records.filter(r => r.type === 'income').reduce((s, r) => s + Number(r.amount || 0), 0)
      const totalExpense = records.filter(r => r.type === 'expense').reduce((s, r) => s + Number(r.amount || 0), 0)
      const balance = totalIncome - totalExpense
      const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((balance / totalIncome) * 100)) : 0

      let ratioText = ''
      if (totalIncome > totalExpense && totalExpense > 0) {
        const pct = Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
        ratioText = `เดือนนี้รายรับของคุณสูงกว่ารายจ่าย ${pct}%`
      } else if (totalExpense > totalIncome && totalIncome > 0) {
        const pct = Math.round(((totalExpense - totalIncome) / totalIncome) * 100)
        ratioText = `เดือนนี้รายจ่ายเกินรายรับ ${pct}% ควรเพิ่มความระมัดระวัง`
      } else if (totalIncome > 0 && totalExpense === 0) {
        ratioText = `ยังไม่มีรายจ่ายในระบบ รายรับของคุณออมได้เต็ม 100%`
      } else {
        ratioText = `บันทึกรายการเพิ่ม เพื่อติดตามกระแสเงินแบบเรียลไทม์`
      }

      setInsights({
        ratioText,
        balance,
        savingsRate,
        empty: false
      })
    } catch (e) {
      console.error(e)
      setInsights({ empty: true })
    }
  }

  useEffect(() => {
    calculateInsights()
    const onUpdate = () => calculateInsights()
    window.addEventListener('recordsUpdated', onUpdate)
    return () => window.removeEventListener('recordsUpdated', onUpdate)
  }, [])

  return (
    <div className="glass card-shadow p-5 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/30 via-slate-900/60 to-purple-950/20">
      <div className="flex items-center gap-2.5 mb-3.5 pb-2.5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <SparklesIcon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            ✨ WealthFlow Insight
          </h3>
          <p className="text-[11px] text-slate-400">วิเคราะห์อัจฉริยะจากข้อมูลจริง</p>
        </div>
      </div>

      {!insights || insights.empty ? (
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
          <LightBulbIcon className="w-4 h-4 text-amber-400 shrink-0" />
          <span>ยังไม่มีข้อมูลทำรายการในขณะนี้ เริ่มบันทึกเพื่อรับข้อวิเคราะห์</span>
        </div>
      ) : (
        <div className="space-y-2.5 text-xs text-slate-200">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-2">
            <span className="text-emerald-400 font-bold">💡</span>
            <span className="font-medium text-indigo-200">{insights.ratioText}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-medium">เงินคงเหลือสุทธิ</div>
              <div className={`text-sm font-bold mt-0.5 ${insights.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ฿{insights.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-medium">อัตราการออมปัจจุบัน</div>
              <div className="text-sm font-bold text-indigo-400 mt-0.5">
                {insights.savingsRate}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
