'use client'

import { useRef } from 'react'
import { GarmentEditor } from './garment-editor'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { WORLD_GARMENTS } from '@/lib/garment-world'
import { getLocation } from '@/lib/locations'
import { useJourney } from '@/lib/store'

export function GarmentWorld() {
  const { origin,destination,emblemSeed,garmentIndex,selectGarment,setStage }=useJourney()
  const editorOpen=useJourney(s=>s.editorOpen)
  const swipe=useRef<number | null>(null)
  if (!origin || !destination) return null
  const from=getLocation(origin), to=getLocation(destination)
  const look=WORLD_GARMENTS[garmentIndex]
  const serial=emblemSeed.toString(16).toUpperCase().padStart(8,'0')
  return <section className="garment-world" aria-label="PRVLG garment world">
    <div className="world-swipe" onPointerDown={e=>{swipe.current=e.clientX;e.currentTarget.setPointerCapture(e.pointerId)}} onPointerUp={e=>{
      if(swipe.current!==null) { if(Math.abs(e.clientX-swipe.current)>45)selectGarment(garmentIndex+(e.clientX<swipe.current?1:-1)); else useJourney.setState({editorOpen:true}) }
      swipe.current=null
    }} onPointerCancel={()=>{swipe.current=null}} />
    <div className="world-slider" role="region" aria-roledescription="carousel" aria-label="Garment concepts" tabIndex={0} onKeyDown={e=>{
      if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();selectGarment(garmentIndex+(e.key==='ArrowRight'?1:-1))}
    }}>
      <div className="world-look-copy" aria-live="polite" aria-atomic="true"><span>{look.category} / CONCEPT {look.id}</span><h2>{look.name}</h2><p>{look.detail}</p></div>
      <button className="statement-trigger" onClick={()=>useJourney.setState({editorOpen:true})}>Open in 3D</button><div className="world-slider-controls"><button aria-label="Previous garment" onClick={()=>selectGarment(garmentIndex-1)}><ArrowLeft size={18}/></button><span>{look.id} <i>/ 03</i></span><button aria-label="Next garment" onClick={()=>selectGarment(garmentIndex+1)}><ArrowRight size={18}/></button></div>
      <div className="world-slider-dots">{WORLD_GARMENTS.map((item,i)=><button key={item.id} aria-label={`Show ${item.name}`} aria-pressed={garmentIndex===i} onClick={()=>selectGarment(i)}/>)}</div>
    </div>
    {editorOpen && <GarmentEditor onClose={()=>useJourney.setState({editorOpen:false})}/>}
    <footer className="world-footer"><button onClick={()=>setStage('q2')}><ArrowLeft size={12}/> Back to my globe</button><span>{from.code} → {to.code} / {serial}</span><span>VISIBLE BY DAY. REVEALED BY NIGHT.</span></footer>
  </section>
}
