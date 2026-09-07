import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo'
import { 
  SunIcon, 
  MoonIcon, 
  ChevronDownIcon, 
  UserIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  PaintBrushIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

const ACCENT_COLORS = [
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-600', ring: 'ring-indigo-500', text: 'text-indigo-400' },
  { id: 'violet', label: 'Violet', bg: 'bg-violet-600', ring: 'ring-violet-500', text: 'text-violet-400' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-600', ring: 'ring-emerald-500', text: 'text-emerald-400' },
  { id: 'cyan', label: 'Cyan', bg: 'bg-cyan-600', ring: 'ring-cyan-500', text: 'text-cyan-400' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-600', ring: 'ring-amber-500', text: 'text-amber-400' }
]

export default function Header({ dark, setDark, accent, setAccent, onNavigate }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('wealthflow_user_profile')
    return saved ? JSON.parse(saved) : { name: 'ผู้ใช้งาน WealthFlow', email: 'user@wealthflow.pro', avatarEmoji: '💎' }
  })
  const dropdownRef = useRef(null)
  const colorPickerRef = useRef(null)

  // Profile Update Listener
  useEffect(() => {
    const handleProfileUpdate = (e) => {
      if (e.detail) setProfile(e.detail)
    }
    window.addEventListener('userProfileUpdated', handleProfileUpdate)
    return () => window.removeEventListener('userProfileUpdated', handleProfileUpdate)
  }, [])

  // Click Outside Listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setIsColorPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-4 z-40 mb-6 glass rounded-2xl px-4 py-3 shadow-xl border border-slate-700/50 backdrop-blur-md bg-slate-900/80 transition-all duration-300">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Brand Logo & Title */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate?.('dashboard')}>
          <Logo size="medium" showText={true} />
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            v4.0 Pro
          </span>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2.5">
          {/* Accent Color Picker Dropdown */}
          <div className="relative" ref={colorPickerRef}>
            <button
              onClick={() => setIsColorPickerOpen(prev => !prev)}
              className="p-2 rounded-xl glass hover:bg-slate-800/80 transition-all duration-200 hover:scale-105 active:scale-95 border border-slate-700/60 text-slate-300"
              title="เปลี่ยนสีธีมหลัก"
            >
              <PaintBrushIcon className="w-4 h-4 text-indigo-400" />
            </button>

            <AnimatePresence>
              {isColorPickerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-44 glass p-2.5 rounded-2xl border border-slate-700/80 shadow-2xl z-50 space-y-1"
                >
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-800">
                    เลือกโทนสีหลัก (Accent Color)
                  </div>
                  {ACCENT_COLORS.map(col => (
                    <button
                      key={col.id}
                      onClick={() => { setAccent(col.id); setIsColorPickerOpen(false); }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        accent === col.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full ${col.bg}`} />
                        <span>{col.label}</span>
                      </div>
                      {accent === col.id && <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setDark(d => !d)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold glass hover:bg-slate-800/80 transition-all duration-200 hover:scale-105 active:scale-95 border border-slate-700/60 text-slate-200"
            title="สลับธีม สว่าง/มืด"
          >
            {dark ? (
              <MoonIcon className="w-4 h-4 text-indigo-400 shrink-0" />
            ) : (
              <SunIcon className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="hidden sm:inline">{dark ? 'Dark' : 'Light'}</span>
          </button>

          {/* Profile Dropdown Trigger */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(prev => !prev)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl glass hover:bg-slate-800/80 transition-all duration-200 hover:scale-105 active:scale-95 border border-slate-700/60"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
                {profile.avatarEmoji || (profile.name ? profile.name.charAt(0) : 'U')}
              </div>
              <span className="text-xs font-semibold text-slate-200 hidden sm:inline max-w-[120px] truncate">{profile.name || 'บัญชีของฉัน'}</span>
              <ChevronDownIcon className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Popover Menu */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 glass p-2 rounded-2xl border border-slate-700/80 shadow-2xl z-50 space-y-1"
                >
                  <div className="px-3 py-2 border-b border-slate-800 text-xs">
                    <div className="font-bold text-slate-200 truncate flex items-center gap-1.5">
                      <span>{profile.avatarEmoji || '👤'}</span>
                      <span className="truncate">{profile.name || 'ผู้ใช้งาน WealthFlow'}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{profile.email || 'user@wealthflow.pro'}</div>
                  </div>

                  <div className="py-1 space-y-0.5 text-xs">
                    <button
                      onClick={() => { onNavigate?.('settings'); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors font-medium text-left"
                    >
                      <UserIcon className="w-4 h-4 text-indigo-400" />
                      <span>โปรไฟล์ & ข้อมูลผู้ใช้</span>
                    </button>

                    <button
                      onClick={() => { onNavigate?.('settings'); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors font-medium text-left"
                    >
                      <Cog6ToothIcon className="w-4 h-4 text-purple-400" />
                      <span>ตั้งค่าระบบ & สำรองข้อมูล</span>
                    </button>

                    <div className="my-1 border-t border-slate-800" />

                    <button
                      onClick={() => { alert('ออกจากระบบเรียบร้อยแล้ว'); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors font-semibold text-left"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 text-rose-400" />
                      <span>ออกจากระบบ (Logout)</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
