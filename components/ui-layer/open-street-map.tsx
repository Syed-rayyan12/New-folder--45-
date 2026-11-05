'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useJourney } from '@/lib/store'
import { LOCATIONS,getLocation,type Location } from '@/lib/locations'
import { TECH_EARTH_LOCATIONS } from '@/lib/tech-earth-locations'
import { FLAT_WIDTH,FLAT_HEIGHT,routeSegments } from '@/lib/geo'
import { OSM_TILE_URL,mercatorPoint,normalizeOSMView,fitOSMPlaces,type OSMView } from '@/lib/osm-map'

export function OpenStreetMap(){
  const svg=useRef<SVGSVGElement>(null)
  const pointers=useRef(new Map<number,{x:number;y:number}>())
  const [size,setSize]=useState({width:900,height:600})
  const [view,setView]=useState<OSMView>(()=>fitOSMPlaces([],900,600))
  const [hovered,setHovered]=useState<string|null>(null)
  const [tileError,setTileError]=useState(false)
  const {origin,destination,journeyStep,zoomCommand,selectLocation,setReady}=useJourney()
  const world=256*2**view.zoom
  const places=useMemo(()=>{const items=new Map([...LOCATIONS,...TECH_EARTH_LOCATIONS].map(place=>[place.id,place]));for(const id of [origin,destination])if(id)items.set(id,getLocation(id));return [...items.values()]},[origin,destination])
  const segments=useMemo(()=>origin&&destination?routeSegments(getLocation(origin),getLocation(destination),'flat'):[],[origin,destination])
  const zoomAt=useCallback((delta:number,clientX?:number,clientY?:number)=>{
    setView(current=>{const rect=svg.current?.getBoundingClientRect();const x=rect&&clientX!==undefined?clientX-rect.left-rect.width/2:0,y=rect&&clientY!==undefined?clientY-rect.top-rect.height/2:0,oldWorld=256*2**current.zoom,zoom=Math.max(1,Math.min(19,current.zoom+delta)),newWorld=256*2**zoom;return normalizeOSMView({x:current.x+x/oldWorld-x/newWorld,y:current.y+y/oldWorld-y/newWorld,zoom})})
  },[])
  useEffect(()=>{setReady();const element=svg.current;if(!element)return;const observer=new ResizeObserver(entries=>{const box=entries[0].contentRect;setSize({width:Math.max(1,box.width),height:Math.max(1,box.height)})});observer.observe(element);const wheel=(event:WheelEvent)=>{event.preventDefault();zoomAt(-Math.max(-120,Math.min(120,event.deltaY))*.003,event.clientX,event.clientY)};element.addEventListener('wheel',wheel,{passive:false});return()=>{observer.disconnect();element.removeEventListener('wheel',wheel)}},[setReady,zoomAt])
  useEffect(()=>{if(!zoomCommand.sequence)return;if(zoomCommand.action==='reset'){const box=svg.current?.getBoundingClientRect();const places=[origin,destination].filter((id):id is NonNullable<typeof origin>=>Boolean(id)).map(getLocation);setView(fitOSMPlaces(places,box?.width||900,box?.height||600))}else zoomAt(zoomCommand.action==='in'?.5:-.5)},[zoomCommand,zoomAt])
  useEffect(()=>{const places=[origin,destination].filter((id):id is NonNullable<typeof origin>=>Boolean(id)).map(getLocation);const box=svg.current?.getBoundingClientRect();setView(fitOSMPlaces(places,box?.width||900,box?.height||600))},[origin,destination])
  const level=Math.floor(view.zoom),tileScale=2**(view.zoom-level),tileSize=256*tileScale,count=2**level
  const left=view.x*world-size.width/2,top=view.y*world-size.height/2
  const tiles=[]
  for(let x=Math.floor(left/tileSize);x<=Math.floor((left+size.width)/tileSize);x++)for(let y=Math.max(0,Math.floor(top/tileSize));y<=Math.min(count-1,Math.floor((top+size.height)/tileSize));y++){
    const wrapped=((x%count)+count)%count,url=OSM_TILE_URL.replace('{z}',String(level)).replace('{x}',String(wrapped)).replace('{y}',String(y))
    tiles.push(<image key={`${level}/${x}/${y}`} href={url} x={x*tileSize-left} y={y*tileSize-top} width={tileSize+.2} height={tileSize+.2} preserveAspectRatio="none" onError={()=>setTileError(true)}/>)
  }
  const screen=(place:{lat:number;lng:number})=>{const p=mercatorPoint(place);let dx=p.x-view.x;dx-=Math.round(dx);return{x:dx*world+size.width/2,y:(p.y-view.y)*world+size.height/2}}
  const choose=(place:Location)=>{selectLocation(place.id);setHovered(null)}
  return <div className="osm-world-map"><svg ref={svg} viewBox={`0 0 ${size.width} ${size.height}`} role="group" aria-label="OpenStreetMap. Drag to pan, scroll or pinch to zoom, select a location dot." tabIndex={0}
    onPointerDown={event=>{if((event.target as Element).closest('[data-place]'))return;pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});event.currentTarget.setPointerCapture(event.pointerId)}}
    onPointerMove={event=>{const previous=pointers.current.get(event.pointerId);if(!previous)return;const before=[...pointers.current.values()];pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});const after=[...pointers.current.values()];if(after.length===2&&before.length===2){const a=Math.hypot(before[0].x-before[1].x,before[0].y-before[1].y),b=Math.hypot(after[0].x-after[1].x,after[0].y-after[1].y);if(a>1&&b>1)zoomAt(Math.log2(b/a),(after[0].x+after[1].x)/2,(after[0].y+after[1].y)/2)}else{const dx=event.clientX-previous.x,dy=event.clientY-previous.y;setView(current=>normalizeOSMView({...current,x:current.x-dx/(256*2**current.zoom),y:current.y-dy/(256*2**current.zoom)}))}}}
    onPointerUp={event=>pointers.current.delete(event.pointerId)} onPointerCancel={event=>pointers.current.delete(event.pointerId)}
    onKeyDown={event=>{if(event.target!==event.currentTarget)return;if(event.key==='+'||event.key==='='){event.preventDefault();zoomAt(.5)}else if(event.key==='-'){event.preventDefault();zoomAt(-.5)}else if(event.key.startsWith('Arrow')){event.preventDefault();setView(current=>normalizeOSMView({...current,x:current.x+(event.key==='ArrowRight'?70:event.key==='ArrowLeft'?-70:0)/(256*2**current.zoom),y:current.y+(event.key==='ArrowDown'?70:event.key==='ArrowUp'?-70:0)/(256*2**current.zoom)}))}}}>
    <rect width={size.width} height={size.height} fill="#c9e0e5"/>{tiles}
    {journeyStep==='connected'&&segments.flatMap((segment,index)=>{const points=segment.map(point=>mercatorPoint({lat:point.y/FLAT_HEIGHT*180,lng:point.x/FLAT_WIDTH*360})),mean=points.reduce((sum,p)=>sum+p.x,0)/points.length,shift=Math.round(view.x-mean);return [-1,0,1].map(copy=><path key={`${index}-${copy}`} d={points.map((p,i)=>`${i?'L':'M'}${(p.x+shift+copy-view.x)*world+size.width/2},${(p.y-view.y)*world+size.height/2}`).join(' ')} className="osm-route"/>)})}
    {places.map(place=>{const p=screen(place);if(p.x< -30||p.x>size.width+30||p.y< -30||p.y>size.height+30)return null;const selected=place.id===origin||place.id===destination,active=hovered===place.id;return <g key={place.id} data-place={place.id} role="button" tabIndex={0} aria-label={`${place.name}, ${place.lat.toFixed(4)}, ${place.lng.toFixed(4)}`} onPointerDown={event=>event.stopPropagation()} onPointerEnter={()=>setHovered(place.id)} onPointerLeave={()=>setHovered(null)} onFocus={()=>setHovered(place.id)} onBlur={()=>setHovered(null)} onClick={()=>choose(place)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();choose(place)}}}><circle cx={p.x} cy={p.y} r="13" fill="transparent"/>{selected&&<circle cx={p.x} cy={p.y} r="9" fill="#67f16344" stroke="#26352b"/>}<circle cx={p.x} cy={p.y} r={selected||active?5:3.5} fill="#8A908C" stroke="#17251c" strokeWidth="1.5"/>{(selected||active)&&<text x={Math.max(45,Math.min(size.width-45,p.x))} y={p.y-15} textAnchor="middle" className="osm-place-label">{place.name}</text>}</g>})}
  </svg><a className="osm-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>{tileError&&<p className="osm-tile-error" role="status">Map tiles could not load. You can still choose a location from the list.</p>}</div>
}
