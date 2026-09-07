import React, { useEffect, useRef } from 'react'
import { useToast } from './Toast'

// Synthesize pleasant sound chime using Web Audio API
export function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now) // D5
    osc1.frequency.setValueAtTime(880, now + 0.12) // A5

    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(659.25, now + 0.12) // E5
    osc2.frequency.setValueAtTime(1046.50, now + 0.24) // C6

    gain.gain.setValueAtTime(0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now + 0.12)
    osc1.stop(now + 0.8)
    osc2.stop(now + 0.8)
  } catch (e) {
    // AudioContext blocked before user interaction
  }
}

// Trigger daily reminder alert across Toast + System Notification + Sound
export function triggerDailyReminder(timeStr, toast) {
  playNotificationChime()

  // 1. In-App Toast
  if (toast) {
    toast.push({
      title: '⏰ ถึงเวลาบันทึกรายรับ-รายจ่ายประจำวันแล้ว!',
      desc: `เวลา ${timeStr || ''} น. อย่าลืมจดบันทึกค่าใช้จ่ายวันนี้เพื่อวินัยทางการเงินที่ดี`
    })
  }

  // 2. Web Browser Native System Notification
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification('⏰ ถึงเวลาบันทึกรายรับ-รายจ่าย (WealthFlow Pro)', {
        body: `เวลา ${timeStr || ''} น. ได้เวลาจดบันทึกรายรับ-รายจ่ายประจำวันของคุณแล้ว คลิกเพื่อเริ่มบันทึก!`,
        icon: '/vite.svg',
        tag: 'wealthflow-daily-reminder',
        requireInteraction: false
      })

      notif.onclick = () => {
        window.focus()
        window.dispatchEvent(new CustomEvent('openAddModal', { detail: { type: 'expense' } }))
      }
    } catch (e) {
      console.warn('Cannot display desktop notification', e)
    }
  }
}

export default function NotificationScheduler() {
  const toast = useToast()
  const lastCheckedMinuteRef = useRef('')

  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date()
      const currentHour = String(now.getHours()).padStart(2, '0')
      const currentMinute = String(now.getMinutes()).padStart(2, '0')
      const currentTimeKey = `${currentHour}:${currentMinute}`
      const todayDateKey = now.toISOString().slice(0, 10)
      const triggerKey = `${todayDateKey}_${currentTimeKey}`

      // Avoid firing multiple times within the same minute
      if (lastCheckedMinuteRef.current === triggerKey) return

      try {
        const notifs = JSON.parse(localStorage.getItem('wealthflow_notifications') || '{}')
        if (notifs.dailyReminder && notifs.dailyReminderTime) {
          const targetTime = notifs.dailyReminderTime.trim()
          
          if (targetTime === currentTimeKey) {
            const lastFired = localStorage.getItem('wealthflow_last_reminder_fired')
            if (lastFired !== triggerKey) {
              lastCheckedMinuteRef.current = triggerKey
              localStorage.setItem('wealthflow_last_reminder_fired', triggerKey)
              triggerDailyReminder(targetTime, toast)
            }
          }
        }
      } catch (e) {
        console.error('Error in notification schedule check', e)
      }
    }

    // Check immediately on mount and every 3 seconds for precision
    checkSchedule()
    const interval = setInterval(checkSchedule, 3000)
    return () => clearInterval(interval)
  }, [toast])

  return null
}
