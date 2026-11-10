'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Maximize2, X } from 'lucide-react'
import { DEFAULT_MOCKUPS, GARMENT_COLORS, type MockupAsset } from '@/lib/mockups'
import { useJourney } from '@/lib/store'
import { MockupCarousel } from './mockup-carousel'


export function GarmentWorld() {
  const {origin,destination,emblemSeed,setStage}=useJourney()
  const [assets,setAssets]=useState<MockupAsset[]>(DEFAULT_MOCKUPS)
  const selected=useJourney(s=>s.mockupId)
  const setSelected=useJourney(s=>s.setMockup)
  const color=useJourney(s=>s.mockupColor)
  const setColor=useJourney(s=>s.setMockupColor)
  const monogramColor=useJourney(s=>s.monogramColor)
  const setMonogramColor=useJourney(s=>s.setMonogramColor)
  const [colorTarget,setColorTarget]=useState<'garment'|'monogram'>('garment')
  const editingMonogram=colorTarget==='monogram'
  const selectedColor=editingMonogram?monogramColor:color
  const updateColor=editingMonogram?setMonogramColor:setColor
  const palette=editingMonogram?[
    {name:'Neon green',value:'#63ff34'},{name:'Ice blue',value:'#38dcff'},
    {name:'Electric violet',value:'#ac65ff'},{name:'Hot pink',value:'#ff3cac'},
    {name:'Gold',value:'#ffcd45'},{name:'White',value:'#ffffff'},
    {name:'Orange',value:'#ff7834'},{name:'Red',value:'#ff3d4d'},
  ]:GARMENT_COLORS
  const [replay,setReplay]=useState(0)
  const [open,setOpen]=useState(false)
  const dialog=useRef<HTMLDialogElement>(null)
  const load=async()=>{try{const response=await fetch('/api/mockups',{cache:'no-store'});if(response.ok){const data=await response.json();if(Array.isArray(data.mockups)&&data.mockups.length)setAssets(data.mockups)}}catch{}}
  useEffect(()=>{void load()},[])
  useEffect(()=>{if(open)dialog.current?.showModal()},[open])
  const asset=assets.find(item=>item.id===selected)||assets[0]
  if(!origin||!destination)return null
  const choose=(item:MockupAsset)=>{setSelected(item.id);setReplay(value=>value+1)}
  const carousel=<MockupCarousel assets={assets} asset={asset} color={color} seed={emblemSeed} replay={replay} onChoose={choose}/>
  return <section className="mockup-studio" aria-label="Your garment mockup studio">
    <header className="mockup-studio-heading"><h1>{asset.name}</h1></header>
    <aside className="mockup-color-panel"><h2>Choose your color.</h2>
      <div className="mockup-color-target" role="group" aria-label="Customize color"><button type="button" aria-pressed={!editingMonogram} onClick={()=>setColorTarget('garment')}>Garment</button><button type="button" aria-pressed={editingMonogram} onClick={()=>setColorTarget('monogram')}>Monogram</button></div>
      <div className="mockup-color-swatches" role="group" aria-label={editingMonogram?'Monogram color':'Garment color'}>{palette.map(swatch=><button type="button" key={swatch.value} aria-label={swatch.name} title={swatch.name} aria-pressed={selectedColor===swatch.value} onClick={()=>updateColor(swatch.value)} style={{'--swatch':swatch.value==='original'?'linear-gradient(135deg,#34cc92,#202b24)':swatch.value} as React.CSSProperties}/>)}</div><label className="mockup-custom-color">Custom color<input aria-label={editingMonogram?'Custom monogram color':'Custom garment color'} type="color" value={selectedColor==='original'?'#67f163':selectedColor} onChange={event=>updateColor(event.target.value)}/><span>{selectedColor==='original'?'ORIGINAL':selectedColor.toUpperCase()}</span></label>
      {editingMonogram&&<p className="monogram-glow-caption">Self-lit glow follows your color.</p>}
    </aside>
    <div className={`mockup-center-stage${asset.modelSrc?' has-3d-model':''}${open?' is-hidden':''}`}>{carousel}<button type="button" className="mockup-expand" onClick={()=>setOpen(true)}><Maximize2 size={17}/> Enlarge preview</button></div>
    <aside className="mockup-change-panel"><button type="button" className="mockup-change-button" onClick={()=>choose(assets[(assets.findIndex(item=>item.id===asset.id)+1)%assets.length])}>Change mockup <ArrowRight size={16}/></button></aside>
    <nav className="mockup-globe-return" aria-label="Globe navigation"><button type="button" onClick={()=>setStage('q2')}><ArrowLeft size={12}/> Back to my globe</button></nav>
    {open&&<dialog ref={dialog} className="mockup-inspection" onCancel={()=>setOpen(false)} onClose={()=>setOpen(false)} aria-labelledby="mockup-inspection-title"><header><div><h2 id="mockup-inspection-title">{asset.name}</h2></div><button type="button" onClick={()=>setOpen(false)} aria-label="Close mockup"><X size={20}/></button></header><div className="mockup-inspection-image">{carousel}</div><footer><label className="mockup-modal-color">Garment <input aria-label="Preview garment color" type="color" value={color==='original'?'#67f163':color} onChange={event=>setColor(event.target.value)}/></label><label className="mockup-modal-color">Monogram <input aria-label="Preview monogram color" type="color" value={monogramColor} onChange={event=>setMonogramColor(event.target.value)}/></label><button type="button" onClick={()=>choose(assets[(assets.findIndex(item=>item.id===asset.id)+1)%assets.length])}>Change mockup</button></footer></dialog>}
  </section>
}
