import { Vector3 } from 'three'
import { mulberry32 } from './mark'

export type SacredStroke = { points: Vector3[]; start: number; duration: number; thickness: number }
export const SACRED_FAMILIES = ['Seed of Life', 'Flower of Life', 'Metatron’s Cube', 'Merkaba Star'] as const

/** Exact circles, equilateral triangles and sixfold lattices; no crest ornaments. */
export function buildSacredEmblem(seed: number) {
  const family = seed & 3
  const random = mulberry32(seed)
  const rotation = random() * Math.PI * 2
  const strokes: SacredStroke[] = []
  const point = (x: number, y: number) => new Vector3(x * Math.cos(rotation) - y * Math.sin(rotation), x * Math.sin(rotation) + y * Math.cos(rotation), 0)
  const circle = (x: number, y: number, radius: number, start: number, thickness = 0.012) => {
    strokes.push({ points: Array.from({ length: 121 }, (_, i) => point(x + Math.cos(i / 120 * Math.PI * 2) * radius, y + Math.sin(i / 120 * Math.PI * 2) * radius)), start, duration: 1.3, thickness })
  }
  const line = (a: number[], b: number[], start: number, thickness = 0.01) => strokes.push({ points: [point(a[0], a[1]), point(b[0], b[1])], start, duration: 0.9, thickness })
  const ring = (radius: number) => Array.from({ length: 6 }, (_, i) => [Math.cos(i / 6 * Math.PI * 2) * radius, Math.sin(i / 6 * Math.PI * 2) * radius])
  if (family === 0) {
    circle(0, 0, 0.6, 0.1, 0.016)
    ring(0.6).forEach(([x,y],i) => circle(x,y,0.6,0.45+i*0.22))
    circle(0,0,1.24,2.5,0.018)
    circle(0,0,1.32,3.45,0.008)
  } else if (family === 1) {
    const centers: number[][] = []
    for (let q=-2;q<=2;q++) for (let r=-2;r<=2;r++) if (Math.max(Math.abs(q),Math.abs(r),Math.abs(q+r))<=2) centers.push([0.47*(q+r/2),0.47*Math.sqrt(3)/2*r])
    centers.sort((a,b) => Math.hypot(...a)-Math.hypot(...b))
    centers.forEach(([x,y],i) => circle(x,y,0.47,0.1+i*0.12,0.01))
    circle(0,0,1.45,3.05,0.018)
    circle(0,0,1.52,3.5,0.008)
  } else if (family === 2) {
    const centers = [[0,0],...ring(0.57),...ring(1.14)]
    centers.forEach(([x,y],i) => circle(x,y,0.275,0.1+i*0.1,0.009))
    let index=0
    for (let i=0;i<centers.length;i++) for (let j=i+1;j<centers.length;j++) line(centers[i],centers[j],1.4+index++/78*2.0,0.007)
    circle(0,0,1.46,3.5,0.016)
  } else {
    circle(0,0,0.48,0.1,0.012)
    for (const side of [0,1]) {
      const triangle = Array.from({length:3},(_,i) => [Math.cos(Math.PI/2+side*Math.PI+i*Math.PI*2/3)*1.2,Math.sin(Math.PI/2+side*Math.PI+i*Math.PI*2/3)*1.2])
      triangle.forEach((a,i) => line(a,triangle[(i+1)%3],0.6+side*0.65+i*0.2,0.018))
    }
    const hexagon=ring(0.7)
    hexagon.forEach((a,i) => line(a,hexagon[(i+1)%6],2+i*0.12,0.01))
    circle(0,0,1.3,2.7,0.015)
    circle(0,0,1.42,3.5,0.008)
  }
  // Seeded proportions and symmetric border details make later creations
  // distinct even when the four canonical families cycle around again.
  const borders=1+Math.floor(random()*3)
  const base=1.56+random()*.04
  for(let i=0;i<borders;i++)circle(0,0,base+i*.055,3.55+i*.08,.005+random()*.003)
  const nodes=random()>.5?6:12,nodeRadius=.018+random()*.022,orbit=1.48+random()*.035
  for(let i=0;i<nodes;i++){
    const angle=i/nodes*Math.PI*2
    circle(Math.cos(angle)*orbit,Math.sin(angle)*orbit,nodeRadius,2.7+i/nodes*.6,.0045)
  }
  if(random()>.45)circle(0,0,.12+random()*.11,2.8,.008)
  const weight=.88+random()*.24
  strokes.forEach(stroke=>{stroke.thickness*=weight})
  return { name:SACRED_FAMILIES[family], family, strokes, duration:Math.max(...strokes.map(stroke => stroke.start+stroke.duration)) }
}
