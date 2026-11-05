export const OSM_TILE_SIZE=256
export const OSM_TILE_URL=process.env.NEXT_PUBLIC_OSM_TILE_URL||'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
export type OSMView={x:number;y:number;zoom:number}
export function mercatorPoint(place:{lat:number;lng:number}){
  const lat=Math.max(-85.05112878,Math.min(85.05112878,place.lat))*Math.PI/180
  return {x:(place.lng+180)/360,y:Math.max(0,Math.min(1,(1-Math.asinh(Math.tan(lat))/Math.PI)/2))}
}
export function normalizeOSMView(view:OSMView):OSMView{
  return {x:((view.x%1)+1)%1,y:Math.max(0,Math.min(1,view.y)),zoom:Math.max(1,Math.min(19,view.zoom))}
}
export function fitOSMPlaces(places:{lat:number;lng:number}[],width:number,height:number):OSMView{
  if(!places.length)return {...mercatorPoint({lat:20,lng:0}),zoom:2}
  const a=mercatorPoint(places[0]);if(places.length===1)return {...a,zoom:4}
  const b=mercatorPoint(places[1]);let dx=b.x-a.x;if(dx>.5)dx-=1;if(dx<-.5)dx+=1
  const spanX=Math.max(.0001,Math.abs(dx)),spanY=Math.max(.0001,Math.abs(b.y-a.y))
  const zoom=Math.min(Math.log2(Math.max(80,width-100)/(256*spanX)),Math.log2(Math.max(80,height-100)/(256*spanY)))
  return normalizeOSMView({x:a.x+dx/2,y:(a.y+b.y)/2,zoom:Math.max(1,Math.min(15,zoom))})
}
