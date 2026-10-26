'use client'
import { useEffect, useState } from 'react'
import { useJourney } from '@/lib/store'
import { getLocation } from '@/lib/locations'
import { locationStatements, mixedStatements } from '@/lib/statements'

export function Statements() {
  const {origin,destination}=useJourney()
  const [open,setOpen]=useState(false)
  const [tab,setTab]=useState('mixed')
  useEffect(()=>setTab(origin&&destination?'mixed':origin?'origin':'destination'),[origin,destination])
  const from=origin?getLocation(origin):null,to=destination?getLocation(destination):null
  const mode=tab==='mixed'&&from&&to?'mixed':tab==='destination'&&to?'destination':from?'origin':'destination'
  const items=mode==='mixed'?mixedStatements(from!,to!):from||to?locationStatements((mode==='origin'?from:to)!):[]
  return <div className="statement-browser">
    <p className="eyebrow">WORDS TO WEAR</p><h2>Your places.<br/><em>Your statement.</em></h2>
    <p>Personal expressions inspired by where you come from and where you are now.</p>
    <button className="statement-trigger" aria-expanded={open} aria-controls="statement-list" disabled={!items.length} onClick={()=>setOpen(!open)}>{open?'Close statements':`Explore ${items.length} statements`} <span>{open?'-':'+'}</span></button>
    {!items.length&&<small>Choose a location to discover your words.</small>}
    {open&&items.length>0&&<div id="statement-list"><div className="statement-tabs" aria-label="Statement sources">
      {from&&<button aria-pressed={mode==='origin'} onClick={()=>setTab('origin')}>From {from.name}</button>}
      {to&&<button aria-pressed={mode==='destination'} onClick={()=>setTab('destination')}>Now in {to.name}</button>}
      {from&&to&&<button aria-pressed={mode==='mixed'} onClick={()=>setTab('mixed')}>Both places</button>}
    </div><p className="statement-note">Original personal expressions  /  {items.length} options</p><ol className="statement-list">{items.map((text,i)=><li key={text}><span>{String(i+1).padStart(2,'0')}</span>{text}</li>)}</ol></div>}
  </div>
}
