import React, { useState, useEffect } from 'react'
import { PlusIcon, SparklesIcon, TrophyIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useToast } from './Toast'

const DEFAULT_GOALS = [
  { id: 'g1', title: '🛡️ กองทุนเงินสำรองฉุกเฉิน', target: 100000, current: 75000, category: 'การเงิน', icon: '🛡️' },
  { id: 'g2', title: '💻 ซื้อ MacBook Pro ใหม่', target: 65000, current: 38000, category: 'ไอที', icon: '💻' },
  { id: 'g3', title: '✈️ ทริปเที่ยวญี่ปุ่นปลายปี', target: 45000, current: 22000, category: 'ท่องเที่ยว', icon: '✈️' }
]

export default function SavingsGoals() {
  const toast = useToast()
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('wealthflow_savings_goals')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) {}
    }
    return DEFAULT_GOALS
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [topUpGoalId, setTopUpGoalId] = useState(null)
  const [topUpAmount, setTopUpAmount] = useState('')

  const [form, setForm] = useState({
    title: '',
    target: 10000,
    current: 0,
    icon: '🎯'
  })

  useEffect(() => {
    localStorage.setItem('wealthflow_savings_goals', JSON.stringify(goals))
  }, [goals])

  const handleAddGoal = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const newGoal = {
      id: 'g-' + Date.now(),
      title: `${form.icon} ${form.title}`,
      target: Number(form.target) || 10000,
      current: Number(form.current) || 0,
      icon: form.icon
    }
    setGoals(prev => [newGoal, ...prev])
    setIsModalOpen(false)
    setForm({ title: '', target: 10000, current: 0, icon: '🎯' })
    toast.push({ title: `🎯 เพิ่มเป้าหมาย "${newGoal.title}" สำเร็จ!` })
  }

  const handleTopUp = (goalId) => {
    const amt = Number(topUpAmount)
    if (isNaN(amt) || amt <= 0) return

    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const nextCurrent = g.current + amt
        if (nextCurrent >= g.target && g.current < g.target) {
          toast.push({ title: `🎉 ยินดีด้วย! คุณบรรลุเป้าหมาย "${g.title}" สำเร็จแล้ว!`, type: 'success' })
        } else {
          toast.push({ title: `💰 ออมเงินเพิ่ม ฿${amt.toLocaleString()} สำเร็จ!` })
        }
        return { ...g, current: nextCurrent }
      }
      return g
    }))

    setTopUpGoalId(null)
    setTopUpAmount('')
  }

  const handleDeleteGoal = (id, title) => {
    if (!window.confirm(`ลบเป้าหมาย "${title}" ใช่หรือไม่?`)) return
    setGoals(prev => prev.filter(g => g.id !== id))
    toast.push({ title: '🗑️ ลบเป้าหมายการออมเงินแล้ว' })
  }

  return (
    <div className="glass card-shadow p-5 rounded-2xl border border-slate-700/50 mb-6 bg-gradient-to-br from-[#12192c] via-[#16223d] to-[#12192c]">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <TrophyIcon className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 truncate flex items-center gap-2">
              🎯 เป้าหมายการออมเงิน (Savings Goals)
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {goals.length} เป้าหมาย
              </span>
            </h3>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all hover:scale-105 shrink-0"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          <span>+ เพิ่มเป้าหมาย</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {goals.map(g => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100)) || 0
          const isDone = g.current >= g.target

          return (
            <div key={g.id} className="p-4 rounded-xl glass border border-slate-700/60 bg-slate-900/60 space-y-3 relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
              {/* Top Row: Title & Action */}
              <div className="flex items-start justify-between gap-2">
                <div className="font-bold text-xs text-slate-200 truncate flex-1">{g.title}</div>
                <button
                  onClick={() => handleDeleteGoal(g.id, g.title)}
                  className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                  title="ลบเป้าหมาย"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Amount Numbers */}
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-amber-400 font-extrabold text-sm">
                  ฿{g.current.toLocaleString()}
                </span>
                <span className="text-slate-400 font-medium">
                  เป้าหมาย ฿{g.target.toLocaleString()}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold">
                  <span className="text-slate-400">ความคืบหน้า</span>
                  <span className={isDone ? 'text-emerald-400 font-bold' : 'text-amber-400'}>{pct}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDone
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/50'
                        : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 shadow-md shadow-amber-500/30'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Bottom Quick Top Up Button */}
              {topUpGoalId === g.id ? (
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="number"
                    placeholder="จำนวนเงิน..."
                    value={topUpAmount}
                    onChange={e => setTopUpAmount(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg bg-slate-950 border border-amber-500/50 text-slate-100 text-xs focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleTopUp(g.id)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shrink-0"
                  >
                    ตกลง
                  </button>
                  <button
                    onClick={() => setTopUpGoalId(null)}
                    className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setTopUpGoalId(g.id); setTopUpAmount(''); }}
                  className="w-full py-1.5 rounded-lg bg-slate-800/80 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/20 transition-all flex items-center justify-center gap-1"
                >
                  <SparklesIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>+ ออมเงินเพิ่ม</span>
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* CREATE GOAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass p-6 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                🎯 เพิ่มเป้าหมายการออมเงินใหม่
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ไอคอนประจำเป้าหมาย</label>
                <div className="flex gap-2">
                  {['🎯', '🚗', '🏠', '💻', '✈️', '🛡️', '🎓', '💍'].map(ic => (
                    <button
                      type="button"
                      key={ic}
                      onClick={() => setForm({ ...form, icon: ic })}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all ${
                        form.icon === ic ? 'bg-amber-500/20 border-amber-500 scale-110' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ชื่อเป้าหมาย</label>
                <input
                  type="text"
                  placeholder="เช่น เก็บเงินออกรถยนต์, กองทุนเกษียณ..."
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ยอดเป้าหมาย (฿)</label>
                  <input
                    type="number"
                    value={form.target}
                    onChange={e => setForm({ ...form, target: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">เงินออมที่มีตอนนี้ (฿)</label>
                  <input
                    type="number"
                    value={form.current}
                    onChange={e => setForm({ ...form, current: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1 shadow-lg shadow-amber-500/20"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>สร้างเป้าหมาย</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
