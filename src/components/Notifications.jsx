import React from 'react'

const notes = [
  {id:1, title:'เงินเดือนเข้า', desc:'เงินเดือนถูกโอนเข้าบัญชีหลัก', time:'วันนี้ 09:00'},
  {id:2, title:'ใช้จ่ายเกินงบ', desc:'ค่าอาหารสูงกว่างบที่ตั้งไว้', time:'เมื่อวาน 18:20'},
  {id:3, title:'รายการใหม่', desc:'มีรายการบันทึกรายจ่ายใหม่', time:'2 วันที่แล้ว'}
]

export default function Notifications(){
  return (
    <div className="glass card-shadow p-4 rounded-xl border border-[rgba(255,255,255,0.03)]">
      <h3 className="text-lg font-semibold mb-3">แจ้งเตือน</h3>
      <div className="space-y-3">
        {notes.map(n=>(
          <div key={n.id} className="flex items-start gap-3 hover:bg-[rgba(255,255,255,0.01)] p-2 rounded">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center">N</div>
            <div>
              <div className="font-semibold">{n.title}</div>
              <div className="text-sm text-slate-400">{n.desc}</div>
            </div>
            <div className="ml-auto text-sm text-slate-400">{n.time}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
