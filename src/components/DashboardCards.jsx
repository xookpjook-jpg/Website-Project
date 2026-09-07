import React, { useState, useEffect } from 'react'
import CountUp from 'react-countup'
import { ArrowUpCircleIcon, ArrowDownCircleIcon, BanknotesIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { fetchRecords } from '../lib/api'

export default function DashboardCards() {
  const [stats, setStats] = useState({
    income: 0,
    expense: 0,
    balance: 0,
    count: 0
  })

  const loadStats = async () => {
    try {
      const records = await fetchRecords()
      const income = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0)
      const expense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
      setStats({
        income,
        expense,
        balance: income - expense,
        count: records.length
      })
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadStats()
    const onUpdate = () => loadStats()
    window.addEventListener('recordsUpdated', onUpdate)
    return () => window.removeEventListener('recordsUpdated', onUpdate)
  }, [])

  const cardItems = [
    {
      title: 'รายรับรวม',
      isCurrency: true,
      val: stats.income,
      badge: 'รายได้เข้า',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: ArrowUpCircleIcon,
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    },
    {
      title: 'รายจ่ายรวม',
      isCurrency: true,
      val: stats.expense,
      badge: 'ค่าใช้จ่าย',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      icon: ArrowDownCircleIcon,
      iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600',
    },
    {
      title: 'ยอดคงเหลือสุทธิ',
      isCurrency: true,
      val: stats.balance,
      badge: stats.balance >= 0 ? 'งบเป็นบวก' : 'งบติดลบ',
      badgeColor: stats.balance >= 0 ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: BanknotesIcon,
      iconBg: stats.balance >= 0 ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-amber-500 to-orange-600',
    },
    {
      title: 'จำนวนรายการทั้งหมด',
      isCurrency: false,
      val: stats.count,
      badge: 'อัปเดตเรียลไทม์',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      icon: DocumentTextIcon,
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cardItems.map((it, idx) => {
        const Icon = it.icon
        return (
          <div 
            key={idx} 
            className="glass card-shadow p-5 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md border mb-2 ${it.badgeColor}`}>
                  {it.badge}
                </span>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{it.title}</h3>
                <div className="mt-1 text-2xl font-extrabold tracking-tight text-slate-100">
                  {it.isCurrency ? (
                    <CountUp end={it.val} prefix="฿" duration={1.0} separator="," decimals={2} />
                  ) : (
                    <CountUp end={it.val} suffix=" รายการ" duration={1.0} separator="," decimals={0} />
                  )}
                </div>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg ${it.iconBg}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}


