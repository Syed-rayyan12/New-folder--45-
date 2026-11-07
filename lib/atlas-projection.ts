import { WORLD_LAND_PATH, WORLD_MAP_WIDTH as W, WORLD_MAP_HEIGHT as H } from './world-land'

/* Robinson projection adapted from d3-geo-projection/src/robinson.js.
Copyright 2013-2021 Mike Bostock
Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.
THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE. */
const rows=[
  [.9986,-.062],[1,0],[.9986,.062],[.9954,.124],[.99,.186],[.9822,.248],
  [.973,.31],[.96,.372],[.9427,.434],[.9216,.4958],[.8962,.5571],
  [.8679,.6176],[.835,.6769],[.7986,.7346],[.7597,.7903],[.7186,.8435],
  [.6732,.8936],[.6213,.9394],[.5722,.9761],[.5322,1],
]
function raw(lat:number,lng:number){
  const band=Math.min(18,Math.abs(lat)/5),index=Math.floor(band),t=band-index
  const a=rows[index],b=rows[index+1],c=rows[Math.min(19,index+2)]
  const value=(axis:number)=>b[axis]+t*(c[axis]-a[axis])/2+t*t*(c[axis]-2*b[axis]+a[axis])/2
  return {x:lng*Math.PI/180*value(0),y:Math.sign(lat)*value(1)*1.593415793900743}
}
const scale=Math.min(W/(2*Math.PI),H/(2*1.593415793900743))
export function atlasProject(place:{lat:number;lng:number}){
  const p=raw(place.lat,place.lng)
  return {x:W/2+p.x*scale,y:H/2-p.y*scale}
}
function line(points:{lat:number;lng:number}[]){return points.map((place,i)=>{const p=atlasProject(place);return `${i?'L':'M'}${p.x.toFixed(3)},${p.y.toFixed(3)}`}).join(' ')}
export const ATLAS_LAND_PATH=WORLD_LAND_PATH.replace(/([ML])\s*(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/g,(_,command,x,y)=>{const p=atlasProject({lat:90-Number(y)/H*180,lng:Number(x)/W*360-180});return `${command}${p.x.toFixed(3)},${p.y.toFixed(3)}`})
export const ATLAS_MERIDIANS=[-150,-120,-90,-60,-30,0,30,60,90,120,150].map(lng=>({lng,path:line(Array.from({length:181},(_,i)=>({lat:i-90,lng})))}))
export const ATLAS_PARALLELS=[-60,-30,0,30,60].map(lat=>({lat,path:line(Array.from({length:181},(_,i)=>({lat,lng:i*2-180})))}))
export const ATLAS_OUTLINE_PATH=line([
  ...Array.from({length:181},(_,i)=>({lat:90-i,lng:-180})),
  ...Array.from({length:181},(_,i)=>({lat:-90,lng:i*2-180})),
  ...Array.from({length:181},(_,i)=>({lat:i-90,lng:180})),
  ...Array.from({length:181},(_,i)=>({lat:90,lng:180-i*2})),
])+'Z'
