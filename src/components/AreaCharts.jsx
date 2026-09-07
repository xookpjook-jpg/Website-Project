import React, { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { fetchRecords } from '../lib/api'

function buildDateRange(startDate, endDate) {
  const arr = []
  const cur = new Date(startDate)
  while (cur <= endDate) {
    arr.push(cur.toISOString().slice(0, 10))
    cur.setDate(cur.getDate() + 1)
  }
  return arr
}

function aggregateRange(records, startDate, endDate) {
  const keys = buildDateRange(startDate, endDate)
  const map = {}
  keys.forEach((k) => {
    map[k] = { day: k, label: k.slice(5), income: 0, expense: 0 }
  })

  records.forEach((r) => {
    const k = r.dateKey || (r.date ? new Date(r.date).toISOString().slice(0, 10) : '')
    if (map[k]) {
      if (r.type === 'expense') {
        map[k].expense += Number(r.amount || 0)
      } else {
        map[k].income += Number(r.amount || 0)
      }
    }
  })

  return Object.values(map).sort((a, b) => a.day.localeCompare(b.day))
}

export default function AreaCharts() {
  const [filter, setFilter] = useState('7d')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    setLoading(true)
    fetchRecords()
      .then((records) => {
        const now = new Date()
        let start = new Date()
        if (filter === '7d') {
          start = new Date(now)
          start.setDate(now.getDate() - 6)
        } else if (filter === '30d') {
          start = new Date(now)
          start.setDate(now.getDate() - 29)
        } else if (filter === 'month') {
          start = new Date(now.getFullYear(), now.getMonth(), 1)
        }

        const agg = aggregateRange(records, start, now)
        setData(agg)
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
    const onUpdate = () => loadData()
    window.addEventListener('recordsUpdated', onUpdate)
    return () => window.removeEventListener('recordsUpdated', onUpdate)
  }, [filter])

  const totalIncome = data.reduce((s, d) => s + d.income, 0)
  const totalExpense = data.reduce((s, d) => s + d.expense, 0)

  return (
    <div className="glass card-shadow p-5 rounded-2xl border border-slate-700/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 truncate">
            📈 แนวโน้มการรับ-จ่ายเงิน
          </h3>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilter('7d')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === '7d' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            7 วันย้อนหลัง
          </button>
          <button
            onClick={() => setFilter('30d')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === '30d' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            30 วัน
          </button>
          <button
            onClick={() => setFilter('month')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'month' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            เดือนนี้
          </button>
        </div>
      </div>

      {loading ? (
        <div className="skeleton h-64 w-full rounded-xl"></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          <div className="lg:col-span-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart key={`${filter}-${data.length}`} data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={v => `฿${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                  formatter={(val, name) => [`฿${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, name === 'income' ? 'รายรับ' : 'รายจ่าย']}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10B981" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#incomeGrad)" 
                  name="income"
                  isAnimationActive={true}
                  animationDuration={1400}
                  animationEasing="ease-out"
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#F43F5E" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#expenseGrad)" 
                  name="expense"
                  isAnimationActive={true}
                  animationDuration={1400}
                  animationEasing="ease-out"
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
            <div>
              <div className="text-slate-400 font-medium">รวมรายรับช่วงนี้</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">฿{totalIncome.toLocaleString()}</div>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <div className="text-slate-400 font-medium">รวมรายจ่ายช่วงนี้</div>
              <div className="text-lg font-bold text-rose-400 mt-0.5">฿{totalExpense.toLocaleString()}</div>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <div className="text-slate-400 font-medium">ส่วนต่าง (Net)</div>
              <div className={`text-lg font-bold mt-0.5 ${totalIncome - totalExpense >= 0 ? 'text-indigo-400' : 'text-amber-400'}`}>
                ฿{(totalIncome - totalExpense).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

