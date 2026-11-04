'use client'

import { useEffect, useRef, useState } from 'react'
import type { MockupAsset } from '@/lib/mockups'
import { MockupGraphic } from './mockup-graphic'

const clampRotation=(value:number)=>Math.max(-130,Math.min(130,value))

/** Manipulate the supplied photograph directly with the pointer. */
export function MockupImageViewer({asset,color,seed,replay}:{asset:MockupAsset;color:string;seed:number;replay:number}) {
  const [angle,setAngle]=useState(0)
  const [tilt,setTilt]=useState(0)
  const [hover,setHover]=useState(0)
  const [zoom,setZoom]=useState(1)
  const [localReplay,setLocalReplay]=useState(0)
  const surface=useRef<HTMLDivElement>(null)
  const drag=useRef<{x:number;y:number;angle:number;tilt:number}|null>(null)
  useEffect(()=>{setAngle(0);setTilt(0);setHover(0);setZoom(1)},[asset.id,replay])
  useEffect(()=>{
    const element=surface.current
    if(!element)return
    const wheel=(event:WheelEvent)=>{event.preventDefault();setZoom(value=>Math.max(.65,Math.min(1.8,value*Math.exp(-event.deltaY*.001))))}
    element.addEventListener('wheel',wheel,{passive:false})
    return()=>element.removeEventListener('wheel',wheel)
  },[])
  const restart=()=>{setLocalReplay(value=>value+1);setAngle(0);setTilt(0);setHover(0);setZoom(1)}
  return <div className="mockup-image-viewer">
    <div ref={surface} className="mockup-photo-interaction" tabIndex={0} role="group" aria-label="Garment preview. Move to tilt, drag to rotate within 260 degrees, scroll to zoom, double-click to replay reveal. Arrow keys rotate; plus and minus zoom; Enter replays."
      onPointerDown={event=>{if(event.button!==0)return;drag.current={x:event.clientX,y:event.clientY,angle:clampRotation(angle+hover),tilt};setAngle(clampRotation(angle+hover));setHover(0);event.currentTarget.setPointerCapture(event.pointerId)}}
      onPointerMove={event=>{const d=drag.current;if(d){setAngle(clampRotation(d.angle+(event.clientX-d.x)*.65));setTilt(Math.max(-35,Math.min(35,d.tilt-(event.clientY-d.y)*.2)));return}if(event.pointerType==='mouse'){const bounds=event.currentTarget.getBoundingClientRect();setTilt(-((event.clientY-bounds.top)/bounds.height-.5)*16);setHover(((event.clientX-bounds.left)/bounds.width-.5)*18)}}}
      onPointerLeave={()=>{if(!drag.current){setHover(0);setTilt(0)}}}
      onPointerUp={event=>{drag.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId)}}
      onPointerCancel={()=>{drag.current=null;setHover(0)}}
      onDoubleClick={restart}
      onKeyDown={event=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Enter'].includes(event.key))event.preventDefault();if(event.key==='ArrowLeft')setAngle(value=>clampRotation(value-10));if(event.key==='ArrowRight')setAngle(value=>clampRotation(value+10));if(event.key==='ArrowUp')setTilt(value=>Math.min(35,value+5));if(event.key==='ArrowDown')setTilt(value=>Math.max(-35,value-5));if(event.key==='+'||event.key==='=')setZoom(value=>Math.min(1.8,value+.1));if(event.key==='-')setZoom(value=>Math.max(.65,value-.1));if(event.key==='Enter')restart()}}>
      <div className="mockup-photo-rotation" style={{transform:`rotateX(${tilt}deg) rotateY(${clampRotation(angle+hover)}deg) scale(${zoom})`}}><MockupGraphic asset={asset} color={color} seed={seed} replay={replay+localReplay}/></div>
    </div>
  </div>
}
