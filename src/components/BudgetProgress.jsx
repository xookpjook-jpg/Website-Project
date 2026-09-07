import React, { useState, useEffect } from 'react'
import { fetchRecords } from '../lib/api'
import { AdjustmentsHorizontalIcon, CheckIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const DEFAULT_CATEGORY_BUDGETS = {
  'อาหาร/เครื่องดื่ม': 8000,
  'การเดินทาง': 3000,
  'ช้อปปิ้ง': 3000,
  'บิล/สาธารณูปโภค': 5000,
  'ความบันเทิง': 2000
}

export default function BudgetProgress() {
  const [records, setRecords] = useState([])
  const [isEditing, setIsEditing] = useState(false)

  // Target goals stored in localStorage or default
  const [targets, setTargets] = useState(() => {
    const saved = localStorage.getItem('wealthflow_targets')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) {}
    }
    return {
      monthlyExpenseLimit: 30000,
      monthlySavingsGoal: 20000,
      monthlyIncomeGoal: 60000,
      categoryBudgets: DEFAULT_CATEGORY_BUDGETS
    }
  })

  const [editForm, setEditForm] = useState(targets)

  const loadData = () => {
    fetchRecords().then(setRecords).catch(() => setRecords([]))
  }

  useEffect(() => {
    loadData()
    const onUpdate = () => loadData()
    window.addEventListener('recordsUpdated', onUpdate)
    return () => window.removeEventListener('recordsUpdated', onUpdate)
  }, [])

  const saveTargets = () => {
    setTargets(editForm)
    localStorage.setItem('wealthflow_targets', JSON.stringify(editForm))
    setIsEditing(false)
  }

  // Calculate actual numbers from records
  const totalIncome = records.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
  const totalExpense = records.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
  const totalSavings = Math.max(0, totalIncome - totalExpense)

  // Percentages
  const expensePct = Math.min(100, Math.round((totalExpense / (targets.monthlyExpenseLimit || 1)) * 100))
  const savingsPct = Math.min(100, Math.round((totalSavings / (targets.monthlySavingsGoal || 1)) * 100))
  const incomePct = Math.min(100, Math.round((totalIncome / (targets.monthlyIncomeGoal || 1)) * 100))

  // Category expenses breakdown
  const categoryBudgetsMap = targets.categoryBudgets || DEFAULT_CATEGORY_BUDGETS
  const expenseRecords = records.filter(r => r.type === 'expense')

  const categoryExpenses = Object.keys(categoryBudgetsMap).map(cat => {
    const spent = expenseRecords.filter(r => r.category === cat).reduce((s, r) => s + r.amount, 0)
    const limit = categoryBudgetsMap[cat] || 1
    const pct = Math.min(100, Math.round((spent / limit) * 100))
    return { category: cat, spent, limit, pct }
  })

  return (
    <div className="glass card-shadow p-5 rounded-2xl border border-slate-700/50">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            🎯 งบประมาณ & เป้าหมายทางการเงิน
          </h3>
          <p className="text-xs text-slate-400">คุมงบประมาณรวมและงบประมาณแยกตามหมวดหมู่</p>
        </div>

        <button
          onClick={() => { setEditForm(targets); setIsEditing(true); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-400 border border-indigo-500/20 transition-all hover:scale-105"
        >
          <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
          <span>ตั้งค่าเป้าหมาย</span>
        </button>
      </div>

      <div className="space-y-4 text-xs">
        {/* 1. Overall Spending Budget Bar */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex justify-between items-center mb-1.5 font-medium">
            <span className="text-slate-300">งบรายจ่ายรวมประจำเดือน</span>
            <span className="text-slate-400 font-mono">
              <span className={expensePct > 90 ? 'text-rose-400 font-bold' : 'text-slate-200 font-bold'}>
                ฿{totalExpense.toLocaleString()}
              </span> / ฿{targets.monthlyExpenseLimit.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                expensePct > 90
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : 'bg-gradient-to-r from-indigo-500 to-violet-500'
              }`}
              style={{ width: `${expensePct}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
            <span>ใช้ไปแล้ว {expensePct}%</span>
            <span>{expensePct >= 100 ? '⚠️ เกินงบประมาณ!' : `เหลือใช้ได้อีก ฿${Math.max(0, targets.monthlyExpenseLimit - totalExpense).toLocaleString()}`}</span>
          </div>
        </div>

        {/* 2. Category-Level Budget Progress Breakdown */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span>📊 งบประมาณแยกตามหมวดหมู่</span>
            <span className="text-indigo-400 text-[10px] font-normal">เตือนเมื่อถึง 80%</span>
          </div>

          {categoryExpenses.map(item => {
            const isWarning = item.pct >= 80 && item.pct < 100
            const isDanger = item.pct >= 100
            return (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1">
                    {isDanger && <ExclamationTriangleIcon className="w-3.5 h-3.5 text-rose-400" />}
                    {isWarning && <ExclamationTriangleIcon className="w-3.5 h-3.5 text-amber-400" />}
                    {item.category}
                  </span>
                  <span className="font-mono text-slate-400 text-[10px]">
                    <span className={isDanger ? 'text-rose-400 font-bold' : (isWarning ? 'text-amber-400 font-bold' : 'text-slate-200')}>
                      ฿{item.spent.toLocaleString()}
                    </span> / ฿{item.limit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDanger 
                        ? 'bg-rose-500' 
                        : (isWarning ? 'bg-amber-400' : 'bg-indigo-500')
                    }`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* 3. Savings Target Bar */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex justify-between items-center mb-1.5 font-medium">
            <span className="text-slate-300">เป้าหมายเงินออม</span>
            <span className="text-slate-400 font-mono">
              <span className="text-emerald-400 font-bold">฿{totalSavings.toLocaleString()}</span> / ฿{targets.monthlySavingsGoal.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
              style={{ width: `${savingsPct}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
            <span>ความคืบหน้า {savingsPct}%</span>
            <span>{savingsPct >= 100 ? '🎉 บรรลุเป้าหมายออมแล้ว!' : `ขาดอีก ฿${Math.max(0, targets.monthlySavingsGoal - totalSavings).toLocaleString()}`}</span>
          </div>
        </div>
      </div>

      {/* Edit Budget Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass p-6 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                ⚙️ กำหนดเป้าหมายงบประมาณ
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  1. เพดานรายจ่ายสูงสุดประจำเดือน (บาท)
                </label>
                <input
                  type="number"
                  value={editForm.monthlyExpenseLimit}
                  onChange={e => setEditForm({ ...editForm, monthlyExpenseLimit: Math.max(0, Number(e.target.value)) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  2. เป้าหมายเงินออมสะสม (บาท)
                </label>
                <input
                  type="number"
                  value={editForm.monthlySavingsGoal}
                  onChange={e => setEditForm({ ...editForm, monthlySavingsGoal: Math.max(0, Number(e.target.value)) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="block font-bold text-slate-200 mb-2">
                  3. เพดานงบประมาณแยกตามหมวดหมู่ (บาท)
                </label>
                <div className="space-y-2">
                  {Object.keys(DEFAULT_CATEGORY_BUDGETS).map(cat => (
                    <div key={cat} className="flex items-center justify-between gap-3">
                      <span className="text-slate-400 shrink-0">{cat}:</span>
                      <input
                        type="number"
                        value={editForm.categoryBudgets?.[cat] ?? DEFAULT_CATEGORY_BUDGETS[cat]}
                        onChange={e => setEditForm({
                          ...editForm,
                          categoryBudgets: {
                            ...(editForm.categoryBudgets || DEFAULT_CATEGORY_BUDGETS),
                            [cat]: Math.max(0, Number(e.target.value))
                          }
                        })}
                        className="w-32 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs text-right focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                onClick={saveTargets}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
              >
                <CheckIcon className="w-4 h-4" />
                <span>บันทึกเป้าหมาย</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

