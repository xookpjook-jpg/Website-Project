import React from 'react'

export default function MiniCalendar(){
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  return (
    <div className="glass card-shadow p-4 rounded-xl border border-[rgba(255,255,255,0.03)]">
      <h3 className="text-lg font-semibold mb-3">ปฏิทิน</h3>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400">
        {days.map(d=> <div key={d} className="py-1">{d}</div>)}
        {Array.from({length:28}).map((_,i)=> (
          <div key={i} className="py-2 rounded hover:bg-[rgba(255,255,255,0.02)]">{i+1}</div>
        ))}
      </div>
    </div>
  )
}
