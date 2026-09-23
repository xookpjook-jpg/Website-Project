import React from 'react'

export default function Skeleton({width='100%', height=16, className=''}){
  return (
    <div className={`skeleton rounded ${className}`} style={{width,height}}></div>
  )
}
