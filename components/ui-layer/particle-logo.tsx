'use client'

import { useEffect, useId, useRef, useState, type Ref } from 'react'
import { BRAND_LOGO_PATHS } from '@/lib/brand-logo'
import { LOGO_COMPLETE_AT, LOGO_STAGE_ENDS, logoNoiseFrame, logoNoiseMotion } from '@/lib/logo-particles'

let grainTexture:Promise<string>|undefined
function cachedGrainTexture() {
  if(!grainTexture)grainTexture=new Promise<string>((resolve,reject)=>{
    const image=new Image()
    image.onload=()=>{
      try{
        const canvas=document.createElement('canvas');canvas.width=990;canvas.height=582
        const context=canvas.getContext('2d');if(!context)throw new Error('Canvas unavailable')
        context.drawImage(image,0,0);resolve(canvas.toDataURL('image/png'))
      }catch(error){reject(error)}
    }
    image.onerror=()=>reject(new Error('Grain texture unavailable'))
    image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="990" height="582" viewBox="0 0 330 194"><defs><filter id="grain" x="0" y="0" width="330" height="194" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.48 0.62" numOctaves="2" seed="12" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter></defs><rect width="330" height="194" filter="url(#grain)"/></svg>')
  })
  return grainTexture
}

/** Reuse one grain bitmap so animation never regenerates the turbulence field. */
export function LogoNoiseArtwork({frame=logoNoiseFrame(0),maskId='brand-grain',artworkRef,texture}:{frame?:ReturnType<typeof logoNoiseFrame>;maskId?:string;artworkRef?:Ref<SVGSVGElement>;texture?:string}) {
  const filterId=`${maskId}-texture`
  const sheenId=`${maskId}-sheen`
  return <svg ref={artworkRef} viewBox="0 0 330 194" className="brand-logo-grain" aria-hidden="true">
    <defs>
      <filter id={filterId} x="0" y="0" width="330" height="194" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        {texture?<feImage href={texture} x="0" y="0" width="330" height="194" preserveAspectRatio="none"/>:<feTurbulence type="fractalNoise" baseFrequency="0.48 0.62" numOctaves="2" seed="12" stitchTiles="stitch"/>}
        <feColorMatrix type="saturate" values="0"/>
        <feOffset data-noise-drift="true" dx="0" dy="0"/>
        <feComponentTransfer>
          <feFuncR data-noise-channel="true" type="linear" slope="42" intercept={-frame.threshold*42}/>
          <feFuncG data-noise-channel="true" type="linear" slope="42" intercept={-frame.threshold*42}/>
          <feFuncB data-noise-channel="true" type="linear" slope="42" intercept={-frame.threshold*42}/>
          <feFuncA type="linear" slope="0" intercept="1"/>
        </feComponentTransfer>
      </filter>
      <mask id={maskId} x="0" y="0" width="330" height="194" maskUnits="userSpaceOnUse" style={{maskType:'luminance'}}><rect width="330" height="194" filter={`url(#${filterId})`}/></mask>
      <linearGradient id={sheenId} data-noise-sheen-gradient="true" x1="0" y1="-35" x2="0" y2="35" gradientUnits="userSpaceOnUse" gradientTransform="translate(0,-80)"><stop offset="0" stopColor="white" stopOpacity="0"/><stop offset="0.5" stopColor="white" stopOpacity="1"/><stop offset="1" stopColor="white" stopOpacity="0"/></linearGradient>
    </defs>
    <g fill="black" fillRule="evenodd">{BRAND_LOGO_PATHS.map((d,i)=><path key={i} d={d}/>)}</g>
    <g data-noise-fill="true" fill="white" fillRule="evenodd" mask={`url(#${maskId})`} opacity={frame.opacity}>{BRAND_LOGO_PATHS.map((d,i)=><path key={i} d={d}/>)}</g>
    <g data-noise-sheen="true" fill={`url(#${sheenId})`} fillRule="evenodd" mask={`url(#${maskId})`} opacity="0">{BRAND_LOGO_PATHS.map((d,i)=><path key={i} d={d}/>)}</g>
    <g data-noise-outline="true" fill="none" stroke="white" strokeWidth="0.08" opacity={frame.opacity*.08}>{BRAND_LOGO_PATHS.map((d,i)=><path key={i} d={d}/>)}</g>
  </svg>
}

export function ParticleLogo({reduced,onDrawn}:{reduced:boolean;onDrawn:()=>void}) {
  const host=useRef<HTMLDivElement>(null)
  const artwork=useRef<SVGSVGElement>(null)
  const complete=useRef(onDrawn)
  const [texture,setTexture]=useState<string|null>(null)
  complete.current=onDrawn
  const maskId=`logo-grain-${useId().replace(/[^a-zA-Z0-9_-]/g,'')}`
  useEffect(()=>{
    let cancelled=false
    cachedGrainTexture().then(value=>{if(!cancelled)setTexture(value)},()=>{if(!cancelled)setTexture('')})
    return()=>{cancelled=true}
  },[])
  useEffect(()=>{
    if(texture===null)return
    const svg=artwork.current;if(!svg)return
    const channels=svg.querySelectorAll('[data-noise-channel]')
    const fill=svg.querySelector('[data-noise-fill]')
    const outline=svg.querySelector('[data-noise-outline]')
    const drift=svg.querySelector('[data-noise-drift]')
    const sheen=svg.querySelector('[data-noise-sheen]')
    const sheenGradient=svg.querySelector('[data-noise-sheen-gradient]')
    let frame=0,start:number|null=null
    const render=(now:number)=>{
      if(start===null)start=now
      const seconds=reduced?LOGO_COMPLETE_AT:(now-start)/1000
      const grain=logoNoiseFrame(seconds)
      const motion=logoNoiseMotion(seconds)
      channels.forEach(channel=>channel.setAttribute('intercept',String(-grain.threshold*42)))
      fill?.setAttribute('opacity',String(grain.opacity))
      outline?.setAttribute('opacity',String(grain.opacity*.08))
      drift?.setAttribute('dx',String(motion.x))
      drift?.setAttribute('dy',String(motion.y))
      sheen?.setAttribute('opacity',String(grain.opacity*motion.sheenOpacity))
      sheenGradient?.setAttribute('gradientTransform',`translate(0,${motion.sheenY})`)
      const stage=LOGO_STAGE_ENDS.findIndex(end=>seconds<end)
      if(host.current)host.current.dataset.step=String(stage===-1?4:stage+1)
      if(seconds>=LOGO_COMPLETE_AT)complete.current()
      else frame=requestAnimationFrame(render)
    }
    frame=requestAnimationFrame(render)
    return()=>cancelAnimationFrame(frame)
  },[reduced,texture])
  return <div ref={host} className="brand-particle-canvas brand-particle-stage" role="img" aria-label="PRVLG HERITAGE forming through four black-and-white grain stages"><LogoNoiseArtwork artworkRef={artwork} maskId={maskId} texture={texture||undefined}/></div>
}
