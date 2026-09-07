import React from 'react'
import { PlusIcon, ArrowPathIcon, ArrowDownTrayIcon, PlusCircleIcon, MinusCircleIcon } from '@heroicons/react/24/outline'
import { fetchRecords } from '../lib/api'
import { useToast } from './Toast'

export default function QuickActions({ onOpenAddModal }) {
  const toast = useToast()

  const handleExportCSV = async () => {
    try {
      const records = await fetchRecords()
      if (!records || records.length === 0) {
        toast.push({ title: '⚠️ ไม่มีข้อมูลสำหรับส่งออก CSV', type: 'error' })
        return
      }

      // Thai CSV Header with BOM for proper Excel UTF-8 display
      let csvContent = '\uFEFF'
      csvContent += 'ID,วันที่,รายละเอียด,ประเภท,หมวดหมู่,จำนวนเงิน(บาท)\n'

      records.forEach(r => {
        const dateStr = new Date(r.date).toLocaleString('th-TH')
        const typeStr = r.type === 'income' ? 'รายรับ' : 'รายจ่าย'
        const safeDesc = `"${(r.description || '').replace(/"/g, '""')}"`
        const safeCat = `"${(r.category || '').replace(/"/g, '""')}"`
        csvContent += `${r._id},${dateStr},${safeDesc},${typeStr},${safeCat},${r.amount}\n`
      })

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `wealthflow_records_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.push({ title: '📥 ดาวน์โหลดไฟล์ CSV เรียบร้อยแล้ว' })
    } catch (err) {
      console.error(err)
      toast.push({ title: '❌ เกิดข้อผิดพลาดในการส่งออกไฟล์ CSV', type: 'error' })
    }
  }

  const handleRefresh = () => {
    window.dispatchEvent(new CustomEvent('recordsUpdated'))
    toast.push({ title: '🔄 อัปเดตข้อมูลเรียลไทม์แล้ว' })
  }

  return (
    <div className="flex flex-wrap items-center gap-3 my-5">
      <button
        onClick={() => onOpenAddModal?.('income')}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5"
      >
        <PlusCircleIcon className="w-5 h-5" />
        <span>+ เพิ่มรายรับ</span>
      </button>

      <button
        onClick={() => onOpenAddModal?.('expense')}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-bold text-sm shadow-lg shadow-rose-500/20 transition-all transform hover:-translate-y-0.5"
      >
        <MinusCircleIcon className="w-5 h-5" />
        <span>+ เพิ่มรายจ่าย</span>
      </button>

      <button
        onClick={handleExportCSV}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-sm font-semibold transition-all hover:border-slate-600"
      >
        <ArrowDownTrayIcon className="w-4 h-4 text-indigo-400" />
        <span>ส่งออก Excel / CSV</span>
      </button>

      <button
        onClick={handleRefresh}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-sm font-medium transition-all hover:text-white"
      >
        <ArrowPathIcon className="w-4 h-4 text-slate-400" />
        <span>รีเฟรช</span>
      </button>
    </div>
  )
}

