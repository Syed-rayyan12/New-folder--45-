'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, LoaderCircle, Sparkles, X } from 'lucide-react'
import { GALAXY_BACKGROUNDS, GALAXY_THEMES, getGalaxyBackground } from '@/lib/galaxy-backgrounds'
import { useJourney } from '@/lib/store'

export const BACKGROUND_STORAGE_KEY = 'prvlg-galaxy-background'

export function GalaxyPicker() {
  const [open,setOpen]=useState(false)
  const [theme,setTheme]=useState('All themes')
  const [credits,setCredits]=useState(false)
  const selected=useJourney(s=>s.backgroundId)
  const status=useJourney(s=>s.backgroundStatus)
  const choose=useJourney(s=>s.setBackground)
  const trigger=useRef<HTMLButtonElement>(null)
  const beforePreview=useRef(selected)
  const selectedCard=useRef<HTMLButtonElement>(null)
  const current=getGalaxyBackground(selected)
  const options=GALAXY_BACKGROUNDS.filter(background=>theme==='All themes'||background.theme===theme)

  useEffect(()=>{
    try { const saved=localStorage.getItem(BACKGROUND_STORAGE_KEY); if(saved)choose(saved) } catch { /* Storage may be disabled; the picker still works. */ }
  },[choose])
  const close=(keep=false)=>{
    if(keep){try{localStorage.setItem(BACKGROUND_STORAGE_KEY,selected)}catch{}}
    else choose(beforePreview.current)
    setOpen(false);trigger.current?.focus()
  }
  useEffect(()=>{
    if(!open)return
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){choose(beforePreview.current);setOpen(false);trigger.current?.focus()}}
    window.addEventListener('keydown',escape)
    return()=>window.removeEventListener('keydown',escape)
  },[open,choose])
  useEffect(()=>{if(open)selectedCard.current?.scrollIntoView({block:'nearest'})},[open,theme])

  return <div className="galaxy-picker">
    <button ref={trigger} className="galaxy-picker-trigger" aria-expanded={open} aria-controls="galaxy-library" onClick={()=>{if(open)close();else{beforePreview.current=selected;setOpen(true)}}}>
      <Sparkles size={14}/><span>Galaxy backgrounds</span><small>40</small>
    </button>
    {open&&<section id="galaxy-library" className="galaxy-library" role="dialog" aria-modal="false" aria-labelledby="galaxy-library-title">
      <header className="galaxy-library-header"><div><p>THE NIGHT COLLECTION</p><h2 id="galaxy-library-title">Choose your universe.</h2></div><button className="galaxy-close" aria-label="Cancel background preview" onClick={()=>close()}><X size={18}/></button></header>
      <p className="galaxy-library-intro">40 night skies. Preview one behind your globe.</p>
      <div className="galaxy-filter"><label htmlFor="galaxy-theme">Explore by theme</label><select id="galaxy-theme" value={theme} onChange={event=>setTheme(event.target.value)}><option>All themes</option>{GALAXY_THEMES.map(item=><option key={item}>{item}</option>)}</select><span>{options.length} backgrounds</span></div>
      <div className="galaxy-options" role="group" aria-label="Background previews">
        {options.map(background=><button key={background.id} ref={selected===background.id?selectedCard:undefined} className="galaxy-option" aria-pressed={selected===background.id} aria-label={`${background.id.replace('galaxy-','')}. ${background.name}. ${background.theme}`} onClick={()=>choose(background.id)}>
          <span className="galaxy-option-image"><img src={background.thumbnail} alt="" width={640} height={360} loading="lazy" decoding="async"/><small>{background.id.replace('galaxy-','')}</small>{background.width&&<span className="galaxy-resolution">{background.width>=3840?'4K':background.width>=2560?'QHD':'HD'}</span>}{selected===background.id&&<i><Check size={14}/></i>}</span>
          <span className="galaxy-option-name">{background.name}</span><span className="galaxy-option-theme">{background.theme}</span>
        </button>)}
      </div>
      <footer className="galaxy-library-footer">
        <div aria-live="polite" className="galaxy-current"><strong>{current.name}</strong><span>{status==='loading'?'Loading HD preview…':status==='error'?'Preview unavailable. Your previous sky is still showing.':`${current.width?`${current.width} × ${current.height} · `:''}${current.theme}`}</span></div>
        <button className="galaxy-keep" onClick={()=>close(true)} disabled={status!=='ready'}>{status==='loading'?<LoaderCircle size={14} className="galaxy-spinner"/>:<Check size={14}/>} Keep this background</button>
        <button className="galaxy-credits-toggle" aria-expanded={credits} onClick={()=>setCredits(!credits)}>Image credits</button>
        {credits&&<p className="galaxy-credits">{current.credit} · {current.source?<a href={current.source} target="_blank" rel="noreferrer">View original image</a>:'Original cinematic artwork'}</p>}
      </footer>
    </section>}
  </div>
}
