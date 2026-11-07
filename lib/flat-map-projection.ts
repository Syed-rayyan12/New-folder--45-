import { WORLD_LAND_PATH, WORLD_MAP_WIDTH, WORLD_MAP_HEIGHT } from './world-land'

// A conventional rectangular Mercator map, using the same coastline as the globe.
export const FLAT_WORLD_SIZE = WORLD_MAP_WIDTH
export function flatMapProject(place:{lat:number;lng:number}) {
  const lat=Math.max(-85.05112878,Math.min(85.05112878,place.lat))*Math.PI/180
  return {x:(place.lng+180)/360*FLAT_WORLD_SIZE,y:(1-Math.log(Math.tan(Math.PI/4+lat/2))/Math.PI)/2*FLAT_WORLD_SIZE}
}
export const FLAT_LAND_PATH=WORLD_LAND_PATH.replace(/([ML])\s*(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/g,(_,command,x,y)=>{
  const p=flatMapProject({lat:90-Number(y)/WORLD_MAP_HEIGHT*180,lng:Number(x)/WORLD_MAP_WIDTH*360-180})
  return `${command}${p.x.toFixed(3)},${p.y.toFixed(3)}`
})
export const FLAT_MERIDIANS=[-150,-120,-90,-60,-30,0,30,60,90,120,150].map(lng=>{
  const {x}=flatMapProject({lat:0,lng})
  return {lng,path:`M${x},0V${FLAT_WORLD_SIZE}`}
})
export const FLAT_PARALLELS=[-75,-60,-30,0,30,60,75].map(lat=>{
  const {y}=flatMapProject({lat,lng:0})
  return {lat,path:`M0,${y}H${FLAT_WORLD_SIZE}`}
})
export function fitFlatMap(width:number,height:number) {
  const ratio=Math.max(1,width)/Math.max(1,height)
  const w=ratio<1?FLAT_WORLD_SIZE*ratio:FLAT_WORLD_SIZE
  const h=w/ratio
  return {x:(FLAT_WORLD_SIZE-w)/2,y:(FLAT_WORLD_SIZE-h)/2,w,h}
}
