import { Vector3 } from 'three'
import { mulberry32 } from './mark'

export type SacredStroke = { points: Vector3[]; start: number; duration: number; thickness: number }
export const SACRED_FAMILIES = [
  'Seed of Life', 'Flower of Life', 'Metatron’s Cube', 'Merkaba Star',
  'Vesica Union', 'Trinity Circles', 'Fourfold Seed', 'Fivefold Blossom',
  'Sevenfold Blossom', 'Eightfold Blossom', 'Ninefold Blossom', 'Twelvefold Blossom',
  'Pentagram Seal', 'Octagram Seal', 'Enneagram Seal', 'Decagram Seal',
  'Dodecagram Seal', 'Nested Triangles', 'Square Mandala', 'Spiral Mandala',
  'Torus Rosette', 'Sun Wheel', 'Hexagonal Honeycomb', 'Harmonic Labyrinth',
] as const

/** Seeded circles, star polygons, mandalas and geometric lattices. */
export function buildSacredEmblem(seed: number) {
  const family = (seed >>> 0) % SACRED_FAMILIES.length
  const random = mulberry32(seed)
  const rotation = random() * Math.PI * 2
  const strokes: SacredStroke[] = []
  const point = (x: number, y: number) => new Vector3(x * Math.cos(rotation) - y * Math.sin(rotation), x * Math.sin(rotation) + y * Math.cos(rotation), 0)
  const circle = (x: number, y: number, radius: number, start: number, thickness = 0.012) => {
    strokes.push({ points: Array.from({ length: 121 }, (_, i) => point(x + Math.cos(i / 120 * Math.PI * 2) * radius, y + Math.sin(i / 120 * Math.PI * 2) * radius)), start, duration: 1.3, thickness })
  }
  const line = (a: number[], b: number[], start: number, thickness = 0.01) => strokes.push({ points: [point(a[0], a[1]), point(b[0], b[1])], start, duration: 0.9, thickness })
  const ring = (radius: number) => Array.from({ length: 6 }, (_, i) => [Math.cos(i / 6 * Math.PI * 2) * radius, Math.sin(i / 6 * Math.PI * 2) * radius])
  const polygon=(count:number,radius:number,turn=0)=>Array.from({length:count},(_,i)=>[Math.cos(i/count*Math.PI*2+turn)*radius,Math.sin(i/count*Math.PI*2+turn)*radius])
  const outline=(vertices:number[][],start:number,step=1)=>vertices.forEach((a,i)=>line(a,vertices[(i+step)%vertices.length],start+i/vertices.length*.65,.014))
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
  } else if (family === 3) {
    circle(0,0,0.48,0.1,0.012)
    for (const side of [0,1]) {
      const triangle = Array.from({length:3},(_,i) => [Math.cos(Math.PI/2+side*Math.PI+i*Math.PI*2/3)*1.2,Math.sin(Math.PI/2+side*Math.PI+i*Math.PI*2/3)*1.2])
      triangle.forEach((a,i) => line(a,triangle[(i+1)%3],0.6+side*0.65+i*0.2,0.018))
    }
    const hexagon=ring(0.7)
    hexagon.forEach((a,i) => line(a,hexagon[(i+1)%6],2+i*0.12,0.01))
    circle(0,0,1.3,2.7,0.015)
    circle(0,0,1.42,3.5,0.008)
  } else if (family === 4) {
    circle(-.44,0,.85,.1,.018);circle(.44,0,.85,.6,.018)
    line([0,-.73],[0,.73],1.4,.012);circle(0,0,1.35,2.2,.016)
  } else if (family >= 5 && family <= 11) {
    const count=[3,4,5,7,8,9,12][family-5]
    const orbit=family===5?.48:.72,petal=family===5?.8:.62
    polygon(count,orbit).forEach(([x,y],i)=>circle(x,y,petal,.1+i/count*2.5,.014))
    circle(0,0,.28,2.6,.016);circle(0,0,1.4,3,.018)
    if(family===6)outline(polygon(4,1.2,Math.PI/4),1.5)
  } else if (family >= 12 && family <= 16) {
    const [count,step]=[[5,2],[8,3],[9,4],[10,3],[12,5]][family-12]
    outline(polygon(count,1.32,Math.PI/2),.15,step)
    outline(polygon(count,.65,Math.PI/2+Math.PI/count),1.4)
    circle(0,0,.26,2.5,.014);circle(0,0,1.4,3,.018)
  } else if (family === 17) {
    for(let i=0;i<5;i++)outline(polygon(3,1.38-i*.23,Math.PI/2+i%2*Math.PI),.1+i*.5)
    circle(0,0,1.44,3,.014)
  } else if (family === 18) {
    for(let i=0;i<4;i++)outline(polygon(4,1.35-i*.25,Math.PI/4+i%2*Math.PI/4),.1+i*.5)
    polygon(4,1.3).forEach(([x,y],i)=>circle(x,y,.13,2.5+i*.1,.01))
  } else if (family === 19) {
    for(let arm=0;arm<6;arm++)strokes.push({points:Array.from({length:161},(_,i)=>{const t=i/160,angle=arm*Math.PI/3+t*Math.PI*2;return point(Math.cos(angle)*(.12+1.25*t),Math.sin(angle)*(.12+1.25*t))}),start:.1+arm*.3,duration:1.7,thickness:.014})
    circle(0,0,1.44,3,.018)
  } else if (family === 20) {
    polygon(16,.52).forEach(([x,y],i)=>circle(x,y,.83,.1+i/16*2.5,.012))
    circle(0,0,.32,2.8,.018)
  } else if (family === 21) {
    circle(0,0,.48,.1,.02);circle(0,0,.65,.5,.012)
    polygon(24,1.35).forEach((p,i)=>line(polygon(24,i%2?.85:.7)[i],p,.8+i/24*2,.016))
    outline(polygon(12,1.38),2.8)
  } else if (family === 22) {
    const centers=[[0,0],...ring(.78)]
    centers.forEach(([x,y],i)=>outline(polygon(6,.44).map(([a,b])=>[a+x,b+y]),.1+i*.3))
    circle(0,0,1.35,3,.016)
  } else {
    for(let layer=0;layer<6;layer++){
      const vertices=polygon(12,.3+layer*.2,layer%2*Math.PI/12)
      vertices.slice(0,-1).forEach((p,i)=>line(p,vertices[i+1],.1+layer*.45+i*.02,.014))
      if(layer<5)line(vertices[11],polygon(12,.5+layer*.2,(layer+1)%2*Math.PI/12)[0],.45+layer*.45,.014)
    }
  }
  // Seeded proportions and symmetric border details make later creations
  // distinct within each of the 24 geometric families.
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
