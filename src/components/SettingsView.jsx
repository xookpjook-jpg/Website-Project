import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchRecords, createRecord, deleteRecord } from '../lib/api'
import { useToast } from './Toast'
import { triggerDailyReminder, playNotificationChime } from './NotificationScheduler'
import { 
  UserCircleIcon,
  PaintBrushIcon,
  AdjustmentsHorizontalIcon,
  WalletIcon,
  BellIcon,
  CircleStackIcon,
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  SparklesIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  ArrowPathIcon,
  ClockIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

const DEFAULT_PROFILE = {
  name: 'ธนดล มั่งคั่ง',
  email: 'user@wealthflow.pro',
  avatarEmoji: '💎',
  payday: 25,
  currency: 'THB',
  currencySymbol: '฿'
}

const DEFAULT_APPEARANCE = {
  theme: 'dark',
  accent: 'indigo',
  enableBgFlow: true,
  privacyMode: false,
  compactView: false,
  decimalPlaces: 2
}

const DEFAULT_TARGETS = {
  monthlyExpenseLimit: 30000,
  monthlySavingsGoal: 20000,
  monthlyIncomeGoal: 60000,
  warningThreshold: 80,
  categoryBudgets: {
    'อาหาร/เครื่องดื่ม': 8000,
    'การเดินทาง': 3000,
    'ช้อปปิ้ง': 3000,
    'บิล/สาธารณูปโภค': 5000,
    'ความบันเทิง': 2000,
    'ค่ารักษา/สุขภาพ': 2000
  }
}

const DEFAULT_WALLETS = {
  cash: 5000,
  bank: 35000,
  credit: -2500,
  wallet: 1500
}

const DEFAULT_NOTIFS = {
  dailyReminder: true,
  dailyReminderTime: '20:00',
  budgetWarning: true,
  recurringReminder: true,
  emailAlerts: false
}

const ACCENT_COLORS = [
  { id: 'indigo', label: 'Indigo (น้ำเงินคราม)', bg: 'bg-indigo-600', ring: 'ring-indigo-500' },
  { id: 'violet', label: 'Violet (ม่วงอเมทิสต์)', bg: 'bg-violet-600', ring: 'ring-violet-500' },
  { id: 'emerald', label: 'Emerald (เขียวมรกต)', bg: 'bg-emerald-600', ring: 'ring-emerald-500' },
  { id: 'cyan', label: 'Cyan (ฟ้าสว่างนีออน)', bg: 'bg-cyan-600', ring: 'ring-cyan-500' },
  { id: 'amber', label: 'Amber (ทองอำพัน)', bg: 'bg-amber-600', ring: 'ring-amber-500' },
  { id: 'rose', label: 'Rose (ชมพูกุหลาบ)', bg: 'bg-rose-600', ring: 'ring-rose-500' }
]

const AVATAR_OPTIONS = ['💎', '👑', '🚀', '💼', '🦊', '🦁', '🌟', '🦄', '💰', '🎯']

export default function SettingsView() {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('profile')

  // 1. Profile State
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('wealthflow_user_profile')
    return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE
  })

  // 2. Appearance State
  const [appearance, setAppearance] = useState(() => {
    const saved = localStorage.getItem('wealthflow_appearance')
    const accent = localStorage.getItem('wealthflow_accent') || 'indigo'
    return saved ? { ...DEFAULT_APPEARANCE, ...JSON.parse(saved), accent } : { ...DEFAULT_APPEARANCE, accent }
  })

  // 3. Budgets & Targets State
  const [targets, setTargets] = useState(() => {
    const saved = localStorage.getItem('wealthflow_targets')
    return saved ? { ...DEFAULT_TARGETS, ...JSON.parse(saved) } : DEFAULT_TARGETS
  })

  // 4. Wallets State
  const [wallets, setWallets] = useState(() => {
    const saved = localStorage.getItem('wealthflow_wallet_balances')
    return saved ? { ...DEFAULT_WALLETS, ...JSON.parse(saved) } : DEFAULT_WALLETS
  })

  // 5. Notifications State
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('wealthflow_notifications')
    return saved ? { ...DEFAULT_NOTIFS, ...JSON.parse(saved) } : DEFAULT_NOTIFS
  })

  // Live Clock for scheduling display
  const [liveClock, setLiveClock] = useState(() => {
    const d = new Date()
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date()
      setLiveClock(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 6. Data Management States
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false)
  const [systemStats, setSystemStats] = useState({ totalRecords: 0, storageKb: 0 })

  // Load stats
  useEffect(() => {
    const calcStats = async () => {
      try {
        const records = await fetchRecords()
        let totalBytes = 0
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('wealthflow_')) {
            totalBytes += (localStorage.getItem(key) || '').length * 2
          }
        }
        setSystemStats({
          totalRecords: records.length,
          storageKb: (totalBytes / 1024).toFixed(2)
        })
      } catch (e) {}
    }
    calcStats()
  }, [])

  // Save Profile Handler
  const handleSaveProfile = (e) => {
    e.preventDefault()
    localStorage.setItem('wealthflow_user_profile', JSON.stringify(profile))
    window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: profile }))
    toast.push({ title: '👤 บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว!' })
  }

  // Save Appearance Handler
  const handleSaveAppearance = (updated) => {
    const next = { ...appearance, ...updated }
    setAppearance(next)
    localStorage.setItem('wealthflow_appearance', JSON.stringify(next))
    if (updated.accent) {
      localStorage.setItem('wealthflow_accent', updated.accent)
    }
    window.dispatchEvent(new CustomEvent('appearanceUpdated', { detail: next }))
    toast.push({ title: '🎨 อัปเดตการแสดงผล & ธีมเรียบร้อยแล้ว!' })
  }

  // Save Budgets Handler
  const handleSaveBudgets = (e) => {
    e.preventDefault()
    localStorage.setItem('wealthflow_targets', JSON.stringify(targets))
    window.dispatchEvent(new CustomEvent('recordsUpdated'))
    toast.push({ title: '🎯 บันทึกเป้าหมายและเพดานงบประมาณแล้ว!' })
  }

  // Save Wallets Handler
  const handleSaveWallets = (e) => {
    e.preventDefault()
    localStorage.setItem('wealthflow_wallet_balances', JSON.stringify(wallets))
    window.dispatchEvent(new CustomEvent('recordsUpdated'))
    toast.push({ title: '💼 อัปเดตยอดเงินในกระเป๋าเริ่มต้นเรียบร้อย!' })
  }

  // Save Notifications Handler
  const handleSaveNotifications = async (updated) => {
    const next = { ...notifications, ...updated }
    setNotifications(next)
    localStorage.setItem('wealthflow_notifications', JSON.stringify(next))

    // If changing reminder time or enabling, reset last fired key so it can fire immediately when reached
    if (updated.dailyReminderTime || updated.dailyReminder !== undefined) {
      localStorage.removeItem('wealthflow_last_reminder_fired')
    }

    if (updated.dailyReminder === true && 'Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }

    toast.push({ title: '🔔 บันทึกการตั้งค่าการแจ้งเตือนแล้ว!' })
  }

  // Set Reminder in Next 1 Minute for Quick User Testing
  const handleSetQuickTestTime = () => {
    const now = new Date(Date.now() + 60 * 1000)
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const quickTime = `${hh}:${mm}`
    handleSaveNotifications({ dailyReminder: true, dailyReminderTime: quickTime })
    toast.push({
      title: `⚡ ตั้งเวลาแจ้งเตือนที่ ${quickTime} น. (อีก 1 นาที)`,
      desc: 'ระบบจะส่งเสียงและแจ้งเตือนอัตโนมัติเมื่อถึงเวลานี้ทันที'
    })
  }

  // Trigger Real Web Browser Notification
  const handleTestNotification = async () => {
    if (!('Notification' in window)) {
      toast.push({ title: '⚠️ เบราว์เซอร์นี้ไม่รองรับ Web Notifications', type: 'error' })
      return
    }

    if (Notification.permission === 'granted') {
      new Notification('💰 WealthFlow Pro - ทดสอบการแจ้งเตือน', {
        body: 'การแจ้งเตือนทางการเงินของคุณทำงานได้สมบูรณ์แบบแล้ว!',
        icon: '/vite.svg'
      })
      toast.push({ title: '🔔 ส่งการแจ้งเตือนทดสอบเรียบร้อยแล้ว' })
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        new Notification('💰 WealthFlow Pro - ยินดีต้อนรับ', {
          body: 'เปิดใช้งานการแจ้งเตือนสำเร็จแล้ว!',
          icon: '/vite.svg'
        })
        toast.push({ title: '🎉 ได้รับสิทธิ์การแจ้งเตือนแล้ว!' })
      } else {
        toast.push({ title: '⚠️ คุณปฏิเสธสิทธิ์การแจ้งเตือน', type: 'error' })
      }
    } else {
      toast.push({ title: '⚠️ สิทธิ์การแจ้งเตือนถูกบล็อกในการตั้งค่าเบราว์เซอร์', type: 'error' })
    }
  }

  // Export Full JSON Backup
  const handleExportJSON = async () => {
    setIsExporting(true)
    try {
      const records = await fetchRecords()
      const savingsGoals = JSON.parse(localStorage.getItem('wealthflow_savings_goals') || '[]')
      const templates = JSON.parse(localStorage.getItem('wealthflow_quick_templates') || '[]')
      const recurring = JSON.parse(localStorage.getItem('wealthflow_recurring_items') || '[]')

      const backupData = {
        app: 'WealthFlow Pro',
        version: '4.0 Ultra',
        exportDate: new Date().toISOString(),
        profile,
        appearance,
        targets,
        wallets,
        notifications,
        savingsGoals,
        templates,
        recurring,
        records
      }

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', jsonString)
      downloadAnchor.setAttribute('download', `wealthflow_full_backup_${new Date().toISOString().slice(0, 10)}.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()

      toast.push({ title: '💾 สำรองข้อมูลระบบ JSON สำเร็จ 100%!' })
    } catch (e) {
      console.error(e)
      toast.push({ title: '❌ เกิดข้อผิดพลาดในการสำรองข้อมูล', type: 'error' })
    } finally {
      setIsExporting(false)
    }
  }

  // Export CSV for Excel (UTF-8 BOM Thai Compatible)
  const handleExportCSV = async () => {
    try {
      const records = await fetchRecords()
      if (!records.length) {
        toast.push({ title: '⚠️ ไม่มีรายการสำหรับส่งออก CSV', type: 'error' })
        return
      }

      let csv = '\uFEFF' // UTF-8 BOM so Excel displays Thai characters correctly
      csv += 'ลำดับ,วันที่,ประเภท,หมวดหมู่,รายละเอียด,จำนวนเงิน (บาท),ช่องทางชำระ,แท็ก\n'

      records.forEach((r, idx) => {
        const d = r.date ? new Date(r.date).toLocaleDateString('th-TH') : ''
        const typeLabel = r.type === 'income' ? 'รายรับ' : 'รายจ่าย'
        const desc = `"${(r.description || '').replace(/"/g, '""')}"`
        const cat = `"${(r.category || '').replace(/"/g, '""')}"`
        const amt = r.amount || 0
        const method = r.paymentMethod || 'cash'
        const tags = `"${(r.tags || []).join('; ')}"`
        csv += `${idx + 1},${d},${typeLabel},${cat},${desc},${amt},${method},${tags}\n`
      })

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wealthflow_transactions_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      toast.push({ title: '📊 ส่งออกไฟล์ CSV สำหรับ Excel เรียบร้อยแล้ว!' })
    } catch (e) {
      console.error(e)
      toast.push({ title: '❌ เกิดข้อผิดพลาดในการส่งออก CSV', type: 'error' })
    }
  }

  // Import JSON Backup Restore
  const handleImportJSON = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setIsImporting(true)

    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const data = JSON.parse(evt.target.result)
        if (data.records && Array.isArray(data.records)) {
          // Restore all settings
          if (data.profile) {
            setProfile(data.profile)
            localStorage.setItem('wealthflow_user_profile', JSON.stringify(data.profile))
            window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: data.profile }))
          }
          if (data.appearance) {
            setAppearance(data.appearance)
            localStorage.setItem('wealthflow_appearance', JSON.stringify(data.appearance))
          }
          if (data.targets) {
            setTargets(data.targets)
            localStorage.setItem('wealthflow_targets', JSON.stringify(data.targets))
          }
          if (data.wallets) {
            setWallets(data.wallets)
            localStorage.setItem('wealthflow_wallet_balances', JSON.stringify(data.wallets))
          }
          if (data.notifications) {
            setNotifications(data.notifications)
            localStorage.setItem('wealthflow_notifications', JSON.stringify(data.notifications))
          }
          if (data.savingsGoals) localStorage.setItem('wealthflow_savings_goals', JSON.stringify(data.savingsGoals))
          if (data.templates) localStorage.setItem('wealthflow_quick_templates', JSON.stringify(data.templates))
          if (data.recurring) localStorage.setItem('wealthflow_recurring_items', JSON.stringify(data.recurring))

          // Post records to server
          let imported = 0
          for (const r of data.records) {
            await createRecord(r).catch(() => {})
            imported++
          }

          toast.push({ title: `📥 กู้คืนข้อมูลสำเร็จ ${imported} รายการ และการตั้งค่าครบถ้วน!` })
          window.dispatchEvent(new CustomEvent('recordsUpdated'))
        } else {
          toast.push({ title: '⚠️ โครงสร้างไฟล์สำรองไม่ถูกต้อง', type: 'error' })
        }
      } catch (err) {
        console.error(err)
        toast.push({ title: '❌ อ่านไฟล์สำรอง JSON ไม่สำเร็จ', type: 'error' })
      } finally {
        setIsImporting(false)
        e.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  // Generate Realistic Thai Demo Dataset
  const handleGenerateDemoData = async () => {
    if (!window.confirm('✨ คุณต้องการสร้างชุดข้อมูลทดสอบตัวอย่าง (12 รายการครอบคลุมทุกหมวดหมู่) หรือไม่?')) return
    setIsGeneratingDemo(true)
    try {
      const now = new Date()
      const daysAgo = (d) => new Date(now.getTime() - d * 86400000).toISOString()

      const demoList = [
        { description: 'เงินเดือนประจำเดือน', type: 'income', category: 'เงินเดือน', amount: 55000, date: daysAgo(12), paymentMethod: 'bank', tags: ['#เงินเดือน', '#งานประจำ'] },
        { description: 'ซื้อของสดและของใช้ Lotus', type: 'expense', category: 'อาหาร/เครื่องดื่ม', amount: 3200, date: daysAgo(11), paymentMethod: 'credit', tags: ['#ของกิน', '#ซูเปอร์'] },
        { description: 'รับจ้างเขียนโค้ด React Web App', type: 'income', category: 'งานพิเศษ', amount: 16500, date: daysAgo(10), paymentMethod: 'bank', tags: ['#ฟรีแลนซ์', '#ไอที'] },
        { description: 'ค่าน้ำมันรถยนต์ Shell V-Power', type: 'expense', category: 'การเดินทาง', amount: 1600, date: daysAgo(9), paymentMethod: 'credit', tags: ['#รถยนต์', '#เดินทาง'] },
        { description: 'ค่าเช่าห้องพัก & สาธารณูปโภค', type: 'expense', category: 'บิล/สาธารณูปโภค', amount: 11500, date: daysAgo(8), paymentMethod: 'bank', tags: ['#คอนโด', '#ค่าบ้าน'] },
        { description: 'รับประทานอาหารชาบู Momo Paradise', type: 'expense', category: 'อาหาร/เครื่องดื่ม', amount: 1450, date: daysAgo(6), paymentMethod: 'wallet', tags: ['#บุฟเฟต์', '#ปาร์ตี้'] },
        { description: 'ขายสินค้ามือสองออนไลน์', type: 'income', category: 'ขายของ', amount: 4800, date: daysAgo(5), paymentMethod: 'wallet', tags: ['#Shopee', '#ของมือสอง'] },
        { description: 'จ่ายค่าบริการ Netflix & YouTube Premium', type: 'expense', category: 'ความบันเทิง', amount: 699, date: daysAgo(4), paymentMethod: 'credit', tags: ['#บันเทิง', '#สตรีมมิ่ง'] },
        { description: 'ซื้อรองเท้าวิ่ง Nike ZoomX', type: 'expense', category: 'ช้อปปิ้ง', amount: 4200, date: daysAgo(3), paymentMethod: 'credit', tags: ['#กีฬา', '#ช้อปปิ้ง'] },
        { description: 'เงินปันผลกองทุนรวมและหุ้นไทย', type: 'income', category: 'โบนัส/การลงทุน', amount: 3900, date: daysAgo(2), paymentMethod: 'bank', tags: ['#ปันผล', '#ลงทุน'] },
        { description: 'อาหารกลางวันและเครื่องดื่มกาแฟ', type: 'expense', category: 'อาหาร/เครื่องดื่ม', amount: 240, date: daysAgo(1), paymentMethod: 'cash', tags: ['#กาแฟ', '#ของกิน'] },
        { description: 'ซื้อวิตามินบำรุงสุขภาพ', type: 'expense', category: 'ค่ารักษา/สุขภาพ', amount: 890, date: daysAgo(0), paymentMethod: 'wallet', tags: ['#สุขภาพ', '#ยา'] }
      ]

      for (const item of demoList) {
        await createRecord(item).catch(() => {})
      }

      toast.push({ title: '🎉 สร้างชุดข้อมูลตัวอย่างภาษาไทยสำเร็จ 12 รายการ!' })
      window.dispatchEvent(new CustomEvent('recordsUpdated'))
    } catch (e) {
      console.error(e)
      toast.push({ title: '❌ สร้างข้อมูลตัวอย่างไม่สำเร็จ', type: 'error' })
    } finally {
      setIsGeneratingDemo(false)
    }
  }

  // Clear All Data
  const handleClearAllData = async () => {
    if (!window.confirm('⚠️ คุณต้องการลบรายการทั้งหมดเพื่อเริ่มบันทึกจริงในชีวิตประจำวันใช่หรือไม่?\n(แนะนำให้สำรองข้อมูล JSON ไว้ก่อนทำการล้างข้อมูล)')) return

    setIsClearing(true)
    try {
      const records = await fetchRecords()
      await Promise.all(records.map(r => deleteRecord(r._id || r.id)))
      toast.push({ title: '🧹 ล้างข้อมูลเรียบร้อยแล้ว พร้อมเริ่มใช้งานจริง 100%!' })
      window.dispatchEvent(new CustomEvent('recordsUpdated'))
    } catch (e) {
      console.error(e)
      toast.push({ title: '❌ เกิดข้อผิดพลาดในการล้างข้อมูล', type: 'error' })
    } finally {
      setIsClearing(false)
    }
  }

  const TABS = [
    { id: 'profile', label: 'โปรไฟล์ & บัญชี', icon: UserCircleIcon, desc: 'ชื่อ, อีเมล, รูปไอคอน, สกุลเงิน' },
    { id: 'appearance', label: 'ธีม & การแสดงผล', icon: PaintBrushIcon, desc: 'โหมดมืด, โทนสี Accent, อนิเมชั่น' },
    { id: 'budgets', label: 'งบประมาณ & เป้าหมาย', icon: AdjustmentsHorizontalIcon, desc: 'เพดานรายจ่าย, เงินออม, เตือนงบ' },
    { id: 'wallets', label: 'กระเป๋าเงินเริ่มต้น', icon: WalletIcon, desc: 'เงินสด, บัญชีธนาคาร, บัตรเครดิต' },
    { id: 'notifications', label: 'การแจ้งเตือน', icon: BellIcon, desc: 'เตือนบันทึกประจำวัน, Web Push' },
    { id: 'data', label: 'สำรอง & จัดการข้อมูล', icon: CircleStackIcon, desc: 'Export JSON, CSV Excel, Import, Reset' }
  ]

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass card-shadow p-5 rounded-2xl border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/90 via-indigo-950/30 to-slate-900/90">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20">
            {profile.avatarEmoji || '⚙️'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-100">ศูนย์ควบคุม & ตั้งค่าระบบ (Settings Center)</h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                พร้อมใช้งาน 100%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              ปรับแต่งโปรไฟล์ส่วนตัว, ธีมสี, งบประมาณ, กระเป๋าเงิน และสำรองข้อมูลลงเครื่องของคุณ
            </p>
          </div>
        </div>

        {/* Quick Backup Action in Header */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-bold border border-indigo-500/30 transition-all hover:scale-105"
            title="สำรองข้อมูลด่วน"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>{isExporting ? 'กำลังสำรอง...' : 'สำรองด่วน'}</span>
          </button>
        </div>
      </div>

      {/* Main Settings Navigation & Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Sidebar Navigation Tabs */}
        <div className="glass card-shadow p-3 rounded-2xl border border-slate-700/50 space-y-1.5 lg:col-span-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            หมวดหมู่การตั้งค่า
          </div>
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25 font-bold scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs truncate">{tab.label}</div>
                  <div className={`text-[10px] truncate ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>
                    {tab.desc}
                  </div>
                </div>
              </button>
            )
          })}

          {/* Quick System Stats Footer in Sidebar */}
          <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] space-y-1 text-slate-400">
            <div className="flex justify-between">
              <span>รายการทั้งหมด:</span>
              <span className="font-bold text-slate-200">{systemStats.totalRecords} รายการ</span>
            </div>
            <div className="flex justify-between">
              <span>ขนาดหน่วยความจำ:</span>
              <span className="font-bold text-indigo-400">{systemStats.storageKb} KB</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-500">
              <span>เวอร์ชันระบบ:</span>
              <span className="text-emerald-400 font-semibold">v4.0 Ultra Pro</span>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {/* 1. TAB: PROFILE & ACCOUNT */}
            {activeTab === 'profile' && (
              <motion.div
                key="tab-profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass card-shadow p-6 rounded-2xl border border-slate-700/50 space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <UserCircleIcon className="w-6 h-6 text-indigo-400" />
                    <h3 className="text-base font-bold text-slate-100">👤 โปรไฟล์ & บัญชีผู้ใช้ (User Profile)</h3>
                  </div>
                  <span className="text-xs text-slate-400">ปรับแต่งชื่อและข้อมูลเพื่อแสดงผลบนระบบ</span>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  {/* Avatar Picker */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      ไอคอนประจำตัว (Avatar Emoji)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_OPTIONS.map(em => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setProfile({ ...profile, avatarEmoji: em })}
                          className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center border transition-all ${
                            profile.avatarEmoji === em
                              ? 'bg-indigo-600/30 border-indigo-500 scale-110 shadow-lg shadow-indigo-500/30'
                              : 'bg-slate-900 border-slate-700/80 hover:border-slate-500 text-slate-300'
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        ชื่อผู้ใช้งาน (Display Name) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        อีเมล (Email Address)
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Payday & Currency */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        📅 วันเงินเดือนออก (รอบการคำนวณงบประมาณ)
                      </label>
                      <select
                        value={profile.payday}
                        onChange={e => setProfile({ ...profile, payday: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                      >
                        {[...Array(31)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            ทุกวันที่ {i + 1} ของเดือน {i + 1 === 25 ? '(ยอดนิยม)' : ''}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-400 mt-1">
                        ใช้สำหรับตัดรอบบิลและสรุปภาพรวมรายรับ-รายจ่าย
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        💵 สกุลเงินหลัก (Currency)
                      </label>
                      <select
                        value={profile.currency}
                        onChange={e => {
                          const c = e.target.value
                          const sym = c === 'USD' ? '$' : (c === 'EUR' ? '€' : (c === 'JPY' ? '¥' : '฿'))
                          setProfile({ ...profile, currency: c, currencySymbol: sym })
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                      >
                        <option value="THB">บาทไทย (THB - ฿)</option>
                        <option value="USD">ดอลลาร์สหรัฐ (USD - $)</option>
                        <option value="EUR">ยูโร (EUR - €)</option>
                        <option value="JPY">เยนญี่ปุ่น (JPY - ¥)</option>
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                    >
                      <CheckIcon className="w-4 h-4" />
                      <span>บันทึกการเปลี่ยนแปลงโปรไฟล์</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* 2. TAB: APPEARANCE & THEME */}
            {activeTab === 'appearance' && (
              <motion.div
                key="tab-appearance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass card-shadow p-6 rounded-2xl border border-slate-700/50 space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <PaintBrushIcon className="w-6 h-6 text-indigo-400" />
                    <h3 className="text-base font-bold text-slate-100">🎨 ธีม & การแสดงผล (Appearance & Theme)</h3>
                  </div>
                  <span className="text-xs text-slate-400">ปรับแต่งโทนสีและเอฟเฟกต์ภาพ</span>
                </div>

                <div className="space-y-6 text-xs">
                  {/* Accent Color Palettes */}
                  <div>
                    <label className="block font-bold text-slate-200 mb-2">
                      โทนสีหลักของระบบ (Accent Palette)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {ACCENT_COLORS.map(col => {
                        const isSelected = appearance.accent === col.id
                        return (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => handleSaveAppearance({ accent: col.id })}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                ? 'bg-slate-800 border-indigo-500 ring-2 ring-indigo-500/50 text-white font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full ${col.bg} shrink-0`} />
                            <span className="truncate">{col.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    {/* Background Flow Stream Animation */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div>
                        <div className="font-bold text-slate-200">อนิเมชั่นลำแสงการเงินพื้นหลัง (Background Light Streams)</div>
                        <div className="text-[11px] text-slate-400">แสดงแสงออโรร่าและเส้นสายการเงินแบบเคลื่อนไหว</div>
                      </div>
                      <button
                        onClick={() => handleSaveAppearance({ enableBgFlow: !appearance.enableBgFlow })}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                          appearance.enableBgFlow ? 'bg-indigo-600' : 'bg-slate-700'
                        }`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          appearance.enableBgFlow ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Privacy Mode (Blur Amounts) */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div>
                        <div className="font-bold text-slate-200 flex items-center gap-1.5">
                          {appearance.privacyMode ? <EyeSlashIcon className="w-4 h-4 text-amber-400" /> : <EyeIcon className="w-4 h-4 text-slate-400" />}
                          <span>โหมดความเป็นส่วนตัว (Privacy Mode)</span>
                        </div>
                        <div className="text-[11px] text-slate-400">เบลอตัวเลขจำนวนเงินเพื่อความปลอดภัยเมื่ออยู่ในที่สาธารณะ</div>
                      </div>
                      <button
                        onClick={() => handleSaveAppearance({ privacyMode: !appearance.privacyMode })}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                          appearance.privacyMode ? 'bg-indigo-600' : 'bg-slate-700'
                        }`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          appearance.privacyMode ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Decimal Places */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div>
                        <div className="font-bold text-slate-200">รูปแบบการแสดงตัวเลขทศนิยม</div>
                        <div className="text-[11px] text-slate-400">เลือกแสดงทศนิยม 2 ตำแหน่ง (฿1,250.50) หรือจำนวนเต็ม (฿1,251)</div>
                      </div>
                      <select
                        value={appearance.decimalPlaces}
                        onChange={e => handleSaveAppearance({ decimalPlaces: Number(e.target.value) })}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none"
                      >
                        <option value={2}>ทศนิยม 2 ตำแหน่ง (.00)</option>
                        <option value={0}>จำนวนเต็ม (ไม่มีเศษสตางค์)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. TAB: BUDGETS & TARGETS */}
            {activeTab === 'budgets' && (
              <motion.div
                key="tab-budgets"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass card-shadow p-6 rounded-2xl border border-slate-700/50 space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <AdjustmentsHorizontalIcon className="w-6 h-6 text-indigo-400" />
                    <h3 className="text-base font-bold text-slate-100">🎯 งบประมาณ & เพดานการเงิน (Budgets & Spending Limits)</h3>
                  </div>
                  <span className="text-xs text-slate-400">กำหนดเป้าหมายเพื่อช่วยควบคุมวินัยทางการเงิน</span>
                </div>

                <form onSubmit={handleSaveBudgets} className="space-y-5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <label className="block font-bold text-slate-300 mb-1">
                        1. เพดานรายจ่ายสูงสุด (บาท/เดือน)
                      </label>
                      <input
                        type="number"
                        value={targets.monthlyExpenseLimit}
                        onChange={e => setTargets({ ...targets, monthlyExpenseLimit: Math.max(0, Number(e.target.value)) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-indigo-500"
                        required
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">จำกัดรายจ่ายรวมไม่ให้เกินงบ</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <label className="block font-bold text-slate-300 mb-1">
                        2. เป้าหมายเงินออม (บาท/เดือน)
                      </label>
                      <input
                        type="number"
                        value={targets.monthlySavingsGoal}
                        onChange={e => setTargets({ ...targets, monthlySavingsGoal: Math.max(0, Number(e.target.value)) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-indigo-500"
                        required
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">เป้าหมายเงินคงเหลือสะสม</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <label className="block font-bold text-slate-300 mb-1">
                        3. เป้าหมายรายรับ (บาท/เดือน)
                      </label>
                      <input
                        type="number"
                        value={targets.monthlyIncomeGoal}
                        onChange={e => setTargets({ ...targets, monthlyIncomeGoal: Math.max(0, Number(e.target.value)) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-indigo-500"
                        required
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">เป้าหมายรายได้รวมทุกช่องทาง</span>
                    </div>
                  </div>

                  {/* Category Breakdown Limit Setup */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center justify-between">
                      <span>📊 เพดานงบประมาณแยกตามหมวดหมู่</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">แจ้งเตือนเมื่อใช้ถึง:</span>
                        <select
                          value={targets.warningThreshold || 80}
                          onChange={e => setTargets({ ...targets, warningThreshold: Number(e.target.value) })}
                          className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-indigo-400 text-xs font-bold"
                        >
                          <option value={70}>70% ของงบ</option>
                          <option value={80}>80% ของงบ</option>
                          <option value={90}>90% ของงบ</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.keys(targets.categoryBudgets || DEFAULT_TARGETS.categoryBudgets).map(cat => (
                        <div key={cat} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                          <span className="text-slate-300 truncate">{cat}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500 text-[10px]">฿</span>
                            <input
                              type="number"
                              value={targets.categoryBudgets?.[cat] ?? 0}
                              onChange={e => setTargets({
                                ...targets,
                                categoryBudgets: {
                                  ...targets.categoryBudgets,
                                  [cat]: Math.max(0, Number(e.target.value))
                                }
                              })}
                              className="w-24 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs text-right focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                    >
                      <CheckIcon className="w-4 h-4" />
                      <span>บันทึกเป้าหมายและงบประมาณ</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* 4. TAB: WALLETS & BALANCES */}
            {activeTab === 'wallets' && (
              <motion.div
                key="tab-wallets"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass card-shadow p-6 rounded-2xl border border-slate-700/50 space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <WalletIcon className="w-6 h-6 text-indigo-400" />
                    <h3 className="text-base font-bold text-slate-100">💼 กระเป๋าเงิน & ยอดเงินเริ่มต้น (Wallet Accounts)</h3>
                  </div>
                  <span className="text-xs text-slate-400">กำหนดยอดเงินสด บัญชีธนาคาร และบัตรเครดิตจริง</span>
                </div>

                <form onSubmit={handleSaveWallets} className="space-y-5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Cash */}
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/20 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <BanknotesIcon className="w-5 h-5" />
                        <span>เงินสดติดตัว (Cash)</span>
                      </div>
                      <input
                        type="number"
                        value={wallets.cash}
                        onChange={e => setWallets({ ...wallets, cash: Number(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Bank */}
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/20 space-y-2">
                      <div className="flex items-center gap-2 text-indigo-400 font-bold">
                        <BuildingLibraryIcon className="w-5 h-5" />
                        <span>บัญชีเงินฝากธนาคาร (Bank Accounts)</span>
                      </div>
                      <input
                        type="number"
                        value={wallets.bank}
                        onChange={e => setWallets({ ...wallets, bank: Number(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Credit Card */}
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-rose-500/20 space-y-2">
                      <div className="flex items-center gap-2 text-rose-400 font-bold">
                        <CreditCardIcon className="w-5 h-5" />
                        <span>ยอดค้างชำระบัตรเครดิต (Credit Card)</span>
                      </div>
                      <input
                        type="number"
                        value={wallets.credit}
                        onChange={e => setWallets({ ...wallets, credit: Number(e.target.value) || 0 })}
                        placeholder="-2500"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-rose-500"
                      />
                      <span className="text-[10px] text-slate-500 block">แนะนำใส่ค่าติดลบ หากมียอดหนี้ค้างชำระ</span>
                    </div>

                    {/* E-Wallet */}
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/20 space-y-2">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold">
                        <DevicePhoneMobileIcon className="w-5 h-5" />
                        <span>E-Wallet & กระเป๋าดิจิทัล (TrueMoney/ShopeePay)</span>
                      </div>
                      <input
                        type="number"
                        value={wallets.wallet}
                        onChange={e => setWallets({ ...wallets, wallet: Number(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                    >
                      <CheckIcon className="w-4 h-4" />
                      <span>บันทึกยอดเงินกระเป๋าจริง</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* 5. TAB: NOTIFICATIONS & REMINDERS */}
            {activeTab === 'notifications' && (
              <motion.div
                key="tab-notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass card-shadow p-6 rounded-2xl border border-slate-700/50 space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <BellIcon className="w-6 h-6 text-indigo-400" />
                    <h3 className="text-base font-bold text-slate-100">🔔 การแจ้งเตือน & ระบบเตือน (Notifications & Reminders)</h3>
                  </div>
                  <span className="text-xs text-slate-400">ควบคุมระบบเตือนบันทึกและระบบเตือนงบเกิน</span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Live Clock & Schedule Status Banner */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                        <ClockIcon className="w-5 h-5 animate-pulse text-indigo-400" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 flex items-center gap-2">
                          <span>🕒 เวลาเครื่องของคุณขณะนี้:</span>
                          <span className="font-mono text-emerald-400 text-sm font-black tracking-wider bg-slate-950 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                            {liveClock}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                          <span>
                            {notifications.dailyReminder 
                              ? `ระบบเปิดทำงานอยู่: จะแจ้งเตือนอัตโนมัติเมื่อถึงเวลา ${notifications.dailyReminderTime || '20:00'} น.` 
                              : 'ระบบเตือนรายวันปิดอยู่ (สามารถเปิดสวิตช์ด้านล่างเพื่อเริ่มใช้งาน)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => triggerDailyReminder(notifications.dailyReminderTime || '20:00', toast)}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all hover:scale-105 shadow-lg shadow-amber-500/20 shrink-0"
                    >
                      <SparklesIcon className="w-4 h-4 text-slate-950" />
                      <span>⚡ ทดสอบเสียงและแจ้งเตือนทันที</span>
                    </button>
                  </div>

                  {/* Daily Log Reminder */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                          <span>⏰ เตือนบันทึกรายรับ-รายจ่ายประจำวัน (Daily Reminder)</span>
                          {notifications.dailyReminder && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              เปิดใช้งาน
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          เมื่อถึงเวลาที่กำหนด ระบบจะส่งเสียง Chime และส่งการแจ้งเตือนเตือนความจำให้คุณบันทึกค่าใช้จ่าย
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSaveNotifications({ dailyReminder: !notifications.dailyReminder })}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                          notifications.dailyReminder ? 'bg-indigo-600' : 'bg-slate-700'
                        }`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          notifications.dailyReminder ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {notifications.dailyReminder && (
                      <div className="space-y-3 pt-3 border-t border-slate-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="text-slate-300 font-semibold flex items-center gap-2">
                            <span>กำหนดเวลาที่ต้องการให้แจ้งเตือน:</span>
                          </label>
                          <input
                            type="time"
                            value={notifications.dailyReminderTime || '20:00'}
                            onChange={e => handleSaveNotifications({ dailyReminderTime: e.target.value })}
                            className="w-full sm:w-40 px-3.5 py-2 rounded-xl bg-slate-950 border border-indigo-500/50 text-slate-100 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        {/* Quick Preset Buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                          <span className="text-slate-400">ปุ่มลัดตั้งเวลาด่วน:</span>
                          <button
                            type="button"
                            onClick={handleSetQuickTestTime}
                            className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-bold border border-indigo-500/30 transition-all hover:scale-105"
                          >
                            ⚡ +1 นาทีจากนี้ (ทดสอบไว)
                          </button>
                          {['18:00', '20:00', '21:00', '22:00'].map(t => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => handleSaveNotifications({ dailyReminder: true, dailyReminderTime: t })}
                              className={`px-2.5 py-1 rounded-lg border transition-all ${
                                notifications.dailyReminderTime === t
                                  ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                              }`}
                            >
                              {t} น.
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Over Budget Alert */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">เตือนเมื่องบประมาณใกล้เต็มหรือเกิน (Budget Warning Alert)</div>
                      <div className="text-[11px] text-slate-400">แจ้งเตือนทันทีเมื่อรายจ่ายถึงเกณฑ์ หรือเกินงบประมาณที่กำหนดไว้</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSaveNotifications({ budgetWarning: !notifications.budgetWarning })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                        notifications.budgetWarning ? 'bg-indigo-600' : 'bg-slate-700'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        notifications.budgetWarning ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Test Browser Notification Trigger */}
                  <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-indigo-300">ขอสิทธิ์ & ทดสอบระบบ Web Push Notification</div>
                      <div className="text-[11px] text-slate-400">ส่งการแจ้งเตือนของระบบปฏิบัติการ/เบราว์เซอร์จริงขึ้นบนหน้าจอ</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleTestNotification}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 shrink-0"
                    >
                      🚀 ขอสิทธิ์ & ยิงแจ้งเตือน
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 6. TAB: DATA BACKUP, EXPORT & RESTORE */}
            {activeTab === 'data' && (
              <motion.div
                key="tab-data"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass card-shadow p-6 rounded-2xl border border-slate-700/50 space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <CircleStackIcon className="w-6 h-6 text-indigo-400" />
                    <h3 className="text-base font-bold text-slate-100">💾 สำรอง & จัดการข้อมูล (Data Backup & Reset)</h3>
                  </div>
                  <span className="text-xs text-slate-400">สำรองไฟล์, ส่งออก CSV สำหรับ Excel และล้างข้อมูล</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* JSON Backup & Restore Card */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-indigo-300">
                      <ShieldCheckIcon className="w-5 h-5 text-indigo-400" />
                      <span>สำรอง & กู้คืนระบบ (JSON Full Backup)</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      บันทึกรายการ, กระเป๋าเงิน, การตั้งค่า และเป้าหมายทั้งหมดลงไฟล์ .json ในเครื่องของคุณ
                    </p>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleExportJSON}
                        disabled={isExporting}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all hover:scale-105"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        <span>{isExporting ? 'กำลังสำรอง...' : 'ดาวน์โหลด JSON'}</span>
                      </button>

                      <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold border border-indigo-500/30 cursor-pointer transition-all hover:scale-105">
                        <ArrowUpTrayIcon className="w-4 h-4" />
                        <span>{isImporting ? 'กำลังกู้คืน...' : 'กู้คืนจาก JSON'}</span>
                        <input type="file" accept=".json" onChange={handleImportJSON} disabled={isImporting} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {/* CSV Export Card */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-emerald-400">
                      <DocumentArrowDownIcon className="w-5 h-5" />
                      <span>ส่งออก Excel (CSV ภาษาไทย UTF-8 BOM)</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      ดาวน์โหลดข้อมูลประวัติรายการทั้งหมดเป็นไฟล์ CSV ที่สามารถเปิดใน Microsoft Excel หรือ Google Sheets ได้ทันที
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={handleExportCSV}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 font-bold border border-emerald-500/30 transition-all hover:scale-105"
                      >
                        <DocumentArrowDownIcon className="w-4 h-4 text-emerald-400" />
                        <span>ดาวน์โหลดไฟล์ .CSV สำหรับ Excel</span>
                      </button>
                    </div>
                  </div>

                  {/* Demo Dataset Generator Card */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-amber-400">
                      <SparklesIcon className="w-5 h-5" />
                      <span>สร้างชุดข้อมูลทดสอบ (Demo Dataset)</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      สร้างรายการตัวอย่าง 12 รายการครอบคลุมทุกหมวดหมู่ เหมาะสำหรับทดลองระบบและดูกราฟวิเคราะห์
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={handleGenerateDemoData}
                        disabled={isGeneratingDemo}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 font-bold transition-all hover:scale-105"
                      >
                        <SparklesIcon className="w-4 h-4 text-amber-400" />
                        <span>{isGeneratingDemo ? 'กำลังสร้างข้อมูล...' : '✨ สร้างชุดข้อมูลตัวอย่าง 1-Click'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Clear All Data Fresh Start */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-rose-500/20 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-rose-400">
                      <TrashIcon className="w-5 h-5" />
                      <span>เริ่มบันทึกจริง (Clean Slate - ล้างรายการทั้งหมด)</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      ลบรายการประวัติทั้งหมดออกเพื่อเริ่มจดบันทึกรายรับ-รายจ่ายจริงในชีวิตประจำวัน 100%
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={handleClearAllData}
                        disabled={isClearing}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/70 border border-rose-500/30 text-rose-300 font-bold transition-all hover:scale-[1.02]"
                      >
                        <TrashIcon className="w-4 h-4 text-rose-400" />
                        <span>{isClearing ? 'กำลังล้างข้อมูล...' : '🧹 ล้างรายการทั้งหมดเพื่อเริ่มใช้จริง'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
