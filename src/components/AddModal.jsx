import React, { useState, useEffect } from 'react'
import { XMarkIcon, ArrowUpCircleIcon, ArrowDownCircleIcon, PhotoIcon, TagIcon, CreditCardIcon, BanknotesIcon, BuildingLibraryIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline'
import { createRecord, updateRecord } from '../lib/api'
import { useToast } from './Toast'

const INCOME_CATEGORIES = ['เงินเดือน', 'โบนัส/การลงทุน', 'งานพิเศษ', 'ขายของ', 'รายรับอื่นๆ']
const EXPENSE_CATEGORIES = ['อาหาร/เครื่องดื่ม', 'การเดินทาง', 'บิล/สาธารณูปโภค', 'ความบันเทิง', 'ช้อปปิ้ง', 'ค่ารักษา/สุขภาพ', 'การศึกษา', 'รายจ่ายอื่นๆ']

const PAYMENT_METHODS = [
  { id: 'cash', label: 'เงินสด', icon: BanknotesIcon, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  { id: 'bank', label: 'โอนเงิน/ธนาคาร', icon: BuildingLibraryIcon, color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  { id: 'credit', label: 'บัตรเครดิต', icon: CreditCardIcon, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  { id: 'wallet', label: 'E-Wallet/สแกน', icon: DevicePhoneMobileIcon, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' }
]

export default function AddModal({ onClose, recordToEdit = null, defaultType = 'income' }) {
  const toast = useToast()
  const [type, setType] = useState(recordToEdit ? recordToEdit.type : defaultType)
  const [description, setDescription] = useState(recordToEdit ? recordToEdit.description : '')
  const [amount, setAmount] = useState(recordToEdit ? recordToEdit.amount : '')
  const [category, setCategory] = useState(recordToEdit ? recordToEdit.category : (defaultType === 'income' ? 'เงินเดือน' : 'อาหาร/เครื่องดื่ม'))
  const [paymentMethod, setPaymentMethod] = useState(recordToEdit && recordToEdit.paymentMethod ? recordToEdit.paymentMethod : 'bank')
  const [receiptUrl, setReceiptUrl] = useState(recordToEdit && recordToEdit.receiptUrl ? recordToEdit.receiptUrl : '')
  const [tagsInput, setTagsInput] = useState(recordToEdit && Array.isArray(recordToEdit.tags) ? recordToEdit.tags.join(', ') : '')
  const [date, setDate] = useState(recordToEdit && recordToEdit.date ? recordToEdit.date.slice(0, 10) : new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!recordToEdit) {
      if (type === 'income' && !INCOME_CATEGORIES.includes(category)) {
        setCategory(INCOME_CATEGORIES[0])
      } else if (type === 'expense' && !EXPENSE_CATEGORIES.includes(category)) {
        setCategory(EXPENSE_CATEGORIES[0])
      }
    }
  }, [type, recordToEdit, category])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
      toast.push({ title: '⚠️ ขนาดไฟล์รูปภาพเกิน 3MB', type: 'error' })
      return
    }
    const reader = new FileReader()
    reader.onload = (evt) => {
      setReceiptUrl(evt.target.result)
      toast.push({ title: '📸 แนบรูปสลิป/ใบเสร็จเรียบร้อย' })
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!description.trim()) {
      toast.push({ title: '⚠️ กรุณากรอกรายละเอียดรายการ', type: 'error' })
      return
    }
    const numAmount = Math.abs(Number(amount))
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.push({ title: '⚠️ กรุณากรอกจำนวนเงินให้ถูกต้อง', type: 'error' })
      return
    }

    const parsedTags = tagsInput.split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .map(t => t.startsWith('#') ? t : `#${t}`)

    setLoading(true)
    try {
      const payload = {
        description: description.trim(),
        amount: numAmount,
        category: category || (type === 'income' ? 'เงินเดือน' : 'อาหาร/เครื่องดื่ม'),
        type,
        date: new Date(date).toISOString(),
        paymentMethod,
        receiptUrl,
        tags: parsedTags
      }

      if (recordToEdit) {
        await updateRecord(recordToEdit._id || recordToEdit.id, payload)
        toast.push({ title: '✨ อัปเดตรายการเรียบร้อยแล้ว' })
      } else {
        await createRecord(payload)
        toast.push({ title: `🎉 บันทึก${type === 'income' ? 'รายรับ' : 'รายจ่าย'}สำเร็จ!` })
      }

      window.dispatchEvent(new CustomEvent('recordsUpdated'))
      onClose?.()
    } catch (err) {
      console.error(err)
      toast.push({ title: '❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const activeCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#11192a] border border-slate-700/60 rounded-2xl p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-xl font-bold text-slate-100">
            {recordToEdit ? '✏️ แก้ไขรายการ' : '➕ เพิ่มรายการใหม่'}
          </h3>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Income / Expense Switcher */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                type === 'income' 
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpCircleIcon className="w-5 h-5" />
              <span>รายรับ (Income)</span>
            </button>

            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                type === 'expense' 
                  ? 'bg-rose-500 text-slate-100 shadow-lg shadow-rose-500/20' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownCircleIcon className="w-5 h-5" />
              <span>รายจ่าย (Expense)</span>
            </button>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              รายละเอียดรายการ <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={type === 'income' ? 'เช่น เงินเดือนประจำเดือน, งานรับจ้าง' : 'เช่น ค่าอาหาร, ค่าน้ำมัน, ค่าสินค้า'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              required
            />
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                จำนวนเงิน (บาท) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold text-sm">฿</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                หมวดหมู่
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              >
                {activeCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              💳 ช่องทางการชำระเงิน
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {PAYMENT_METHODS.map(m => {
                const Icon = m.icon
                const isSelected = paymentMethod === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                      isSelected 
                        ? `${m.color} font-bold shadow-md scale-105` 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span>{m.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Date & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                วันที่ทำรายการ
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <TagIcon className="w-3.5 h-3.5 text-indigo-400" />
                แท็ก (คั่นด้วยจุลภาค)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="เช่น #ท่องเที่ยว, #ปาร์ตี้"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Slip / Receipt Upload Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <PhotoIcon className="w-4 h-4 text-emerald-400" />
              แนบไฟล์สลิปโอนเงิน / ใบเสร็จ (รูปภาพ)
            </label>
            {receiptUrl ? (
              <div className="relative p-2 bg-slate-900/90 rounded-xl border border-slate-700 flex items-center gap-3">
                <img src={receiptUrl} alt="Slip Receipt" className="w-14 h-14 object-cover rounded-lg border border-slate-700 shrink-0" />
                <div className="flex-1 text-xs text-slate-300">
                  <div className="font-semibold text-emerald-400">✓ แนบไฟล์รูปสลิปแล้ว</div>
                  <div className="text-[10px] text-slate-500">คลิกปุ่มด้านขวาหากต้องการลบออก</div>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptUrl('')}
                  className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg text-xs font-semibold"
                >
                  ลบออก
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center p-3 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 hover:bg-slate-900 cursor-pointer transition-colors text-xs text-slate-400 gap-2">
                <PhotoIcon className="w-5 h-5 text-indigo-400" />
                <span>คลิกเพื่อแนบรูปสลิป (PNG, JPG ไม่เกิน 3MB)</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white text-sm font-medium transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg ${
                type === 'income'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-400 hover:to-pink-400 shadow-rose-500/20'
              }`}
            >
              {loading ? 'บันทึกข้อมูล...' : (recordToEdit ? 'บันทึกการแก้ไข' : 'บันทึกรายการ')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

