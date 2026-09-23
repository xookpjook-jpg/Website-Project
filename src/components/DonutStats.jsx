import React, { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { fetchRecords } from '../lib/api'

const COLORS = ['#10B981', '#F43F5E', '#6366F1', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6']

export default function DonutStats() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    setLoading(true)
    fetchRecords().then(records => {
      // Group expenses by category
      const expenseMap = {}
      records.forEach(r => {
        if (r.type === 'expense') {
          const cat = r.category || 'ทั่วไป'
          expenseMap[cat] = (expenseMap[cat] || 0) + r.amount
        }
      })

      const chartData = Object.keys(expenseMap).map(cat => ({
        name: cat,
        value: Math.round(expenseMap[cat])
      })).sort((a, b) => b.value - a.value)

      if (chartData.length === 0) {
        const totalIncome = records.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
        const totalExpense = records.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
        setData([
          { name: 'รายรับ', value: Math.round(totalIncome) },
          { name: 'รายจ่าย', value: Math.round(totalExpense) }
        ])
      } else {
        setData(chartData)
      }
    }).catch(() => setData([]))
    .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
    const onUpdate = () => loadData()
    window.addEventListener('recordsUpdated', onUpdate)
    return () => window.removeEventListener('recordsUpdated', onUpdate)
  }, [])

  return (
    <div className="glass card-shadow p-5 rounded-2xl border border-slate-700/50">
      <h3 className="text-base font-bold text-slate-100 mb-1 flex items-center justify-between">
        <span>🍩 สัดส่วนรายจ่ายตามหมวดหมู่</span>
      </h3>
      <p className="text-xs text-slate-400 mb-4">แสดงสัดส่วนการใช้จ่ายแยกรายประเภท</p>

      {loading ? (
        <div className="skeleton h-52 w-full rounded-xl"></div>
      ) : data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-xs text-slate-500">
          ยังไม่มีข้อมูลสถิติ
        </div>
      ) : (
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
                }}
                formatter={(value) => [`฿${Number(value).toLocaleString()}`, 'จำนวน']}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

