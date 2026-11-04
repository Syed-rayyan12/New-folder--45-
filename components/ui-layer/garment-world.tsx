'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Maximize2, RefreshCw, X } from 'lucide-react'
import { DEFAULT_MOCKUPS, GARMENT_COLORS, type MockupAsset } from '@/lib/mockups'
import { useJourney } from '@/lib/store'
import { getLocation } from '@/lib/locations'
import { MockupCarousel } from './mockup-carousel'


export function GarmentWorld() {
  const {origin,destination,emblemSeed,setStage}=useJourney()
  const [assets,setAssets]=useState<MockupAsset[]>(DEFAULT_MOCKUPS)
  const selected=useJourney(s=>s.mockupId)
  const setSelected=useJourney(s=>s.setMockup)
  const color=useJourney(s=>s.mockupColor)
  const setColor=useJourney(s=>s.setMockupColor)
  const [replay,setReplay]=useState(0)
  const [open,setOpen]=useState(false)
  const dialog=useRef<HTMLDialogElement>(null)
  const load=async()=>{try{const response=await fetch('/api/mockups',{cache:'no-store'});if(response.ok){const data=await response.json();if(Array.isArray(data.mockups)&&data.mockups.length)setAssets(data.mockups)}}catch{}}
  useEffect(()=>{void load()},[])
  useEffect(()=>{if(open)dialog.current?.showModal()},[open])
  const asset=assets.find(item=>item.id===selected)||assets[0]
  if(!origin||!destination)return null
  const from=getLocation(origin),to=getLocation(destination)
  const choose=(item:MockupAsset)=>{setSelected(item.id);setReplay(value=>value+1)}
  const carousel=<MockupCarousel assets={assets} asset={asset} color={color} seed={emblemSeed} replay={replay} onChoose={choose}/>
  return <section className="mockup-studio" aria-label="Your garment mockup studio">
    <header className="mockup-studio-heading"><span>YOUR SIGNATURE. YOUR SILHOUETTE.</span><h1>{asset.name}</h1><p>{from.name} <ArrowRight size={12}/> {to.name}</p></header>
    <aside className="mockup-color-panel"><span className="mockup-eyebrow">01 / MAKE IT YOURS</span><h2>Choose your color.</h2><div className="mockup-color-swatches" role="group" aria-label="Garment color">{GARMENT_COLORS.map(swatch=><button type="button" key={swatch.value} aria-label={swatch.name} title={swatch.name} aria-pressed={color===swatch.value} onClick={()=>setColor(swatch.value)} style={{'--swatch':swatch.value==='original'?'linear-gradient(135deg,#34cc92,#202b24)':swatch.value} as React.CSSProperties}/>)}</div><label className="mockup-custom-color">Custom color<input type="color" value={color==='original'?'#67f163':color} onChange={event=>setColor(event.target.value)}/><span>{color==='original'?'ORIGINAL':color.toUpperCase()}</span></label><p>Colors update on your mockup instantly.</p><button type="button" className="mockup-text-button" onClick={()=>setColor('original')}>Use original color</button></aside>
    <div className={`mockup-center-stage${open?' is-hidden':''}`}>{carousel}<button type="button" className="mockup-expand" onClick={()=>setOpen(true)}><Maximize2 size={12}/> Enlarge preview</button></div>
    <aside className="mockup-change-panel"><span className="mockup-eyebrow">02 / FIND YOUR FORM</span><button type="button" className="mockup-change-button" onClick={()=>choose(assets[(assets.findIndex(item=>item.id===asset.id)+1)%assets.length])}>Change mockup <ArrowRight size={16}/></button><button type="button" className="mockup-text-button" onClick={()=>setStage('reveal')}><RefreshCw size={13}/> Create a new emblem</button><p>One emblem. Your own expression.</p></aside>
    <footer className="mockup-studio-footer"><button type="button" onClick={()=>setStage('q2')}><ArrowLeft size={12}/> Back to my globe</button><span>{emblemSeed.toString(16).toUpperCase().padStart(8,'0')} / YOUR UNIQUE SIGNATURE</span></footer>
    {open&&<dialog ref={dialog} className="mockup-inspection" onCancel={()=>setOpen(false)} onClose={()=>setOpen(false)} aria-labelledby="mockup-inspection-title"><header><div><span>ORIGINAL IMAGE STUDIO</span><h2 id="mockup-inspection-title">{asset.name}</h2></div><button type="button" onClick={()=>setOpen(false)} aria-label="Close mockup"><X size={20}/></button></header><div className="mockup-inspection-image">{carousel}</div><footer><label className="mockup-modal-color">Color <input type="color" value={color==='original'?'#67f163':color} onChange={event=>setColor(event.target.value)}/></label><button type="button" onClick={()=>choose(assets[(assets.findIndex(item=>item.id===asset.id)+1)%assets.length])}>Change mockup</button></footer></dialog>}
  </section>
}
