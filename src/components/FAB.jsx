import React from 'react'
import { PlusIcon } from '@heroicons/react/24/solid'

export default function FAB({onClick}){
  return (
    <button onClick={onClick} className="fixed right-6 bottom-6 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center shadow-lg z-40 hover:scale-105 transition-smooth">
      <PlusIcon className="w-6 h-6" />
    </button>
  )
}
