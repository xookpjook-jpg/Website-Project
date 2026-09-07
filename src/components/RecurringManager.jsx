import React, { useState, useEffect } from 'react'
import { ArrowPathIcon, PlusIcon, CheckIcon, TrashIcon, CalendarDaysIcon, ArrowUpCircleIcon, ArrowDownCircleIcon } from '@heroicons/react/24/outline'
import { createRecord } from '../lib/api'
import { useToast } from './Toast'

const DEFAULT_RECURRING = [
  { id: 'rec-1', description: 'เงินเดือนประจำเดือน', amount: 55000, type: 'income', category: 'เงินเดือน', dayOfMonth: 25, paymentMethod: 'bank' },
  { id: 'rec-2', description: 'ค่าเช่าคอนโด/ที่พัก', amount: 12000, type: 'expense', category: 'บิล/สาธารณูปโภค', dayOfMonth: 1, paymentMethod: 'bank' },
  { id: 'rec-3', description: 'ค่าบริการอินเทอร์เน็ต & โทรศัพท์', amount: 590, type: 'expense', category: 'บิล/สาธารณูปโภค', dayOfMonth: 15, paymentMethod: 'bank' },
  { id: 'rec-4', description: 'สมาชิก Netflix & Spotify Premium', amount: 589, type: 'expense', category: 'ความบันเทิง', dayOfMonth: 28, paymentMethod: 'credit' }
]

export default function RecurringManager() {
  const toast = useToast()
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('wealthflow_recurring_items')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) {}
    }
    return DEFAULT_RECURRING
  })

  const [showModal, setShowModal] = useState(false)
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')
  const [category, setCategory] = useState('บิล/สาธารณูปโภค')
  const [dayOfMonth, setDayOfMonth] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('bank')

  useEffect(() => {
    localStorage.setItem('wealthflow_recurring_items', JSON.stringify(items))
  }, [items])

  const handleApplyNow = async (item) => {
    try {
      await createRecord({
        description: item.description,
        amount: item.amount,
        type: item.type,
        category: item.category,
        paymentMethod: item.paymentMethod || 'bank',
        date: new Date().toISOString()
      })
      toast.push({ title: `🎉 บันทึกรายการประจำ "${item.description}" เรียบร้อยแล้ว!` })
      window.dispatchEvent(new CustomEvent('recordsUpdated'))
    } catch (err) {
      console.error(err)
      toast.push({ title: '❌ เกิดข้อผิดพลาดในการลงบันทึก', type: 'error' })
    }
  }

  const handleDelete = (id) => {
    setItems(prev => prev.filter(item => item.id !== id))
    toast.push({ title: '🗑️ ลบรายการประจำเรียบร้อย' })
  }

  const handleCreateRecurring = (e) => {
    e.preventDefault()
    if (!desc.trim() || !amount || Number(amount) <= 0) return

    const newItem = {
      id: 'rec-' + Date.now(),
      description: desc.trim(),
      amount: Math.abs(Number(amount)),
      type,
      category,
      dayOfMonth: Number(dayOfMonth),
      paymentMethod
    }

    setItems(prev => [...prev, newItem])
    setShowModal(false)
    setDesc('')
    setAmount('')
    toast.push({ title: '✨ เพิ่มรายการประจำใหม่เรียบร้อยแล้ว' })
  }

  return (
    <div className="glass card-shadow p-5 rounded-2xl border border-slate-700/50">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            🔄 รายการรายรับ-รายจ่ายประจำ (Recurring Expenses)
          </h3>
          <p className="text-xs text-slate-400">จัดการรายการที่ต้องรับ/จ่ายซ้ำทุกเดือน พร้อมลงบันทึกใน 1-Click</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
        >
          <PlusIcon className="w-4 h-4" />
          <span>เพิ่มรายการประจำ</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map(item => {
          const isIncome = item.type === 'income'
          return (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  isIncome
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {isIncome ? <ArrowUpCircleIcon className="w-5 h-5" /> : <ArrowDownCircleIcon className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-semibold text-slate-200 text-sm">{item.description}</div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1 text-indigo-300 font-mono">
                      <CalendarDaysIcon className="w-3.5 h-3.5" />
                      ทุกวันที่ {item.dayOfMonth}
                    </span>
                    <span>• {item.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <div className={`font-mono font-bold text-sm ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isIncome ? '+' : '-'}฿{item.amount.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleApplyNow(item)}
                    title="ลงบันทึกในระบบทันที"
                    className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1 border border-emerald-500/30 transition-all hover:scale-105"
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">บันทึก</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    title="ลบรายการประจำ"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal Add Recurring Item */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass p-6 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold text-slate-100">➕ เพิ่มรายการประจำใหม่</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateRecurring} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    type === 'income' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  + รายรับประจำ
                </button>
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    type === 'expense' ? 'bg-rose-500 text-white border-rose-400' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  - รายจ่ายประจำ
                </button>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">รายละเอียดรายการ:</label>
                <input
                  type="text"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="เช่น ค่าเช่าห้อง, ค่าเน็ต, เงินเดือน"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">จำนวนเงิน (บาท):</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">หมวดหมู่:</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="บิล/สาธารณูปโภค">บิล/สาธารณูปโภค</option>
                    <option value="อาหาร/เครื่องดื่ม">อาหาร/เครื่องดื่ม</option>
                    <option value="ความบันเทิง">ความบันเทิง</option>
                    <option value="เงินเดือน">เงินเดือน</option>
                    <option value="การเดินทาง">การเดินทาง</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">วันที่ทำรายการของทุกเดือน (1-31):</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dayOfMonth}
                  onChange={e => setDayOfMonth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30"
                >
                  บันทึกรายการประจำ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
