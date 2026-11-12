'use client'

import { LocationTooltip } from './location-tooltip'
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { FLAT_HEIGHT, FLAT_WIDTH, routeSegments } from '@/lib/geo'
import { LOCATIONS, getLocation, type Location } from '@/lib/locations'
import { TECH_EARTH_LOCATIONS } from '@/lib/tech-earth-locations'
import { useJourney } from '@/lib/store'
import { GLOBE_COLOR } from '@/lib/palette'
import { flatMapProject as project, FLAT_LAND_PATH, FLAT_MERIDIANS, FLAT_PARALLELS, FLAT_WORLD_SIZE, fitFlatMap } from '@/lib/flat-map-projection'

const coordinate=(value:number,north:string,south:string)=>`${Math.abs(value).toFixed(4)}° ${value>=0?north:south}`

/** A genuine SVG map: no camera clipping, image plane, or depth-order ambiguity. */
export function FlatWorldMap() {
  const svg=useRef<SVGSVGElement>(null)
  const patternId='atlas-dots-'+useId().replace(/[^a-zA-Z0-9_-]/g,'')
  const pointers=useRef(new Map<number,{x:number;y:number}>())
  const [view,setView]=useState(()=>fitFlatMap(900,600))
  const [size,setSize]=useState({width:900,height:600})
  const initial=useMemo(()=>fitFlatMap(size.width,size.height),[size.width,size.height])
  const [hovered,setHovered]=useState<string|null>(null)
  const {origin,destination,journeyStep,zoomCommand,reducedMotion,selectLocation,setReady}=useJourney()
  const places=useMemo(()=>{const all=new Map([...LOCATIONS,...TECH_EARTH_LOCATIONS].map(place=>[place.id,place]));for(const id of [origin,destination])if(id)all.set(id,getLocation(id));return [...all.values()]},[origin,destination])
  const segments=useMemo(()=>origin&&destination?routeSegments(getLocation(origin),getLocation(destination),'flat'):[],[origin,destination])
  const routes=useMemo(()=>segments.map(segment=>segment.map((p,i)=>{const point=project({lat:p.y/FLAT_HEIGHT*180,lng:p.x/FLAT_WIDTH*360});return `${i?'L':'M'}${point.x},${point.y}`}).join(' ')),[segments])
  const units=Math.max(view.w/Math.max(1,size.width),view.h/Math.max(1,size.height))
  const zoomAt=useCallback((factor:number,clientX?:number,clientY?:number)=>{
    setView(current=>{
      const rect=svg.current?.getBoundingClientRect()
      const scale=rect?Math.min(rect.width/current.w,rect.height/current.h):1
      const fx=rect&&clientX!==undefined?Math.max(0,Math.min(1,(clientX-rect.left-(rect.width-current.w*scale)/2)/(current.w*scale))):.5
      const fy=rect&&clientY!==undefined?Math.max(0,Math.min(1,(clientY-rect.top-(rect.height-current.h*scale)/2)/(current.h*scale))):.5
      const w=Math.max(20,Math.min(FLAT_WORLD_SIZE*3,current.w*factor)),h=w*current.h/current.w
      return{x:current.x+current.w*fx-w*fx,y:current.y+current.h*fy-h*fy,w,h}
    })
  },[])
  useLayoutEffect(()=>{setReady();const node=svg.current;if(!node)return;const measure=()=>{const r=node.getBoundingClientRect();setSize(previous=>previous.width===r.width&&previous.height===r.height?previous:{width:r.width,height:r.height})};measure();const observer=new ResizeObserver(measure);observer.observe(node);const wheel=(event:WheelEvent)=>{event.preventDefault();zoomAt(Math.exp(Math.max(-120,Math.min(120,event.deltaY))*.0018),event.clientX,event.clientY)};node.addEventListener('wheel',wheel,{passive:false});return()=>{observer.disconnect();node.removeEventListener('wheel',wheel)}},[setReady,zoomAt])
  useEffect(()=>{if(zoomCommand.sequence){if(zoomCommand.action==='reset')setView(initial);else zoomAt(zoomCommand.action==='in'?1/1.2:1.2)}},[zoomCommand,zoomAt,initial])
  useEffect(()=>{setView(initial);setHovered(null)},[initial,origin,destination])
  const choose=(place:Location)=>{selectLocation(place.id);setHovered(null)}
  const currentHover=places.find(place=>place.id===hovered)
  const [hover,setTooltipPlace]=useState<Location|undefined>(undefined)
  useEffect(()=>{if(currentHover){setTooltipPlace(currentHover);return};const timer=window.setTimeout(()=>setTooltipPlace(undefined),300);return()=>window.clearTimeout(timer)},[currentHover])
  const hoverPoint=hover?project(hover):null
  const stop=(id:number)=>{pointers.current.delete(id)}
  return <div className="flat-world-map is-atlas" style={{color:GLOBE_COLOR}}><svg ref={svg} viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} preserveAspectRatio="xMidYMid meet" role="group" aria-label="Interactive flat world map. Drag to pan, scroll or pinch to zoom." tabIndex={0}
    onPointerDown={event=>{if((event.target as Element).closest('[data-place]'))return;pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});event.currentTarget.setPointerCapture(event.pointerId);setHovered(null)}}
    onPointerMove={event=>{const previous=pointers.current.get(event.pointerId);if(!previous)return;const before=[...pointers.current.values()];pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});const after=[...pointers.current.values()];if(after.length===2&&before.length===2){const a=Math.hypot(before[0].x-before[1].x,before[0].y-before[1].y),b=Math.hypot(after[0].x-after[1].x,after[0].y-after[1].y);if(a>1&&b>1)zoomAt(a/b,(after[0].x+after[1].x)/2,(after[0].y+after[1].y)/2)}else{const dx=event.clientX-previous.x,dy=event.clientY-previous.y;setView(v=>{const r=svg.current!.getBoundingClientRect(),scale=Math.min(r.width/v.w,r.height/v.h);return{...v,x:v.x-dx/scale,y:v.y-dy/scale}})}}}
    onPointerUp={event=>stop(event.pointerId)} onPointerCancel={event=>stop(event.pointerId)}
    onKeyDown={event=>{if(event.target!==event.currentTarget)return;if(event.key==='+'||event.key==='='){event.preventDefault();zoomAt(1/1.2)}else if(event.key==='-'){event.preventDefault();zoomAt(1.2)}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();setView(v=>({...v,x:v.x+(event.key==='ArrowLeft'?-1:event.key==='ArrowRight'?1:0)*v.w*.06,y:v.y+(event.key==='ArrowUp'?-1:event.key==='ArrowDown'?1:0)*v.h*.06}))}}}>
    <defs><pattern id={patternId} width={6*units} height={6*units} patternUnits="userSpaceOnUse"><circle cx={3*units} cy={3*units} r={.8*units} fill={GLOBE_COLOR}/></pattern></defs>
    <g className="flat-map-graticule" aria-hidden="true">{FLAT_MERIDIANS.map(line=><path key={line.lng} d={line.path}/>)}{FLAT_PARALLELS.map(line=><path key={line.lat} d={line.path}/>)}</g>
    <path d={FLAT_LAND_PATH} className="flat-map-land" fillRule="evenodd"/>
    <path d={FLAT_LAND_PATH} fill={`url(#${patternId})`} className="atlas-land-dots" fillRule="evenodd" aria-hidden="true"/>
    {journeyStep==='connected'&&routes.map((d,i)=><path key={`${origin}-${destination}-${i}`} d={d} className={`flat-map-connection${reducedMotion?' no-motion':''}`} pathLength={1}/>)}
    <g>{places.map(place=>{const p=project(place),selected=place.id===origin||place.id===destination,active=hovered===place.id;return <g key={place.id} data-place={place.id} role="button" tabIndex={0} aria-label={`${place.name}: ${coordinate(place.lat,'N','S')}, ${coordinate(place.lng,'E','W')}`} onPointerDown={event=>event.stopPropagation()} onPointerEnter={()=>setHovered(place.id)} onPointerLeave={()=>setHovered(null)} onClick={event=>{event.stopPropagation();choose(place)}} onFocus={()=>setHovered(place.id)} onBlur={()=>setHovered(null)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();choose(place)}}}>
      <circle cx={p.x} cy={p.y} r={12*units} fill="transparent"/>{selected&&<circle cx={p.x} cy={p.y} r={9*units} className="flat-map-dot-ring"/>}<circle cx={p.x} cy={p.y} r={(selected||active?5:3.5)*units} className={`flat-map-dot${selected?' is-selected':''}`}/>
    </g>})}</g>

  </svg>{hover&&hoverPoint&&<div className="atlas-hover-tooltip" style={{left:Math.max(8,Math.min(size.width-296,(hoverPoint.x-view.x)/units+(size.width-view.w/units)/2+15)),top:Math.max(8,Math.min(size.height-215,(hoverPoint.y-view.y)/units+(size.height-view.h/units)/2-70))}}><LocationTooltip place={hover} show={Boolean(currentHover)}/></div>}</div>
}
