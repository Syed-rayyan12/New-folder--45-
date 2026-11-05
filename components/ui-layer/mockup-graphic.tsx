'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { BRAND_LOGO_PATHS } from '@/lib/brand-logo'
import { buildSacredEmblem } from '@/lib/sacred-emblem'
import type { MockupAsset } from '@/lib/mockups'

export function MockupGraphic({asset,color,seed,replay=0,onOpen,large=false,reveal,showEmblem=true,side='front'}:{asset:MockupAsset;color:string;seed:number;replay?:number;onOpen?:()=>void;large?:boolean;reveal?:number;showEmblem?:boolean;side?:'front'|'back'}) {
  const host=useRef<HTMLDivElement>(null)
  const [space,setSpace]=useState({width:430,height:550})
  const [info,setInfo]=useState({width:asset.width||1000,height:asset.height||1200,bounds:asset.bounds,gain:asset.tintGain||1.5})
  const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading')
  const filter=useId().replace(/:/g,'')
  const emblem=useMemo(()=>buildSacredEmblem(seed),[seed])
  useEffect(()=>{if(!host.current)return;const observer=new ResizeObserver(entries=>{const rect=entries[0].contentRect;setSpace({width:rect.width,height:rect.height})});observer.observe(host.current);return()=>observer.disconnect()},[])
  useEffect(()=>{
    let cancelled=false
    setStatus('loading')
    const image=new Image()
    image.onload=()=>{
      if(cancelled)return
      let bounds=asset.bounds
      if(!bounds){
        const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight
        const context=canvas.getContext('2d',{willReadFrequently:true})
        if(context){context.drawImage(image,0,0);const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;let x0=canvas.width,y0=canvas.height,x1=-1,y1=-1;for(let y=0;y<canvas.height;y+=2)for(let x=0;x<canvas.width;x+=2)if(pixels[(y*canvas.width+x)*4+3]>20){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)}if(x1>=x0)bounds=[x0,y0,x1-x0+2,y1-y0+2]}
      }
      setInfo({width:image.naturalWidth,height:image.naturalHeight,bounds:bounds||[0,0,image.naturalWidth,image.naturalHeight],gain:asset.tintGain||1.5});setStatus('ready')
    }
    image.onerror=()=>{if(!cancelled)setStatus('error')}
    image.src=asset.src
    return()=>{cancelled=true}
  },[asset])
  const [x,y,w,h]=info.bounds||[0,0,info.width,info.height]
  const rgb=color==='original'?[1,1,1]:color.match(/\w\w/g)?.map(channel=>parseInt(channel,16)/255)||[1,1,1]
  const dark=color==='original'?info.gain>1.6:rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722<.5
  const radius=Math.max(...emblem.strokes.flatMap(stroke=>stroke.points.map(p=>Math.hypot(p.x,p.y))))
  const ratio=(w+12)/(h+12),drawWidth=Math.min(space.width,space.height*ratio)
  return <div ref={host} className={`mockup-graphic${large?' is-large':''}`}>
    {status==='loading'&&<span className="mockup-loading" role="status">Loading your mockup…</span>}
    {status==='error'?<p className="mockup-loading" role="alert">This mockup could not load. Choose another image.</p>:<div key={`${asset.id}-${replay}`} className={`mockup-build${status==='ready'?' is-ready':''}`} style={{width:drawWidth,height:drawWidth/ratio,flex:'none',...(reveal===undefined?{}:{animation:'none',clipPath:`inset(0 0 ${100-reveal}% 0)`})}}>
      <svg viewBox={`${x-6} ${y-6} ${w+12} ${h+12}`} className="mockup-product-image" role="img" aria-label={`${asset.name} in ${color==='original'?'its original color':color}`} onClick={onOpen}>
        <defs><filter id={filter} colorInterpolationFilters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope={rgb[0]*info.gain}/><feFuncG type="linear" slope={rgb[1]*info.gain}/><feFuncB type="linear" slope={rgb[2]*info.gain}/></feComponentTransfer></filter></defs>
        <image href={side==='back'?(asset.backSrc||asset.src):asset.src} width={info.width} height={info.height} filter={color==='original'?undefined:`url(#${filter})`}/>
      </svg>
      {side==='front'&&showEmblem&&<svg key={seed} className="mockup-live-emblem" viewBox={`${-radius-.06} ${-radius-.06} ${(radius+.06)*2} ${(radius+.06)*2}`} style={{color:dark?'#f3f0e8':'#19241b',...(asset.frontPrint?{left:`${asset.frontPrint.left}%`,top:`${asset.frontPrint.top}%`,width:`${asset.frontPrint.width}%`}: {})}}  role="img" aria-label={`Your unique ${emblem.name} emblem`}><g transform="scale(1,-1)">{emblem.strokes.map((stroke,i)=><polyline key={i} points={stroke.points.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="currentColor" strokeWidth={stroke.thickness*1.7} strokeLinecap="round" strokeLinejoin="round"/>)}</g></svg>}
      {side==='back'&&<svg className="mockup-back-logo" viewBox="0 0 330 194" role="img" aria-label="PRVLG Heritage back print" style={{color:dark?'#f3f0e8':'#19241b'}}>{BRAND_LOGO_PATHS.map((d,i)=><path key={i} d={d} fill="currentColor"/>)}</svg>}
      <i className="mockup-build-line" aria-hidden="true"/>
    </div>}
  </div>
}
