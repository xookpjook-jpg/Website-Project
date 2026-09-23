import React, { useState, useEffect } from 'react'
import { fetchRecords } from '../lib/api'
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'

export default function MonthlyCalendarView() {
  const [records, setRecords] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)

  const loadData = () => {
    fetchRecords().then(setRecords).catch(() => setRecords([]))
  }

  useEffect(() => {
    loadData()
    const onUpdate = () => loadData()
    window.addEventListener('recordsUpdated', onUpdate)
    return () => window.removeEventListener('recordsUpdated', onUpdate)
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const startingDayOfWeek = firstDay.getDay()
  const totalDays = lastDay.getDate()

  const daysArray = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    daysArray.push(null)
  }
  for (let d = 1; d <= totalDays; d++) {
    daysArray.push(d)
  }

  // Calculate daily totals map: "YYYY-MM-DD" -> { income, expense, items }
  const dailyData = {}
  records.forEach(r => {
    const dStr = r.dateKey || (r.date ? new Date(r.date).toISOString().slice(0, 10) : '')
    if (!dStr) return
    if (!dailyData[dStr]) dailyData[dStr] = { income: 0, expense: 0, items: [] }

    if (r.type === 'income') dailyData[dStr].income += r.amount
    else dailyData[dStr].expense += r.amount

    dailyData[dStr].items.push(r)
  })

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
  const monthTitle = `${monthNames[month]} ${year + 543}`

  return (
    <div className="glass card-shadow p-5 rounded-2xl border border-slate-700/50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            📅 ปฏิทินสรุปรายรับ-รายจ่ายรายวัน (Calendar Matrix)
          </h3>
          <p className="text-xs text-slate-400">ภาพรวมการเงินจำแนกตามวันในแต่ละเดือน</p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button onClick={prevMonth} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <span className="font-bold text-sm text-indigo-300 min-w-[120px] text-center font-mono">{monthTitle}</span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-slate-400 mb-2">
        {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(d => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Grid Days */}
      <div className="grid grid-cols-7 gap-1.5">
        {daysArray.map((dayNum, idx) => {
          if (dayNum === null) {
            return <div key={`empty-${idx}`} className="h-16 bg-slate-950/30 rounded-xl border border-slate-900/50 opacity-20" />
          }

          const dateKeyStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
          const info = dailyData[dateKeyStr]
          const hasData = info && (info.income > 0 || info.expense > 0)
          const isToday = new Date().toISOString().slice(0, 10) === dateKeyStr

          return (
            <button
              key={dateKeyStr}
              onClick={() => hasData && setSelectedDay({ dateKeyStr, info })}
              className={`h-16 p-1 rounded-xl border text-left flex flex-col justify-between transition-all ${
                isToday
                  ? 'border-indigo-500 bg-indigo-950/30 shadow-md'
                  : (hasData ? 'border-slate-800 bg-slate-900/80 hover:border-slate-700 cursor-pointer' : 'border-slate-900/60 bg-slate-950/40 text-slate-600')
              }`}
            >
              <div className="flex justify-between items-center text-[11px]">
                <span className={`font-bold font-mono px-1 rounded ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}>
                  {dayNum}
                </span>
              </div>

              {hasData ? (
                <div className="text-[10px] font-mono leading-tight space-y-0.5">
                  {info.income > 0 && (
                    <div className="text-emerald-400 font-semibold truncate">+฿{Math.round(info.income).toLocaleString()}</div>
                  )}
                  {info.expense > 0 && (
                    <div className="text-rose-400 font-semibold truncate">-฿{Math.round(info.expense).toLocaleString()}</div>
                  )}
                </div>
              ) : (
                <div className="text-[9px] text-slate-700 text-center pb-1">-</div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected Day Details Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass p-5 rounded-2xl border border-slate-700 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h4 className="font-bold text-slate-100 flex items-center gap-1.5 text-sm">
                <CalendarDaysIcon className="w-4 h-4 text-indigo-400" />
                รายการประจำวันที่ {selectedDay.dateKeyStr}
              </h4>
              <button onClick={() => setSelectedDay(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
              {selectedDay.info.items.map(item => (
                <div key={item._id} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-200">{item.description}</div>
                    <div className="text-[10px] text-slate-500">{item.category}</div>
                  </div>
                  <div className={`font-mono font-bold ${item.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.type === 'income' ? '+' : '-'}฿{item.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="w-full mt-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
