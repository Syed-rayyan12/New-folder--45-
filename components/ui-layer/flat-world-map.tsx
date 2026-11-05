'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { WORLD_MAP_WIDTH as W, WORLD_MAP_HEIGHT as H } from '@/lib/world-land'
import { FLAT_HEIGHT, FLAT_WIDTH, routeSegments } from '@/lib/geo'
import { LOCATIONS, getLocation, type Location } from '@/lib/locations'
import { TECH_EARTH_LOCATIONS } from '@/lib/tech-earth-locations'
import { useJourney } from '@/lib/store'
import { equalEarthProject as project, EQUAL_EARTH_LAND_PATH, EQUAL_EARTH_OUTLINE, EQUAL_EARTH_MERIDIANS, EQUAL_EARTH_PARALLELS } from '@/lib/equal-earth'

const INITIAL={x:-48,y:-36,w:W+96,h:H+72}
const coordinate=(value:number,north:string,south:string)=>`${Math.abs(value).toFixed(4)}° ${value>=0?north:south}`

/** A genuine SVG map: no camera clipping, image plane, or depth-order ambiguity. */
export function FlatWorldMap() {
  const svg=useRef<SVGSVGElement>(null)
  const pointers=useRef(new Map<number,{x:number;y:number}>())
  const [view,setView]=useState(INITIAL)
  const [size,setSize]=useState({width:900,height:600})
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
      const w=Math.max(20,Math.min(INITIAL.w*3,current.w*factor)),h=w*INITIAL.h/INITIAL.w
      return{x:current.x+current.w*fx-w*fx,y:current.y+current.h*fy-h*fy,w,h}
    })
  },[])
  useEffect(()=>{setReady();const node=svg.current;if(!node)return;const observer=new ResizeObserver(entries=>{const r=entries[0].contentRect;setSize({width:r.width,height:r.height})});observer.observe(node);const wheel=(event:WheelEvent)=>{event.preventDefault();zoomAt(Math.exp(Math.max(-120,Math.min(120,event.deltaY))*.0018),event.clientX,event.clientY)};node.addEventListener('wheel',wheel,{passive:false});return()=>{observer.disconnect();node.removeEventListener('wheel',wheel)}},[setReady,zoomAt])
  useEffect(()=>{if(zoomCommand.sequence){if(zoomCommand.action==='reset')setView(INITIAL);else zoomAt(zoomCommand.action==='in'?1/1.2:1.2)}},[zoomCommand,zoomAt])
  useEffect(()=>{setView(INITIAL);setHovered(null)},[origin,destination])
  const choose=(place:Location)=>{selectLocation(place.id);setHovered(null)}
  const hover=places.find(place=>place.id===hovered)
  const hoverPoint=hover?project(hover):null
  const stop=(id:number)=>{pointers.current.delete(id)}
  return <div className="flat-world-map"><svg ref={svg} viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} preserveAspectRatio="xMidYMid meet" role="group" aria-label="Interactive Equal Earth world map. Drag to pan, scroll or pinch to zoom." tabIndex={0}
    onPointerDown={event=>{if((event.target as Element).closest('[data-place]'))return;pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});event.currentTarget.setPointerCapture(event.pointerId);setHovered(null)}}
    onPointerMove={event=>{const previous=pointers.current.get(event.pointerId);if(!previous)return;const before=[...pointers.current.values()];pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});const after=[...pointers.current.values()];if(after.length===2&&before.length===2){const a=Math.hypot(before[0].x-before[1].x,before[0].y-before[1].y),b=Math.hypot(after[0].x-after[1].x,after[0].y-after[1].y);if(a>1&&b>1)zoomAt(a/b,(after[0].x+after[1].x)/2,(after[0].y+after[1].y)/2)}else{const dx=event.clientX-previous.x,dy=event.clientY-previous.y;setView(v=>{const r=svg.current!.getBoundingClientRect(),scale=Math.min(r.width/v.w,r.height/v.h);return{...v,x:v.x-dx/scale,y:v.y-dy/scale}})}}}
    onPointerUp={event=>stop(event.pointerId)} onPointerCancel={event=>stop(event.pointerId)}
    onKeyDown={event=>{if(event.target!==event.currentTarget)return;if(event.key==='+'||event.key==='='){event.preventDefault();zoomAt(1/1.2)}else if(event.key==='-'){event.preventDefault();zoomAt(1.2)}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();setView(v=>({...v,x:v.x+(event.key==='ArrowLeft'?-1:event.key==='ArrowRight'?1:0)*v.w*.06,y:v.y+(event.key==='ArrowUp'?-1:event.key==='ArrowDown'?1:0)*v.h*.06}))}}}>
    <path d={EQUAL_EARTH_OUTLINE} className="equal-earth-ocean"/>
    <g className="flat-map-graticule" aria-hidden="true">{EQUAL_EARTH_MERIDIANS.map(line=><path key={line.lng} d={line.path}/>)}{EQUAL_EARTH_PARALLELS.map(line=><path key={line.lat} d={line.path}/>)}</g>
    <path d={EQUAL_EARTH_LAND_PATH} className="flat-map-land" fillRule="evenodd"/>
    {journeyStep==='connected'&&routes.map((d,i)=><path key={`${origin}-${destination}-${i}`} d={d} className={`flat-map-connection${reducedMotion?' no-motion':''}`} pathLength={1}/>)}
    <g>{places.map(place=>{const p=project(place),selected=place.id===origin||place.id===destination,active=hovered===place.id;return <g key={place.id} data-place={place.id} role="button" tabIndex={0} aria-label={`${place.name}: ${coordinate(place.lat,'N','S')}, ${coordinate(place.lng,'E','W')}`} onPointerDown={event=>event.stopPropagation()} onPointerEnter={()=>setHovered(place.id)} onPointerLeave={()=>setHovered(null)} onClick={event=>{event.stopPropagation();choose(place)}} onFocus={()=>setHovered(place.id)} onBlur={()=>setHovered(null)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();choose(place)}}}>
      <circle cx={p.x} cy={p.y} r={12*units} fill="transparent"/>{selected&&<circle cx={p.x} cy={p.y} r={9*units} className="flat-map-dot-ring"/>}<circle cx={p.x} cy={p.y} r={(selected||active?5:3.5)*units} className={`flat-map-dot${selected?' is-selected':''}`}/>
      {selected&&!active&&<text x={p.x} y={p.y+(place.id===origin?22:-14)*units} fontSize={11*units} textAnchor="middle" className="flat-map-place-label">{place.name}</text>}
    </g>})}</g>
    {hover&&hoverPoint&&<g pointerEvents="none" transform={`translate(${Math.min(view.x+view.w-242*units,Math.max(view.x+5*units,hoverPoint.x+15*units))},${Math.max(view.y+5*units,hoverPoint.y-70*units)})`} className="flat-map-tooltip"><rect width={225*units} height={62*units} rx={5*units}/><text x={12*units} y={23*units} fontSize={12*units}>{hover.name}</text><text x={12*units} y={45*units} fontSize={9*units}>{coordinate(hover.lat,'N','S')} / {coordinate(hover.lng,'E','W')}</text></g>}
  </svg></div>
}
