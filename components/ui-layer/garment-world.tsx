'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { DEFAULT_MOCKUPS, GARMENT_COLORS, type MockupAsset } from '@/lib/mockups'
import { useJourney } from '@/lib/store'
import { WaitlistCard } from './waitlist-card'
import { MockupCarousel } from './mockup-carousel'

function BackDesignTabs() {
  const design=useJourney(s=>s.backDesign)
  const setDesign=useJourney(s=>s.setBackDesign)
  return <div className="mockup-back-design"><span>Back design</span><div role="tablist" aria-label="Back print design" onKeyDown={event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return
    event.preventDefault()
    const next=event.key==='Home'?'prvlg':event.key==='End'?'monogram':design==='prvlg'?'monogram':'prvlg'
    setDesign(next)
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-design="${next}"]`)?.focus()
  }}>{(['prvlg','monogram'] as const).map(value=><button key={value} type="button" role="tab" data-design={value} aria-selected={design===value} tabIndex={design===value?0:-1} onClick={()=>setDesign(value)}>{value==='prvlg'?'PRVLG':'Monogram'}</button>)}</div></div>
}

export function GarmentWorld() {
  const {origin,destination,emblemSeed,setStage}=useJourney()
  const assets: MockupAsset[] = DEFAULT_MOCKUPS
  const selected=useJourney(s=>s.mockupId)
  const setSelected=useJourney(s=>s.setMockup)
  const color=useJourney(s=>s.mockupColor)
  const setColor=useJourney(s=>s.setMockupColor)
  const monogramColor=useJourney(s=>s.monogramColor)
  const setMonogramColor=useJourney(s=>s.setMonogramColor)
  const backDesign=useJourney(s=>s.backDesign)
  const backDesignColor=useJourney(s=>s.backDesignColor)
  const setBackDesignColor=useJourney(s=>s.setBackDesignColor)
  const designLabel=backDesign==='prvlg'?'PRVLG logo':'Monogram'
  const [colorTarget,setColorTarget]=useState<'garment'|'monogram'|'design'>('garment')
  const editingMonogram=colorTarget==='monogram'
  const editingDesign=colorTarget==='design'
  const selectedColor=editingDesign?backDesignColor:editingMonogram?monogramColor:color
  const updateColor=editingDesign?setBackDesignColor:editingMonogram?setMonogramColor:setColor
  const palette=colorTarget!=='garment'?[
    {name:'Neon green',value:'#63ff34'},{name:'Ice blue',value:'#38dcff'},
    {name:'Electric violet',value:'#ac65ff'},{name:'Hot pink',value:'#ff3cac'},
    {name:'Gold',value:'#ffcd45'},{name:'White',value:'#ffffff'},
    {name:'Orange',value:'#ff7834'},{name:'Red',value:'#ff3d4d'},
  ]:GARMENT_COLORS
  const [replay,setReplay]=useState(0)
  const [waitlist,setWaitlist]=useState(false)
  const [open,setOpen]=useState(false)
  const dialog=useRef<HTMLDialogElement>(null)
  const heading=useRef<HTMLHeadingElement>(null)
  useEffect(()=>{heading.current?.focus({preventScroll:true})},[])
  useEffect(()=>{if(open)dialog.current?.showModal()},[open])
  const asset=assets.find(item=>item.id===selected)||assets[0]
  if(waitlist)return <WaitlistCard onBack={()=>setWaitlist(false)}/>
  if(!origin||!destination)return null
  const choose=(item:MockupAsset)=>{setSelected(item.id);setReplay(value=>value+1)}
  const carousel=<MockupCarousel assets={assets} asset={asset} color={color} seed={emblemSeed} replay={replay} onChoose={choose}/>
  return <section className="mockup-studio" aria-label="Your garment mockup studio">
    <header className="mockup-studio-heading"><span>YOUR MOCKUP STUDIO</span><h1 ref={heading} tabIndex={-1}>{asset.name}</h1></header>
    <aside className="mockup-color-panel"><BackDesignTabs/><h2>Choose your color.</h2>
      <div className="mockup-color-target" role="group" aria-label="Customize color"><button type="button" aria-pressed={colorTarget==='garment'} onClick={()=>setColorTarget('garment')}>Garment</button><button type="button" aria-pressed={editingMonogram} onClick={()=>setColorTarget('monogram')}>Emblem</button><button type="button" aria-pressed={editingDesign} onClick={()=>setColorTarget('design')}>{designLabel}</button></div>
      <div className="mockup-color-swatches" role="group" aria-label={editingDesign?`${designLabel} color`:editingMonogram?'Emblem color':'Garment color'}>{palette.map(swatch=><button type="button" key={swatch.value} aria-label={swatch.name} title={swatch.name} aria-pressed={selectedColor===swatch.value} onClick={()=>updateColor(swatch.value)} style={{'--swatch':swatch.value==='original'?'linear-gradient(135deg,#34cc92,#202b24)':swatch.value} as React.CSSProperties}/>)}</div><label className="mockup-custom-color">Custom color<input aria-label={editingDesign?`Custom ${designLabel} color`:editingMonogram?'Custom emblem color':'Custom garment color'} type="color" value={selectedColor==='original'?'#67f163':selectedColor} onChange={event=>updateColor(event.target.value)}/><span>{selectedColor==='original'?'ORIGINAL':selectedColor.toUpperCase()}</span></label>
      {editingDesign&&<button type="button" className="mockup-match-emblem" onClick={()=>setBackDesignColor(monogramColor)}>Match emblem color</button>}
      {editingMonogram&&<p className="monogram-glow-caption">Self-lit glow follows your color.</p>}
    </aside>
    <div className={`mockup-center-stage${asset.modelSrc?' has-3d-model':''}${open?' is-hidden':''}`}>{carousel}</div>
    <aside className="mockup-change-panel"><button type="button" className="mockup-change-button" onClick={()=>choose(assets[(assets.findIndex(item=>item.id===asset.id)+1)%assets.length])}>Change mockup <ArrowRight size={16}/></button></aside>
    <button type="button" className="journey-next mockup-waitlist-next" onClick={()=>setWaitlist(true)}>Join the waitlist <ArrowRight size={16}/></button>
    <nav className="mockup-globe-return" aria-label="Globe navigation"><button type="button" onClick={()=>setStage('q2')}><ArrowLeft size={12}/> Back to my globe</button></nav>
    {open&&<dialog ref={dialog} className="mockup-inspection" onCancel={()=>setOpen(false)} onClose={()=>setOpen(false)} aria-labelledby="mockup-inspection-title"><header><div><h2 id="mockup-inspection-title">{asset.name}</h2></div><button type="button" onClick={()=>setOpen(false)} aria-label="Close mockup"><X size={20}/></button></header><div className="mockup-inspection-image">{carousel}</div><footer><BackDesignTabs/><label className="mockup-modal-color">Garment <input aria-label="Preview garment color" type="color" value={color==='original'?'#67f163':color} onChange={event=>setColor(event.target.value)}/></label><label className="mockup-modal-color">Emblem <input aria-label="Preview emblem color" type="color" value={monogramColor} onChange={event=>setMonogramColor(event.target.value)}/></label><label className="mockup-modal-color">{designLabel} <input aria-label={`Preview ${designLabel} color`} type="color" value={backDesignColor} onChange={event=>setBackDesignColor(event.target.value)}/></label><button type="button" onClick={()=>choose(assets[(assets.findIndex(item=>item.id===asset.id)+1)%assets.length])}>Change mockup</button></footer></dialog>}
  </section>
}

