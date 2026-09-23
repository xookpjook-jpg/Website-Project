import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardCards from './components/DashboardCards'
import AreaCharts from './components/AreaCharts'
import Summary from './components/Summary'
import QuickActions from './components/QuickActions'
import QuickTemplates from './components/QuickTemplates'
import TransactionsTable from './components/TransactionsTable'
import DonutStats from './components/DonutStats'
import BudgetProgress from './components/BudgetProgress'
import Notifications from './components/Notifications'
import MiniCalendar from './components/MiniCalendar'
import Sidebar from './components/Sidebar'
import FAB from './components/FAB'
import { ToastProvider } from './components/Toast'
import AddModal from './components/AddModal'
import FinancialBackgroundFlow from './components/FinancialBackgroundFlow'
import FinancialInsightCard from './components/FinancialInsightCard'
import FinancialHealthScoreCard from './components/FinancialHealthScoreCard'
import FinancialRunwayWidget from './components/FinancialRunwayWidget'
import RecurringManager from './components/RecurringManager'
import MonthlyCalendarView from './components/MonthlyCalendarView'
import MonthComparison from './components/MonthComparison'
import Header from './components/Header'
import WalletBalances from './components/WalletBalances'
import SettingsView from './components/SettingsView'
import SavingsGoals from './components/SavingsGoals'
import CategoryDonutWidget from './components/CategoryDonutWidget'
import NotificationScheduler from './components/NotificationScheduler'
import { SparklesIcon, MoonIcon, SunIcon, HomeIcon, ListBulletIcon, ChartBarIcon, FlagIcon, Cog6ToothIcon, CalendarDaysIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function App() {
  const [active, setActive] = useState('dashboard')
  const [dark, setDark] = useState(true)
  const [accent, setAccent] = useState(() => localStorage.getItem('wealthflow_accent') || 'indigo')
  const [enableBgFlow, setEnableBgFlow] = useState(() => {
    try {
      const appState = JSON.parse(localStorage.getItem('wealthflow_appearance') || '{}')
      return appState.enableBgFlow !== false
    } catch (e) {
      return true
    }
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [defaultModalType, setDefaultModalType] = useState('income')
  const [recordToEdit, setRecordToEdit] = useState(null)

  useEffect(() => {
    localStorage.setItem('wealthflow_accent', accent)
  }, [accent])

  useEffect(() => {
    const handleAppearanceUpdate = (e) => {
      if (e.detail) {
        if (e.detail.accent) setAccent(e.detail.accent)
        if (e.detail.enableBgFlow !== undefined) setEnableBgFlow(e.detail.enableBgFlow)
        if (e.detail.theme) setDark(e.detail.theme !== 'light')
      }
    }
    window.addEventListener('appearanceUpdated', handleAppearanceUpdate)
    return () => window.removeEventListener('appearanceUpdated', handleAppearanceUpdate)
  }, [])

  useEffect(() => {
    const handleOpenModal = (e) => {
      const type = e.detail?.type || 'income'
      setDefaultModalType(type)
      setRecordToEdit(null)
      setShowAddModal(true)
    }
    window.addEventListener('openAddModal', handleOpenModal)
    return () => window.removeEventListener('openAddModal', handleOpenModal)
  }, [])

  const handleOpenAdd = (type = 'income') => {
    setDefaultModalType(type)
    setRecordToEdit(null)
    setShowAddModal(true)
  }

  const handleEditRecord = (record) => {
    setRecordToEdit(record)
    setShowAddModal(true)
  }

  return (
    <ToastProvider>
      <NotificationScheduler />
      <div className={`relative min-h-screen p-4 sm:p-6 transition-colors duration-300 ${dark ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        {/* Background Financial Light Streams */}
        {enableBgFlow && <FinancialBackgroundFlow />}

        <div className="relative z-10 max-w-7xl mx-auto flex gap-6">
          {/* Desktop Sidebar Navigation */}
          <Sidebar active={active} onNavigate={setActive} />

          <main className="flex-1 min-w-0">
            {/* Top Header Navbar Component */}
            <Header 
              dark={dark} 
              setDark={setDark} 
              accent={accent} 
              setAccent={setAccent} 
              onNavigate={setActive} 
            />

            {/* Mobile Navigation Bar */}
            <div className="flex md:hidden overflow-x-auto gap-2 p-1.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs mb-6">
              {[
                { key: 'dashboard', label: 'ภาพรวม', icon: HomeIcon },
                { key: 'transactions', label: 'รายการ', icon: ListBulletIcon },
                { key: 'calendar', label: 'ปฏิทิน', icon: CalendarDaysIcon },
                { key: 'recurring', label: 'ประจำ', icon: ArrowPathIcon },
                { key: 'reports', label: 'รายงาน', icon: ChartBarIcon },
                { key: 'budget', label: 'งบประมาณ', icon: FlagIcon },
                { key: 'settings', label: 'ตั้งค่า', icon: Cog6ToothIcon }
              ].map(m => {
                const Icon = m.icon
                const isActive = active === m.key
                return (
                  <button
                    key={m.key}
                    onClick={() => setActive(m.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium whitespace-nowrap ${
                      isActive ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{m.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Animated Page Transitions */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* 1. Dashboard View (Minimal & Clean Overview) */}
                {active === 'dashboard' && (
                  <div className="space-y-6">
                    <Summary />
                    <WalletBalances />
                    <SavingsGoals />
                    <QuickTemplates />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                      <div className="lg:col-span-2">
                        <AreaCharts />
                      </div>
                      <div>
                        <CategoryDonutWidget />
                      </div>
                    </div>
                    <TransactionsTable onEditRecord={handleEditRecord} limit={5} onViewAll={() => setActive('transactions')} />
                  </div>
                )}

                {/* 2. Full Transactions View */}
                {active === 'transactions' && (
                  <div className="space-y-6">
                    <QuickTemplates />
                    <QuickActions onOpenAddModal={handleOpenAdd} />
                    <TransactionsTable onEditRecord={handleEditRecord} />
                  </div>
                )}

                {/* 3. Monthly Calendar View */}
                {active === 'calendar' && (
                  <div className="space-y-6">
                    <MonthlyCalendarView />
                    <TransactionsTable onEditRecord={handleEditRecord} limit={5} onViewAll={() => setActive('transactions')} />
                  </div>
                )}

                {/* 4. Recurring Items View */}
                {active === 'recurring' && (
                  <div className="space-y-6">
                    <RecurringManager />
                    <TransactionsTable onEditRecord={handleEditRecord} limit={5} onViewAll={() => setActive('transactions')} />
                  </div>
                )}

                {/* 5. Reports & Analytics View */}
                {active === 'reports' && (
                  <div className="space-y-6">
                    <Summary />
                    <MonthComparison />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <FinancialInsightCard />
                      <FinancialRunwayWidget />
                    </div>
                    <AreaCharts />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <DonutStats />
                      <FinancialHealthScoreCard />
                    </div>
                  </div>
                )}

                {/* 6. Budget & Goals View */}
                {active === 'budget' && (
                  <div className="space-y-6">
                    <BudgetProgress />
                    <SavingsGoals />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <FinancialRunwayWidget />
                      <FinancialHealthScoreCard />
                    </div>
                    <QuickTemplates />
                  </div>
                )}

                {/* 7. Settings View */}
                {active === 'settings' && (
                  <SettingsView />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Floating Action Button */}
        <FAB onClick={() => handleOpenAdd('income')} />

        {/* Add / Edit Transaction Modal */}
        {showAddModal && (
          <AddModal 
            onClose={() => { setShowAddModal(false); setRecordToEdit(null); }} 
            recordToEdit={recordToEdit}
            defaultType={defaultModalType}
          />
        )}
      </div>
    </ToastProvider>
  )
}
