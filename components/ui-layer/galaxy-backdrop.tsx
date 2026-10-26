'use client'

import { useEffect, useRef, useState } from 'react'
import { getGalaxyBackground } from '@/lib/galaxy-backgrounds'
import { useJourney } from '@/lib/store'

/** Keep the sky at native screen resolution, independent of the 3D canvas DPR. */
export function GalaxyBackdrop() {
  const selected=useJourney(s=>s.backgroundId)
  const mobile=useJourney(s=>s.isMobile)
  const setStatus=useJourney(s=>s.setBackgroundStatus)
  const [visible,setVisible]=useState<string | null>(null)
  const active=useRef<string | null>(null)
  useEffect(()=>{
    const background=getGalaxyBackground(selected)
    const url=mobile?background.mobileImage:background.image
    if(url===active.current){setStatus('ready');return}
    let cancelled=false
    setStatus('loading')
    const image=new Image()
    image.decoding='async'
    image.onload=async()=>{
      try {
        await image.decode()
        if(cancelled)return
        active.current=url;setVisible(url);setStatus('ready')
      } catch { if(!cancelled)setStatus('error') }
    }
    image.onerror=()=>{if(!cancelled)setStatus('error')}
    image.src=url
    return()=>{cancelled=true;image.onload=null;image.onerror=null}
  },[selected,mobile,setStatus])
  return <div className="galaxy-backdrop" aria-hidden="true">
    {visible&&<img src={visible} alt="" decoding="async" fetchPriority="high"/>}
  </div>
}
