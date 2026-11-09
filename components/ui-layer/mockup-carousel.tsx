'use client'

import { useEffect, useRef, useState } from 'react'
import type { MockupAsset } from '@/lib/mockups'
import { MockupGraphic } from './mockup-graphic'
import dynamic from 'next/dynamic'

const Mockup3DViewer=dynamic(()=>import('./mockup-3d-viewer'),{ssr:false,loading:()=> <span className="mockup-model-loading" role="status">Preparing 3D garment...</span>})

// Space between the front slide and each rear slide at rest, in screen pixels.
const MOCKUP_GAP_PX = 20

function orbitRadius(width:number) {
  // Match the 1050px CSS perspective, 66% slide width, and rear-image scale.
  const perspective = 1050
  const frontHalfWidth = width * 0.66 / 2
  const rearHalfWidth = frontHalfWidth * 0.535
  const edge = frontHalfWidth + MOCKUP_GAP_PX
  return perspective * (edge + rearHalfWidth) /
    (perspective * Math.sin(2 * Math.PI / 3) - edge * 1.5)
}

const frontIndex=(rotation:number,count:number)=>((Math.round(-rotation/(360/count))%count)+count)%count
const nearestRotation=(rotation:number,index:number,count:number)=>{const target=-index*(360/count);return target+Math.round((rotation-target)/360)*360}

/** Full circular orbit of original images; mouse drag can continue across any number of turns. */
export function MockupCarousel({assets,asset,color,seed,replay,onChoose}:{assets:MockupAsset[];asset:MockupAsset;color:string;seed:number;replay:number;onChoose:(asset:MockupAsset)=>void}) {
  const count=assets.length,step=360/count,index=Math.max(0,assets.findIndex(item=>item.id===asset.id))
  const [rotation,setRotation]=useState(-index*step)
  const rotationRef=useRef(rotation)
  const [radius,setRadius]=useState(160)
  const [dragging,setDragging]=useState(false)
  const [zoom,setZoom]=useState(1)
  const [productRotation,setProductRotation]=useState({x:0,y:0})
  const productRef=useRef(productRotation)
  const turnProduct=(value:{x:number;y:number})=>{productRef.current=value;setProductRotation(value)}
  const [localReplay,setLocalReplay]=useState(0)
  const host=useRef<HTMLDivElement>(null)
  const drag=useRef<{x:number;y:number;rotation:number;product:{x:number;y:number};mode:'product'|'carousel';id:string}|null>(null)
  const rotate=(value:number)=>{rotationRef.current=value;setRotation(value)}
  useEffect(()=>{turnProduct({x:0,y:0})},[asset.id])
  useEffect(()=>{const next=nearestRotation(rotationRef.current,index,count);rotationRef.current=next;setRotation(next)},[index,count])
  useEffect(()=>{
    const element=host.current;if(!element)return
    const observer = new ResizeObserver(entries => {
      const width = entries[0].contentRect.width
      if (width > 0) setRadius(orbitRadius(width))
    })
    observer.observe(element)
    const wheel=(event:WheelEvent)=>{event.preventDefault();setZoom(value=>Math.max(.7,Math.min(1.35,value*Math.exp(-event.deltaY*.001))))}
    element.addEventListener('wheel',wheel,{passive:false})
    return()=>{observer.disconnect();element.removeEventListener('wheel',wheel)}
  },[])
  const select=(item:MockupAsset)=>{const target=assets.findIndex(value=>value.id===item.id);rotate(nearestRotation(rotationRef.current,target,count));if(item.id!==asset.id)onChoose(item)}
  const finish=(cancelled=false)=>{if(!drag.current)return;const current=drag.current;drag.current=null;setDragging(false);if(current.mode==='product'){if(cancelled)turnProduct(current.product);return}const next=cancelled?index:frontIndex(rotationRef.current,count);rotate(nearestRotation(rotationRef.current,next,count));if(!cancelled&&assets[next].id!==asset.id)onChoose(assets[next])}
  return <div ref={host} className={`mockup-carousel is-orbit${dragging?' is-dragging':''}`} role="region" aria-roledescription="carousel" aria-label="360 degree garment carousel. Drag the center garment in any direction to rotate it. Select a rear garment or drag the background to switch. Scroll to zoom; double-click to reset and replay." tabIndex={0}
    onPointerDown={event=>{if(event.button!==0)return;const slide=(event.target as HTMLElement).closest<HTMLElement>('[data-mockup-id]');drag.current={x:event.clientX,y:event.clientY,rotation:rotationRef.current,product:{...productRef.current},mode:slide?.dataset.mockupId===asset.id?'product':'carousel',id:slide?.dataset.mockupId||asset.id};setDragging(true);event.currentTarget.setPointerCapture(event.pointerId)}}
    onPointerMove={event=>{if(!drag.current)return;const current=drag.current;if(current.mode==='product')turnProduct({x:current.product.x-(event.clientY-current.y)*.7,y:current.product.y+(event.clientX-current.x)*.7});else rotate(current.rotation+(event.clientX-current.x)*.7)}}
    onPointerUp={event=>{const current=drag.current;if(!current)return;if(Math.hypot(event.clientX-current.x,event.clientY-current.y)<6&&current.id!==asset.id){drag.current=null;setDragging(false);const item=assets.find(value=>value.id===current.id);if(item)select(item)}else finish();if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId)}}
    onPointerCancel={()=>finish(true)} onLostPointerCapture={()=>finish(true)}
    onDoubleClick={()=>{setLocalReplay(value=>value+1);setZoom(1);turnProduct({x:0,y:0})}}
    onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();const target=rotationRef.current+(event.key==='ArrowRight'?-step:step);rotate(target);const next=frontIndex(target,count);if(assets[next].id!==asset.id)onChoose(assets[next])}if(event.key==='Enter'){event.preventDefault();setLocalReplay(value=>value+1)}}}>
    <div className="mockup-orbit-ring" style={{transform:`translateZ(${-radius}px) rotateY(${rotation}deg)`}}>
      {assets.map((item,i)=>{
        const active=i===index,net=rotation+i*step,front=(Math.cos(net*Math.PI/180)+1)/2
        return <div key={item.id} data-mockup-id={item.id} className={`mockup-orbit-slot${active?' is-active':''}`} role="group" aria-roledescription="slide" aria-label={`${i+1} of ${count}: ${item.name}`} aria-current={active?'true':undefined} style={{transform:`rotateY(${i*step}deg) translateZ(${radius}px)`}}>
          <div className={`mockup-orbit-image${item.modelSrc?' is-model':''}`} style={{transform:`rotateY(${-net}deg) translateY(${item.modelSrc?0:-front*14}px) scale(${(.38+front*.62)*(active&&!item.modelSrc?zoom:1)})`,opacity:.48+front*.52}}>{item.modelSrc?<div className={`mockup-model-shell${active?' is-active':''}`}><Mockup3DViewer asset={item} color={color} seed={seed} replay={active?replay+localReplay:0} active={active}/></div>:<div className="mockup-product-turn" style={{transform:active?`rotateX(${productRotation.x}deg) rotateY(${productRotation.y}deg)`:undefined}}><div className="mockup-product-face is-front"><MockupGraphic asset={item} color={color} seed={seed} replay={active?replay+localReplay:0} showEmblem={active}/></div><div className="mockup-product-face is-back"><MockupGraphic asset={item} color={color} seed={seed} replay={active?replay+localReplay:0} side="back" showEmblem={false}/></div></div>}</div>
        </div>
      })}
    </div>
  </div>
}
