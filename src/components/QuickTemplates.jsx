import React, { useState, useEffect } from 'react'
import { createRecord } from '../lib/api'
import { useToast } from './Toast'
import { 
  BoltIcon, 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  XMarkIcon, 
  CheckIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

const DEFAULT_TEMPLATES = [
  { id: 't1', label: '☕ กาแฟ & ขนม', amount: 80, type: 'expense', category: 'อาหาร/เครื่องดื่ม', icon: '☕' },
  { id: 't2', label: '🍱 อาหารกลางวัน', amount: 120, type: 'expense', category: 'อาหาร/เครื่องดื่ม', icon: '🍱' },
  { id: 't3', label: '⛽ ค่าน้ำมันรถ', amount: 1000, type: 'expense', category: 'การเดินทาง', icon: '⛽' },
  { id: 't4', label: '🛒 ของใช้ซูเปอร์', amount: 650, type: 'expense', category: 'ช้อปปิ้ง', icon: '🛒' },
  { id: 't5', label: '💻 งานพิเศษ/ฟรีแลนซ์', amount: 3500, type: 'income', category: 'งานพิเศษ', icon: '💻' },
  { id: 't6', label: '📈 ปันผล/ดอกเบี้ย', amount: 1200, type: 'income', category: 'โบนัส/การลงทุน', icon: '📈' }
]

const EMOJI_OPTIONS = ['☕', '🍱', '⛽', '🛒', '💻', '📈', '🚗', '🏠', '💊', '🎬', '✈️', '🎁', '💰', '🍔', '⚡', '📱', '🏋️', '📚']

const CATEGORIES = [
  'เงินเดือน', 'งานพิเศษ', 'ขายของ', 'โบนัส/การลงทุน', 'รายรับอื่นๆ',
  'อาหาร/เครื่องดื่ม', 'การเดินทาง', 'บิล/สาธารณูปโภค', 'ช้อปปิ้ง', 'ความบันเทิง', 'สุขภาพ/การรักษา', 'รายจ่ายอื่นๆ'
]

export default function QuickTemplates() {
  const toast = useToast()
  
  // Persistent Templates State
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('wealthflow_quick_templates')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch (e) {}
    }
    return DEFAULT_TEMPLATES
  })

  const [loadingIndex, setLoadingIndex] = useState(null)
  
  // Manage Modal State
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null) // null = creating new

  // Form State
  const [form, setForm] = useState({
    icon: '☕',
    label: '',
    amount: 100,
    type: 'expense',
    category: 'อาหาร/เครื่องดื่ม'
  })

  useEffect(() => {
    localStorage.setItem('wealthflow_quick_templates', JSON.stringify(templates))
  }, [templates])

  // One-click Execute Template
  const handleQuickAdd = async (tmpl, index) => {
    setLoadingIndex(index)
    try {
      const payload = {
        description: tmpl.label,
        amount: Math.abs(Number(tmpl.amount)) || 0,
        type: tmpl.type,
        category: tmpl.category,
        date: new Date().toISOString()
      }

      await createRecord(payload)
      toast.push({ 
        title: `${tmpl.type === 'income' ? '🟢 รายรับ' : '🔴 รายจ่าย'} ${tmpl.label} (฿${tmpl.amount.toLocaleString()}) บันทึกสำเร็จ!`,
        type: 'success'
      })
      window.dispatchEvent(new CustomEvent('recordsUpdated'))
    } catch (err) {
      console.error(err)
      toast.push({ title: '❌ เกิดข้อผิดพลาดในการบันทึกรายการด่วน', type: 'error' })
    } finally {
      setLoadingIndex(null)
    }
  }

  // Open Create Form
  const openCreateForm = () => {
    setEditingTemplate(null)
    setForm({
      icon: '☕',
      label: '',
      amount: 100,
      type: 'expense',
      category: 'อาหาร/เครื่องดื่ม'
    })
  }

  // Open Edit Form for specific template
  const openEditForm = (tmpl) => {
    setEditingTemplate(tmpl)
    setForm({
      icon: tmpl.icon || '☕',
      label: tmpl.label || '',
      amount: tmpl.amount || 0,
      type: tmpl.type || 'expense',
      category: tmpl.category || 'ทั่วไป'
    })
  }

  // Save Template (Create or Update)
  const handleSaveTemplate = (e) => {
    e.preventDefault()
    if (!form.label.trim()) {
      toast.push({ title: '⚠️ กรุณาระบุชื่อรายการบันทึกด่วน', type: 'error' })
      return
    }

    if (editingTemplate) {
      // Update existing
      setTemplates(prev => prev.map(t => 
        t.id === editingTemplate.id ? { ...t, ...form, amount: Math.abs(Number(form.amount)) } : t
      ))
      toast.push({ title: '✏️ แก้ไขเทมเพลตบันทึกด่วนเรียบร้อยแล้ว' })
    } else {
      // Create new
      const newTmpl = {
        id: 't-' + Date.now(),
        ...form,
        amount: Math.abs(Number(form.amount))
      }
      setTemplates(prev => [...prev, newTmpl])
      toast.push({ title: '✨ เพิ่มเทมเพลตบันทึกด่วนใหม่เรียบร้อยแล้ว' })
    }

    openCreateForm()
  }

  // Delete Template
  const handleDeleteTemplate = (id, label) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบเทมเพลต "${label}"?`)) return
    setTemplates(prev => prev.filter(t => t.id !== id))
    toast.push({ title: '🗑️ ลบเทมเพลตบันทึกด่วนเรียบร้อยแล้ว' })
    if (editingTemplate && editingTemplate.id === id) {
      openCreateForm()
    }
  }

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (!window.confirm('คุณต้องการรีเซ็ตเทมเพลตกลับเป็นค่าเริ่มต้นทั้งหมดหรือไม่?')) return
    setTemplates(DEFAULT_TEMPLATES)
    toast.push({ title: '🔄 คืนค่าเทมเพลตเป็นค่าเริ่มต้นแล้ว' })
  }

  return (
    <div className="glass card-shadow p-4 rounded-2xl border border-indigo-500/20 mb-6 bg-gradient-to-r from-slate-900/90 via-indigo-950/20 to-slate-900/90">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <BoltIcon className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            ⚡ บันทึกด่วนใน 1 คลิก (Quick Templates)
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 border border-indigo-500/20">
              {templates.length} ปุ่ม
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { openCreateForm(); setIsManageModalOpen(true); }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-bold border border-indigo-500/30 transition-all hover:scale-105"
          >
            <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
            <span>⚙️ จัดการ / เพิ่มเทมเพลต</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Strip of Quick Buttons */}
      <div className="flex overflow-x-auto gap-2.5 pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-slate-800">
        {templates.map((tmpl, idx) => {
          const isLoading = loadingIndex === idx
          const isIncome = tmpl.type === 'income'
          return (
            <button
              key={tmpl.id || idx}
              disabled={isLoading}
              onClick={() => handleQuickAdd(tmpl, idx)}
              className={`group shrink-0 relative flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 active:scale-95 text-xs font-semibold ${
                isIncome
                  ? 'bg-emerald-950/30 border-emerald-500/30 hover:border-emerald-400 text-emerald-300'
                  : 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/40 text-slate-200'
              }`}
            >
              <span className="text-base shrink-0">{tmpl.icon || '⚡'}</span>
              <span className="truncate max-w-[120px] text-left">{tmpl.label}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border font-mono shrink-0 ${
                isIncome 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              }`}>
                {isIncome ? '+' : '-'}฿{Number(tmpl.amount).toLocaleString()}
              </span>

              {isLoading && (
                <div className="absolute inset-0 rounded-xl bg-slate-950/80 backdrop-blur-xs flex items-center justify-center text-xs text-indigo-400 font-bold">
                  <span className="animate-spin">⏳</span>
                </div>
              )}
            </button>
          )
        })}

        {/* Add New Quick Button Shortcut */}
        <button
          onClick={() => { openCreateForm(); setIsManageModalOpen(true); }}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-slate-700/80 hover:border-indigo-500 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/5 transition-all text-xs font-semibold"
        >
          <PlusIcon className="w-4 h-4 text-indigo-400" />
          <span>+ เพิ่มปุ่มด่วน</span>
        </button>
      </div>

      {/* MANAGE TEMPLATES MODAL */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass p-6 rounded-2xl border border-slate-700 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  ⚙️ จัดการปุ่มบันทึกด่วน (Quick Templates Manager)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">เพิ่ม แก้ไข หรือลบปุ่มทางลัดบันทึกรายการประจำของคุณ</p>
              </div>
              <button
                onClick={() => setIsManageModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Left Column: Form to Create/Edit */}
              <form onSubmit={handleSaveTemplate} className="md:col-span-3 space-y-3.5 p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
                <div className="font-bold text-slate-200 text-sm flex items-center justify-between border-b border-slate-800 pb-2">
                  <span>{editingTemplate ? '✏️ แก้ไขปุ่มบันทึกด่วน' : '✨ เพิ่มปุ่มบันทึกด่วนใหม่'}</span>
                  {editingTemplate && (
                    <button
                      type="button"
                      onClick={openCreateForm}
                      className="text-[11px] font-semibold text-indigo-400 hover:underline"
                    >
                      + สลับเป็นเพิ่มใหม่
                    </button>
                  )}
                </div>

                {/* Emoji Selection */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">เลือกไอคอน Emoji:</label>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800 max-h-24 overflow-y-auto">
                    {EMOJI_OPTIONS.map(emo => (
                      <button
                        type="button"
                        key={emo}
                        onClick={() => setForm({ ...form, icon: emo })}
                        className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                          form.icon === emo ? 'bg-indigo-600 text-white shadow font-bold scale-110' : 'hover:bg-slate-800'
                        }`}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ชื่อรายการ (เช่น กาแฟอเมซอน, ค่าน้ำมัน):</label>
                  <input
                    type="text"
                    required
                    value={form.label}
                    onChange={e => setForm({ ...form, label: e.target.value })}
                    placeholder="ระบุชื่อปุ่มทางลัด..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Amount & Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">จำนวนเงิน (บาท):</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={form.amount}
                      onChange={e => setForm({ ...form, amount: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">ประเภท:</label>
                    <select
                      value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-medium focus:outline-none focus:border-indigo-500"
                    >
                      <option value="expense">🔴 รายจ่าย</option>
                      <option value="income">🟢 รายรับ</option>
                    </select>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">หมวดหมู่:</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-medium focus:outline-none focus:border-indigo-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Save Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>{editingTemplate ? 'บันทึกการแก้ไข' : '+ เพิ่มเทมเพลตนี้'}</span>
                  </button>
                </div>
              </form>

              {/* Right Column: Existing List */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">รายการปุ่มปัจจุบัน ({templates.length})</span>
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="text-[10px] font-semibold text-slate-400 hover:text-amber-400 flex items-center gap-1"
                  >
                    <ArrowPathIcon className="w-3 h-3" />
                    คืนค่าเริ่มต้น
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {templates.map(t => (
                    <div
                      key={t.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                        editingTemplate?.id === t.id
                          ? 'bg-indigo-950/40 border-indigo-500 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-base">{t.icon || '⚡'}</span>
                        <div className="truncate">
                          <div className="font-bold truncate">{t.label}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {t.type === 'income' ? '+' : '-'}฿{Number(t.amount).toLocaleString()} ({t.category})
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditForm(t)}
                          title="แก้ไข"
                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTemplate(t.id, t.label)}
                          title="ลบ"
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
