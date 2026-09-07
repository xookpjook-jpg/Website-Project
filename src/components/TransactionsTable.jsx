import React, { useState, useEffect, useMemo } from 'react'
import { 
  PencilSquareIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  TagIcon,
  FunnelIcon,
  ArrowPathIcon,
  CalendarIcon,
  CheckCircleIcon,
  CheckIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline'
import { fetchRecords, deleteRecord } from '../lib/api'
import { useToast } from './Toast'
import EmptyState from './EmptyState'

export default function TransactionsTable({ onEditRecord, limit = null, onViewAll = null }) {
  const toast = useToast()
  
  // State for raw data
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter States
  const [q, setQ] = useState('')
  const [filterType, setFilterType] = useState('all') // all, income, expense
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all') // all, cash, bank, credit, wallet
  const [datePreset, setDatePreset] = useState('all') // all, today, 7d, 30d, month, custom
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [sortBy, setSortBy] = useState('newest') // newest, oldest, amount_desc, amount_asc, title_az

  // Slip Modal Viewer & CSV Importer
  const [activeSlipUrl, setActiveSlipUrl] = useState(null)
  const [isImporting, setIsImporting] = useState(false)

  // Pagination & Multi-Select
  const [page, setPage] = useState(1)
  const perPage = limit || 10
  const [selectedIds, setSelectedIds] = useState([])
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchRecords()
      setRecords(data)
    } catch (err) {
      console.error(err)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const onUpdate = () => loadData()
    window.addEventListener('recordsUpdated', onUpdate)
    return () => window.removeEventListener('recordsUpdated', onUpdate)
  }, [])

  // CSV Statement Import Handler
  const handleCSVImportFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setIsImporting(true)

    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result
        const lines = text.split(/\r?\n/).filter(line => line.trim())
        if (lines.length <= 1) {
          toast.push({ title: '⚠️ ไฟล์ CSV ไม่มีข้อมูลรายการ', type: 'error' })
          setIsImporting(false)
          return
        }

        let importedCount = 0
        // Skip header line
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim())
          if (cols.length >= 4) {
            // Expected columns: ID, วันที่, รายละเอียด, ประเภท, หมวดหมู่, จำนวนเงิน
            const rawDate = cols[1] || ''
            const desc = cols[2] || cols[0] || 'รายการนำเข้า'
            const typeStr = (cols[3] || '').includes('รายรับ') ? 'income' : 'expense'
            const cat = cols[4] || 'ทั่วไป'
            const amt = Math.abs(Number(cols[5] || cols[4] || cols[3] || 0))

            if (desc && !isNaN(amt) && amt > 0) {
              await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  description: desc,
                  amount: amt,
                  category: cat,
                  type: typeStr,
                  date: rawDate ? new Date(rawDate).toISOString() : new Date().toISOString()
                })
              }).catch(() => {})
              importedCount++
            }
          }
        }

        toast.push({ title: `📥 นำเข้าข้อมูลสำเร็จ ${importedCount} รายการ!` })
        window.dispatchEvent(new CustomEvent('recordsUpdated'))
      } catch (err) {
        console.error(err)
        toast.push({ title: '❌ อ่านไฟล์ CSV ไม่สำเร็จ', type: 'error' })
      } finally {
        setIsImporting(false)
        e.target.value = ''
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  // Extract unique categories dynamically
  const categoriesList = useMemo(() => {
    const set = new Set(records.map(r => r.category).filter(Boolean))
    return Array.from(set).sort()
  }, [records])

  // Single record delete
  const handleDelete = async (id, description) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบรายการ "${description}"?`)) return
    setDeletingId(id)
    try {
      await deleteRecord(id)
      toast.push({ title: '🗑️ ลบรายการเรียบร้อยแล้ว' })
      setSelectedIds(prev => prev.filter(item => item !== id))
      window.dispatchEvent(new CustomEvent('recordsUpdated'))
    } catch (err) {
      console.error(err)
      toast.push({ title: '❌ เกิดข้อผิดพลาดในการลบรายการ', type: 'error' })
    } finally {
      setDeletingId(null)
    }
  }

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!window.confirm(`คุณต้องการลบรายการที่เลือกจำนวน ${selectedIds.length} รายการ หรือไม่?`)) return

    setIsBulkDeleting(true)
    try {
      await Promise.all(selectedIds.map(id => deleteRecord(id)))
      toast.push({ title: `🗑️ ลบรายการที่เลือกจำนวน ${selectedIds.length} รายการ เรียบร้อย!` })
      setSelectedIds([])
      window.dispatchEvent(new CustomEvent('recordsUpdated'))
    } catch (err) {
      console.error(err)
      toast.push({ title: '❌ เกิดข้อผิดพลาดในการลบหลายรายการ', type: 'error' })
    } finally {
      setIsBulkDeleting(false)
    }
  }

  // Filter & Sort Logic
  const filtered = useMemo(() => {
    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)

    return records.filter(item => {
      // 1. Text Search
      const searchMatch = !q.trim() || 
        (item.description || '').toLowerCase().includes(q.toLowerCase()) || 
        (item.category || '').toLowerCase().includes(q.toLowerCase()) ||
        (Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(q.toLowerCase())))

      // 2. Type Match
      const typeMatch = filterType === 'all' || item.type === filterType

      // 3. Category Match
      const catMatch = categoryFilter === 'all' || item.category === categoryFilter

      // 4. Payment Method Match
      const payMatch = paymentFilter === 'all' || (item.paymentMethod || 'cash') === paymentFilter

      // 5. Date Preset Match
      let dateMatch = true
      const itemDateStr = (item.dateKey || (item.date ? new Date(item.date).toISOString().slice(0, 10) : ''))
      
      if (datePreset === 'today') {
        dateMatch = itemDateStr === todayStr
      } else if (datePreset === '7d') {
        const d7Ago = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10)
        dateMatch = itemDateStr >= d7Ago && itemDateStr <= todayStr
      } else if (datePreset === '30d') {
        const d30Ago = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10)
        dateMatch = itemDateStr >= d30Ago && itemDateStr <= todayStr
      } else if (datePreset === 'month') {
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
        dateMatch = itemDateStr >= firstDayOfMonth
      } else if (datePreset === 'custom') {
        if (customStart) dateMatch = dateMatch && itemDateStr >= customStart
        if (customEnd) dateMatch = dateMatch && itemDateStr <= customEnd
      }

      // 6. Amount Range Match
      let amountMatch = true
      if (minAmount !== '') amountMatch = amountMatch && item.amount >= Number(minAmount)
      if (maxAmount !== '') amountMatch = amountMatch && item.amount <= Number(maxAmount)

      return searchMatch && typeMatch && catMatch && payMatch && dateMatch && amountMatch
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date) - new Date(a.date)
      if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date)
      if (sortBy === 'amount_desc') return b.amount - a.amount
      if (sortBy === 'amount_asc') return a.amount - b.amount
      if (sortBy === 'title_az') return (a.description || '').localeCompare(b.description || '')
      return 0
    })
  }, [records, q, filterType, categoryFilter, paymentFilter, datePreset, customStart, customEnd, minAmount, maxAmount, sortBy])

  // Aggregate stats of filtered view
  const filteredIncome = useMemo(() => {
    return filtered.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
  }, [filtered])

  const filteredExpense = useMemo(() => {
    return filtered.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
  }, [filtered])

  const filteredNet = filteredIncome - filteredExpense

  // Pagination Math
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageData = limit ? filtered.slice(0, limit) : filtered.slice((page - 1) * perPage, page * perPage)

  // Multi-Select Handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === pageData.length && pageData.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(pageData.map(r => r._id))
    }
  }

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const resetAllFilters = () => {
    setQ('')
    setFilterType('all')
    setCategoryFilter('all')
    setPaymentFilter('all')
    setDatePreset('all')
    setCustomStart('')
    setCustomEnd('')
    setMinAmount('')
    setMaxAmount('')
    setSortBy('newest')
    setPage(1)
    toast.push({ title: '🔄 ล้างฟิลเตอร์ทั้งหมดแล้ว' })
  }

  const hasActiveFilters = q || filterType !== 'all' || categoryFilter !== 'all' || paymentFilter !== 'all' || datePreset !== 'all' || minAmount || maxAmount

  return (
    <div className="glass card-shadow p-5 rounded-2xl border border-slate-700/50">
      {/* Header & Filter Controls */}
      <div className="space-y-4 mb-5 pb-4 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              📋 ประวัติรายการรายรับ-รายจ่าย
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {filtered.length} รายการ
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">ค้นหา กรอง และจัดการธุรกรรมการเงินได้อย่างครบถ้วน</p>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold cursor-pointer transition-all">
              <ArrowPathIcon className={`w-3.5 h-3.5 ${isImporting ? 'animate-spin' : ''}`} />
              <span>{isImporting ? 'กำลังนำเข้า...' : '📥 นำเข้า CSV'}</span>
              <input type="file" accept=".csv" onChange={handleCSVImportFile} disabled={isImporting} className="hidden" />
            </label>

            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition-all"
              >
                <TrashIcon className="w-4 h-4" />
                <span>ลบที่เลือก ({selectedIds.length})</span>
              </button>
            )}

            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
              >
                <ArrowPathIcon className="w-3.5 h-3.5" />
                <span>ล้างฟิลเตอร์</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Filter Controls Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-xs">
          {/* 1. Type Tabs */}
          <div>
            <div className="flex p-0.5 bg-slate-900 rounded-lg border border-slate-800">
              <button
                onClick={() => { setFilterType('all'); setPage(1); }}
                className={`flex-1 py-1 rounded-md font-medium transition-all text-center ${
                  filterType === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => { setFilterType('income'); setPage(1); }}
                className={`flex-1 py-1 rounded-md font-medium transition-all text-center ${
                  filterType === 'income' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                รายรับ
              </button>
              <button
                onClick={() => { setFilterType('expense'); setPage(1); }}
                className={`flex-1 py-1 rounded-md font-medium transition-all text-center ${
                  filterType === 'expense' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                รายจ่าย
              </button>
            </div>
          </div>

          {/* 2. Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">ทุกหมวดหมู่ ({categoriesList.length})</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* 3. Payment Method Filter */}
          <div>
            <select
              value={paymentFilter}
              onChange={e => { setPaymentFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">ทุกช่องทางชำระ</option>
              <option value="cash">💵 เงินสด</option>
              <option value="bank">🏦 โอนเงิน/ธนาคาร</option>
              <option value="credit">💳 บัตรเครดิต</option>
              <option value="wallet">📱 E-Wallet/สแกน</option>
            </select>
          </div>

          {/* 4. Date Preset */}
          <div>
            <select
              value={datePreset}
              onChange={e => { setDatePreset(e.target.value); setPage(1); }}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">ทุกช่วงเวลา</option>
              <option value="today">วันนี้</option>
              <option value="7d">7 วันย้อนหลัง</option>
              <option value="30d">30 วันย้อนหลัง</option>
              <option value="month">เดือนนี้</option>
              <option value="custom">กำหนดช่วงวันที่เอง...</option>
            </select>
          </div>

          {/* 5. Search Box */}
          <div>
            <div className="relative">
              <input
                type="text"
                value={q}
                onChange={e => { setQ(e.target.value); setPage(1); }}
                placeholder="🔍 ค้นหารายการ / #แท็ก..."
                className="w-full pr-3 py-1.5 pl-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {q && (
                <button
                  onClick={() => setQ('')}
                  className="absolute right-2 top-1.5 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Custom Date Range Controls (If selected) */}
          {datePreset === 'custom' && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-5 grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-slate-400 font-medium mb-1">วันที่เริ่มต้น:</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={e => { setCustomStart(e.target.value); setPage(1); }}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">วันที่สิ้นสุด:</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={e => { setCustomEnd(e.target.value); setPage(1); }}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Sort By Controls */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-5 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <ArrowsUpDownIcon className="w-3.5 h-3.5 text-amber-400" />
                เรียงลำดับตาม:
              </span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="newest">วันที่ล่าสุด (Newest)</option>
                <option value="oldest">วันที่เก่าสุด (Oldest)</option>
                <option value="amount_desc">จำนวนเงินมาก ➡️ น้อย</option>
                <option value="amount_asc">จำนวนเงินน้อย ➡️ มาก</option>
                <option value="title_az">ชื่อ ก ➡️ ฮ</option>
              </select>
            </div>

            {/* Filtered Aggregation Live Totals */}
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="text-emerald-400">รายรับ: +฿{filteredIncome.toLocaleString()}</span>
              <span className="text-rose-400">รายจ่าย: -฿{filteredExpense.toLocaleString()}</span>
              <span className={filteredNet >= 0 ? 'text-indigo-400 font-bold' : 'text-amber-400 font-bold'}>
                สุทธิ: ฿{filteredNet.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="space-y-3 py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-12 w-full rounded-xl"></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState 
          title="ไม่พบรายการที่ตรงกับเงื่อนไข"
          subtitle="ลองเปลี่ยนคำค้นหา หรือกดปุ่ม 'ล้างฟิลเตอร์' ด้านบนเพื่อดูรายการทั้งหมด"
          actionLabel={hasActiveFilters ? "🔄 ล้างฟิลเตอร์ทั้งหมด" : null}
          onAction={hasActiveFilters ? resetAllFilters : null}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <th className="pb-3 pl-3 w-10 text-center">
                  <button
                    onClick={toggleSelectAll}
                    title="เลือกทั้งหมดในหน้านี้"
                    className="p-1 text-slate-400 hover:text-indigo-400 transition-colors"
                  >
                    {selectedIds.length > 0 && selectedIds.length === pageData.length ? (
                      <CheckCircleIcon className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded border border-slate-600 inline-block" />
                    )}
                  </button>
                </th>
                <th className="pb-3 pl-2">รายการ / คำอธิบาย</th>
                <th className="pb-3">หมวดหมู่ & ช่องทาง</th>
                <th className="pb-3">วันที่</th>
                <th className="pb-3 text-right">จำนวนเงิน</th>
                <th className="pb-3 text-center pr-2">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {pageData.map((r) => {
                const isIncome = r.type === 'income'
                const isSelected = selectedIds.includes(r._id)
                const formattedDate = new Date(r.date).toLocaleDateString('th-TH', {
                  day: 'numeric',
                  month: 'short',
                  year: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })

                const payMap = {
                  cash: '💵 เงินสด',
                  bank: '🏦 โอนเงิน',
                  credit: '💳 บัตรเครดิต',
                  wallet: '📱 E-Wallet'
                }
                const payLabel = payMap[r.paymentMethod] || '💵 เงินสด'

                return (
                  <tr 
                    key={r._id} 
                    className={`hover:bg-slate-800/40 transition-colors group ${
                      isSelected ? 'bg-indigo-950/20' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 pl-3 text-center">
                      <button
                        onClick={() => toggleSelectOne(r._id)}
                        className="p-1 text-slate-400 hover:text-indigo-400 transition-colors"
                      >
                        {isSelected ? (
                          <CheckCircleIcon className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded border border-slate-600 inline-block" />
                        )}
                      </button>
                    </td>

                    {/* Title */}
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isIncome 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {isIncome ? <ArrowUpRightIcon className="w-5 h-5" /> : <ArrowDownRightIcon className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200 group-hover:text-white transition-colors flex items-center gap-2">
                            <span>{r.description}</span>
                            {r.receiptUrl && (
                              <button
                                onClick={() => setActiveSlipUrl(r.receiptUrl)}
                                className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 hover:scale-105 transition-transform"
                                title="คลิกเพื่อดูรูปสลิป"
                              >
                                📸 สลิป
                              </button>
                            )}
                          </div>
                          {Array.isArray(r.tags) && r.tags.length > 0 && (
                            <div className="flex items-center gap-1 mt-0.5">
                              {r.tags.map(t => (
                                <span key={t} className="text-[10px] text-indigo-400 font-mono bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category & Payment Method */}
                    <td className="py-3.5">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
                          <TagIcon className="w-3.5 h-3.5 text-slate-400" />
                          {r.category}
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold px-2 py-0.2 rounded bg-slate-900 border border-slate-800">
                          {payLabel}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 text-xs text-slate-400 font-mono">
                      {formattedDate}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 text-right font-bold text-base">
                      <span className={isIncome ? 'text-emerald-400' : 'text-rose-400'}>
                        {isIncome ? '+' : '-'}฿{Number(r.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 text-center pr-2">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onEditRecord?.(r)}
                          title="แก้ไขรายการ"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(r._id, r.description)}
                          disabled={deletingId === r._id}
                          title="ลบรายการ"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls or View All Link */}
      {filtered.length > 0 && (
        limit ? (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <span>แสดง {Math.min(limit, filtered.length)} รายการล่าสุดจากทั้งหมด {filtered.length} รายการ</span>
            {onViewAll && (
              <button
                onClick={() => onViewAll()}
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 hover:underline transition-all"
              >
                <span>ดูประวัติทั้งหมด ({filtered.length}) →</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
            <div>
              แสดง {((page - 1) * perPage) + 1} ถึง {Math.min(page * perPage, filtered.length)} จากทั้งหมด {filtered.length} รายการ
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              >
                ย้อนกลับ
              </button>
              <span className="px-2 font-medium text-slate-200">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )
      )}
      {/* Slip Image Viewer Modal */}
      {activeSlipUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setActiveSlipUrl(null)}>
          <div className="relative glass p-4 rounded-2xl border border-slate-700 max-w-md w-full text-center" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-slate-200">📸 สลิปโอนเงิน / ใบเสร็จ</span>
              <button onClick={() => setActiveSlipUrl(null)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>
            <img src={activeSlipUrl} alt="Slip Full" className="max-h-[70vh] mx-auto object-contain rounded-xl border border-slate-800" />
            <button
              onClick={() => setActiveSlipUrl(null)}
              className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
