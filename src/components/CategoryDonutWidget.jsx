import React, { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { fetchRecords } from '../lib/api'
import { ChartPieIcon } from '@heroicons/react/24/outline'

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f43f5e', '#64748b']

export default function CategoryDonutWidget() {
  const [data, setData] = useState([])
  const [totalExpense, setTotalExpense] = useState(0)

  const loadData = () => {
    fetchRecords().then(records => {
      const expenses = records.filter(r => r.type === 'expense')
      const catMap = {}
      let total = 0

      expenses.forEach(r => {
        const cat = r.category || 'ทั่วไป'
        const amt = Number(r.amount) || 0
        catMap[cat] = (catMap[cat] || 0) + amt
        total += amt
      })

      setTotalExpense(total)

      const formatted = Object.keys(catMap).map(cat => ({
        name: cat,
        value: catMap[cat],
        pct: total > 0 ? Math.round((catMap[cat] / total) * 100) : 0
      })).sort((a, b) => b.value - a.value)

      setData(formatted)
    }).catch(() => {})
  }

  useEffect(() => {
    loadData()
    const onUpdate = () => loadData()
    window.addEventListener('recordsUpdated', onUpdate)
    return () => window.removeEventListener('recordsUpdated', onUpdate)
  }, [])

  return (
    <div className="glass card-shadow p-5 rounded-2xl border border-slate-700/50">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 truncate">
          <ChartPieIcon className="w-5 h-5 text-indigo-400 shrink-0" />
          <span>📊 สัดส่วนรายจ่ายแยกตามหมวดหมู่</span>
        </h3>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400">ยังไม่มีข้อมูลรายจ่ายในขณะนี้</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {/* Donut Chart */}
          <div className="h-52 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `฿${Number(value).toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">รายจ่ายรวม</span>
              <span className="text-sm font-extrabold text-slate-100">฿{totalExpense.toLocaleString()}</span>
            </div>
          </div>

          {/* Category List Breakdown */}
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1 text-xs scrollbar-thin scrollbar-thumb-slate-800">
            {data.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-slate-300 font-medium truncate">{item.name}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-slate-100">฿{item.value.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 ml-1 font-semibold">({item.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
