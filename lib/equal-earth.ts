import { WORLD_LAND_PATH, WORLD_MAP_WIDTH as W, WORLD_MAP_HEIGHT as H } from './world-land'

// Equal Earth forward projection, following d3-geo's equalEarthRaw (ISC license).
// https://github.com/d3/d3-geo/blob/main/src/projection/equalEarth.js
const A1=1.340264,A2=-0.081106,A3=0.000893,A4=0.003796,M=Math.sqrt(3)/2
const rad=Math.PI/180
function raw(lat:number,lng:number){
  const t=Math.asin(M*Math.sin(lat*rad)),t2=t*t,t6=t2*t2*t2
  return {x:lng*rad*Math.cos(t)/(M*(A1+3*A2*t2+t6*(7*A3+9*A4*t2))),y:t*(A1+A2*t2+t6*(A3+A4*t2))}
}
const scale=Math.min(W/(raw(0,180).x*2),H/(raw(90,0).y*2))
export function equalEarthProject(place:{lat:number;lng:number}){
  const p=raw(place.lat,place.lng)
  return {x:W/2+p.x*scale,y:H/2-p.y*scale}
}
export function equalEarthLine(points:{lat:number;lng:number}[]){
  return points.map((place,i)=>{const p=equalEarthProject(place);return `${i?'L':'M'}${p.x.toFixed(3)},${p.y.toFixed(3)}`}).join(' ')
}
export const EQUAL_EARTH_LAND_PATH=WORLD_LAND_PATH.replace(/([ML])\s*(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/g,(_,command,x,y)=>{
  const p=equalEarthProject({lat:90-Number(y)/H*180,lng:Number(x)/W*360-180})
  return `${command}${p.x.toFixed(3)},${p.y.toFixed(3)}`
})
export const EQUAL_EARTH_OUTLINE=equalEarthLine([
  ...Array.from({length:181},(_,i)=>({lat:90-i,lng:180})),
  ...Array.from({length:181},(_,i)=>({lat:-90+i,lng:-180})),
])+'Z'
export const EQUAL_EARTH_MERIDIANS=[-150,-120,-90,-60,-30,0,30,60,90,120,150].map(lng=>({lng,path:equalEarthLine(Array.from({length:181},(_,i)=>({lat:i-90,lng})))}))
export const EQUAL_EARTH_PARALLELS=[-60,-30,0,30,60].map(lat=>({lat,path:equalEarthLine(Array.from({length:181},(_,i)=>({lat,lng:i*2-180})))}))
