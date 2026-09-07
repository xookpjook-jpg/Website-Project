import React, { useState, useEffect } from 'react'
import { HomeIcon, ListBulletIcon, ChartBarIcon, FlagIcon, Cog6ToothIcon, SparklesIcon, CalendarDaysIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { fetchRecords } from '../lib/api'

const menus = [
  { key: 'dashboard', label: 'หน้าแรก / ภาพรวม', icon: HomeIcon },
  { key: 'transactions', label: 'ประวัติรายการ', icon: ListBulletIcon, showBadge: true },
  { key: 'calendar', label: 'ปฏิทินรายรับ-รายจ่าย', icon: CalendarDaysIcon },
  { key: 'recurring', label: 'รายการประจำ (1-Click)', icon: ArrowPathIcon },
  { key: 'reports', label: 'สถิติ & กราฟรายงาน', icon: ChartBarIcon },
  { key: 'budget', label: 'งบประมาณ & เป้าหมาย', icon: FlagIcon },
  { key: 'settings', label: 'ตั้งค่าระบบ & สำรอง', icon: Cog6ToothIcon }
]

export default function Sidebar({ active = 'dashboard', onNavigate }) {
  const [recordCount, setRecordCount] = useState(0)

  useEffect(() => {
    const loadCount = () => {
      fetchRecords().then(r => setRecordCount(r.length)).catch(() => setRecordCount(0))
    }
    loadCount()
    window.addEventListener('recordsUpdated', loadCount)
    return () => window.removeEventListener('recordsUpdated', loadCount)
  }, [])

  return (
    <aside className="w-64 shrink-0 hidden md:block sticky top-24 self-start">
      <div className="glass p-5 rounded-2xl border border-slate-700/50 card-shadow space-y-5">
        <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">เมนูหลัก</div>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
        </div>

        <nav className="space-y-1.5">
          {menus.map(m => {
            const Icon = m.icon
            const isActive = m.key === active
            return (
              <button
                key={m.key}
                onClick={() => onNavigate?.(m.key)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate text-left">{m.label}</span>
                </div>
                {m.showBadge && recordCount > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-400'
                  }`}>
                    {recordCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
