import React, { useState, useEffect } from 'react'
import CountUp from 'react-countup'
import { fetchRecords } from '../lib/api'
import { 
  BanknotesIcon, 
  BuildingLibraryIcon, 
  CreditCardIcon, 
  DevicePhoneMobileIcon,
  PencilSquareIcon,
  CheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

const DEFAULT_WALLETS = {
  cash: 5000,
  bank: 35000,
  credit: -2500,
  wallet: 1500
}

export default function WalletBalances() {
  const [wallets, setWallets] = useState(() => {
    const saved = localStorage.getItem('wealthflow_wallet_balances')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) {}
    }
    return DEFAULT_WALLETS
  })

  const [recordsNet, setRecordsNet] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ ...wallets })

  useEffect(() => {
    localStorage.setItem('wealthflow_wallet_balances', JSON.stringify(wallets))
  }, [wallets])

  useEffect(() => {
    const loadNet = () => {
      fetchRecords().then(recs => {
        const inc = recs.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
        const exp = recs.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
        setRecordsNet(inc - exp)
      }).catch(() => {})
    }
    loadNet()
    window.addEventListener('recordsUpdated', loadNet)
    return () => window.removeEventListener('recordsUpdated', loadNet)
  }, [])

  const initialTotal = (Number(wallets.cash) || 0) + (Number(wallets.bank) || 0) + (Number(wallets.credit) || 0) + (Number(wallets.wallet) || 0)
  const netWorth = initialTotal + recordsNet

  const handleSaveEdit = (e) => {
    e.preventDefault()
    setWallets({
      cash: Number(editForm.cash) || 0,
      bank: Number(editForm.bank) || 0,
      credit: Number(editForm.credit) || 0,
      wallet: Number(editForm.wallet) || 0
    })
    setIsEditing(false)
  }

  const items = [
    { key: 'cash', label: 'เงินสด (Cash)', val: wallets.cash, icon: BanknotesIcon, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { key: 'bank', label: 'บัญชีธนาคาร (Bank)', val: wallets.bank, icon: BuildingLibraryIcon, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { key: 'credit', label: 'บัตรเครดิต (Credit)', val: wallets.credit, icon: CreditCardIcon, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
    { key: 'wallet', label: 'E-Wallet / สแกน', val: wallets.wallet, icon: DevicePhoneMobileIcon, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' }
  ]

  return (
    <div className="glass card-shadow p-5 rounded-2xl border border-slate-700/50 mb-6 bg-gradient-to-br from-[#111827] via-[#152037] to-[#111827]">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
            <SparklesIcon className="w-4.5 h-4.5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 truncate">💼 กระเป๋าเงิน & ความมั่งคั่งสุทธิ (Net Worth)</h3>
          </div>
        </div>

        <button
          onClick={() => { setEditForm({ ...wallets }); setIsEditing(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-bold border border-indigo-500/30 transition-all hover:scale-105 shrink-0"
        >
          <PencilSquareIcon className="w-3.5 h-3.5" />
          <span>ตั้งค่ายอดจริง</span>
        </button>
      </div>

      {/* Net Worth Highlight Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900/80 border border-indigo-500/30 flex items-center justify-between gap-4 mb-4">
        <div>
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">ความมั่งคั่งสุทธิรวม (Total Net Worth)</div>
          <div className={`text-2xl font-black mt-1 ${netWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            <CountUp end={netWorth} prefix="฿" duration={1.0} separator="," decimals={2} />
          </div>
        </div>
        <div className="text-right text-[11px] text-slate-400 hidden sm:block">
          <div>เงินตั้งต้น: <span className="font-semibold text-slate-200">฿{initialTotal.toLocaleString()}</span></div>
          <div>กำไรสะสม: <span className={`font-semibold ${recordsNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>฿{recordsNet.toLocaleString()}</span></div>
        </div>
      </div>

      {/* 4 Wallet Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {items.map(item => {
          const Icon = item.icon
          return (
            <div key={item.key} className={`p-3 rounded-xl border ${item.bg}`}>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="text-base font-extrabold text-slate-100 truncate">
                ฿{Number(item.val).toLocaleString()}
              </div>
            </div>
          )
        })}
      </div>

      {/* EDIT BALANCES MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass p-6 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                ⚙️ ตั้งค่ายอดเงินเริ่มต้นในชีวิตจริง
              </h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">💵 เงินสดติดตัว (Cash)</label>
                <input
                  type="number"
                  value={editForm.cash}
                  onChange={e => setEditForm({ ...editForm, cash: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">🏦 บัญชีเงินฝากธนาคาร (Bank)</label>
                <input
                  type="number"
                  value={editForm.bank}
                  onChange={e => setEditForm({ ...editForm, bank: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">💳 ยอดค้างชำระบัตรเครดิต (Credit Card - ใส่ค่าติดลบได้)</label>
                <input
                  type="number"
                  value={editForm.credit}
                  onChange={e => setEditForm({ ...editForm, credit: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">📱 TrueMoney / E-Wallet</label>
                <input
                  type="number"
                  value={editForm.wallet}
                  onChange={e => setEditForm({ ...editForm, wallet: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1 shadow-lg shadow-indigo-600/30"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>บันทึกยอดเงินจริง</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
