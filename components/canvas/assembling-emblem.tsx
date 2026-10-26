'use client'

import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CatmullRomCurve3, ExtrudeGeometry, Group, MathUtils, Matrix4, Mesh, Shape, TubeGeometry, Vector3 } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { mulberry32 } from '@/lib/mark'
import { useJourney } from '@/lib/store'

type Stroke = { points: Vector3[]; start: number; duration: number; thickness: number }
function buildCrest(seed: number): Stroke[] {
  const random = mulberry32(seed)
  const strokes: Stroke[] = []
  const add = (xy: number[][], start: number, duration = 1.5, thickness = 0.025, z = 0) => strokes.push({ points: xy.map(([x,y]) => new Vector3(x,y,z)), start, duration, thickness })
  const family = seed & 3
  const width = .92 + random() * .14
  const frames = [
    [[0,1.48],[.6,1.3],[1.05,1.15],[1.03,.25],[.83,-.55],[0,-1.5],[-.83,-.55],[-1.03,.25],[-1.05,1.15],[-.6,1.3],[0,1.48]],
    [[0,1.55],[1.12,.8],[1.12,-.65],[0,-1.5],[-1.12,-.65],[-1.12,.8],[0,1.55]],
    Array.from({length:25},(_,i)=>[Math.sin(i/24*Math.PI*2)*1.15,Math.cos(i/24*Math.PI*2)*1.48]),
    [[0,1.58],[1.22,.05],[0,-1.55],[-1.22,.05],[0,1.58]],
  ]
  const shield = frames[family].map(([x,y])=>[x*width,y])
  add(shield, 0.15, 2.3, 0.045)
  add(shield.map(([x,y]) => [x*0.9,y*0.9]), 1.1, 2.0, 0.012, 0.025)
  // Interwoven wings and a central rising spear form a complete signature crest.
  const spread = 0.55 + random()*0.33
  if (family === 0) {
  for (const side of [-1,1]) {
    add([[0,-0.9],[side*0.18,-0.3],[side*spread,0.2],[side*0.72,0.8],[side*0.4,0.6],[0,0.05]], 2.0, 1.8, 0.04, 0.08)
    add([[0,-0.3],[side*0.36,0.18],[side*0.5,0.56],[side*0.24,0.38],[0,0.6]], 2.7, 1.5, 0.026, 0.13)
    add([[side*0.11,-0.67],[side*0.48,-0.48],[side*0.73,-0.1]], 3.2, 1.1, 0.022, 0.1)
    add([[side*0.15,-1.42],[side*0.94,-1.0],[side*1.42,-0.28],[side*1.48,0.7]], 3.4, 1.7, 0.018)
  }
  add([[0,-0.92],[0,-0.2],[0,0.5],[0,1.02]], 2.1, 1.6, 0.036, 0.15)
  add([[-0.17,0.72],[0,1.07],[0.17,0.72]], 3.1, 0.9, 0.029, 0.15)
  add([[-0.34,-0.75],[0,-0.89],[0.34,-0.75]], 3.7, 1.0, 0.025, 0.1)
  } else if (family === 1) {
    // Interlocking angular ribbons.
    const lift = .55 + random()*.25
    for (const side of [-1,1]) {
      add([[side*.72,lift],[0,.1],[side*.72,-.55],[0,-1.03]],2,1.8,.038,.1)
      add([[side*.52,1.0],[side*.22,.35],[side*.52,-.25]],2.8,1.4,.025,.15)
    }
    add([[0,1.12],[0,.15],[0,-1.08]],3.4,1.3,.03,.18)
  } else if (family === 2) {
    // Radial compass medallion.
    const arms = random()>.5?8:12
    const star = Array.from({length:arms*2+1},(_,i)=> {
      const angle=i/(arms*2)*Math.PI*2
      const r=i%2===0?.91:.38
      return [Math.sin(angle)*r,Math.cos(angle)*r]
    })
    add(star,2,2.2,.032,.12)
    add([[0,.55],[.34,0],[0,-.55],[-.34,0],[0,.55]],3.2,1.5,.029,.2)
  } else {
    // Rising spear with layered chevrons.
    const rise = .68 + random()*.2
    for(let i=0;i<3;i++) {
      const y=rise-i*.48,w=.7-i*.13
      add([[-w,y-.28],[0,y],[w,y-.28]],2+i*.4,1.5,.034,.1+i*.025)
    }
    add([[0,-1.15],[0,1.13]],2.3,1.9,.04,.2)
    add([[-.18,.83],[0,1.2],[.18,.83]],3.6,1,.028,.2)
  }
  // Crown and finishing rays are deliberately drawn last.
  add([[-0.4,1.52],[-0.38,1.82],[-0.18,1.68],[0,1.98],[0.18,1.68],[0.38,1.82],[0.4,1.52]], 4.9, 1.1, 0.028)
  return strokes
}

function DrawStroke({ stroke, elapsed }: { stroke: Stroke; elapsed: React.RefObject<number> }) {
  const tip = useRef<Mesh>(null)
  const curve = useMemo(() => new CatmullRomCurve3(stroke.points, false, 'centripetal', 0.25), [stroke])
  const geometry = useMemo(() => {
    const result = new TubeGeometry(curve, 180, stroke.thickness, 8, false)
    result.setDrawRange(0, 0)
    return result
  }, [curve, stroke.thickness])
  const count = geometry.index!.count
  useEffect(() => () => geometry.dispose(), [geometry])
  useFrame(() => {
    const progress = MathUtils.smoothstep(elapsed.current, stroke.start, stroke.start + stroke.duration)
    geometry.setDrawRange(0, Math.floor(count * progress / 48) * 48)
    if (tip.current) {
      tip.current.visible = progress > 0 && progress < 1
      tip.current.position.copy(curve.getPointAt(progress))
    }
  })
  return <group><mesh geometry={geometry}><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh><mesh ref={tip} visible={false}><sphereGeometry args={[stroke.thickness * 1.8, 10, 10]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh></group>
}

function LaurelLeaf({ side, index, elapsed }: { side: number; index: number; elapsed: React.RefObject<number> }) {
  const group = useRef<Group>(null)
  const shape = useMemo(() => {
    const s = new Shape(); s.moveTo(0,0); s.bezierCurveTo(-0.13,0.12,-0.14,0.29,0,0.43); s.bezierCurveTo(0.14,0.29,0.13,0.12,0,0); return s
  }, [])
  const t = index / 7
  const angle = -1.12 + t*1.45
  const x = side*(0.6+Math.cos(angle)*0.85), y = -0.17+Math.sin(angle)*1.25
  useFrame(() => {
    if (!group.current) return
    const p = MathUtils.smoothstep(elapsed.current, 3.7+index*0.16, 4.35+index*0.16)
    group.current.scale.setScalar(p)
    group.current.rotation.y = side*(1-p)*1.5
  })
  return <group ref={group} position={[x,y,0]} rotation={[0,0,-side*(0.8-t*0.4)]} scale={0}>
    <mesh><extrudeGeometry args={[shape,{depth:0.035,bevelEnabled:true,bevelSize:0.012,bevelThickness:0.012,bevelSegments:2,steps:1}]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
  </group>
}

export function EmblemStamp({ seed }: { seed: number }) {
  // Finished embroidery is one static mesh instead of dozens of animated
  // strokes and leaves on every garment during a carousel movement.
  const geometry = useMemo(() => {
    const pieces = buildCrest(seed).map(stroke => {
      const tube=new TubeGeometry(new CatmullRomCurve3(stroke.points, false, 'centripetal', 0.25),90,stroke.thickness,6,false)
      const piece=tube.toNonIndexed();tube.dispose();return piece
    })
    const shape=new Shape();shape.moveTo(0,0);shape.bezierCurveTo(-.13,.12,-.14,.29,0,.43);shape.bezierCurveTo(.14,.29,.13,.12,0,0)
    for(const side of [-1,1])for(let i=0;i<8;i++){
      const t=i/7,angle=-1.12+t*1.45
      const leaf=new ExtrudeGeometry(shape,{depth:.035,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:2,steps:1})
      const matrix=new Matrix4().makeRotationZ(-side*(.8-t*.4))
      matrix.setPosition(side*(.6+Math.cos(angle)*.85),-.17+Math.sin(angle)*1.25,0)
      leaf.applyMatrix4(matrix)
      pieces.push(leaf)
    }
    const merged=mergeGeometries(pieces,false)!
    pieces.forEach(piece=>piece.dispose())
    return merged
  }, [seed])
  useEffect(()=>()=>geometry.dispose(),[geometry])
  return <mesh geometry={geometry}><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
}

export function AssemblingEmblem({ seed }: { seed: number }) {
  const reducedMotion = useJourney((s) => s.reducedMotion)
  const elapsed = useRef(0)
  const root = useRef<Group>(null)
  const [complete, setComplete] = useState(false)
  const stage = useJourney(s => s.stage)
  const completeEmblem = useJourney(s => s.completeEmblem)
  const transfer = useRef(0)
  useEffect(() => { if (complete) completeEmblem() }, [complete, completeEmblem])
  const strokes = useMemo(() => buildCrest(seed), [seed])
  useFrame((_, delta) => {
    elapsed.current = reducedMotion ? 7 : elapsed.current + Math.min(delta,0.1)
    if (elapsed.current >= 6.3 && !complete) setComplete(true)
    if (root.current) {
      if (stage === 'garment') transfer.current = reducedMotion ? 1 : Math.min(1, transfer.current + delta / 1.8)
      const t = MathUtils.smoothstep(transfer.current, 0, 1)
      root.current.scale.setScalar(MathUtils.lerp(.95, .12, t))
      root.current.position.set(MathUtils.lerp(0,-.28,t), MathUtils.lerp(0,.55,t), MathUtils.lerp(0,.31,t))
      root.current.rotation.y = (1-t) * (complete && !reducedMotion ? Math.sin((elapsed.current-6.3)*0.25)*0.18 : 0)
    }
  })
  return <group ref={root} scale={0.95}>
    {strokes.map((stroke,i) => <DrawStroke key={i} stroke={stroke} elapsed={elapsed} />)}
    {[-1,1].flatMap((side) => Array.from({length:8},(_,i) => <LaurelLeaf key={`${side}-${i}`} side={side} index={i} elapsed={elapsed} />))}
    {stage === 'reveal' && <Html center position={[0,-2.02,0]} style={{pointerEvents:'none'}}><div className="emblem-progress" role="status"><span>{complete ? 'YOUR ORIGIN. YOUR LEGACY.' : 'FORGING YOUR EMBLEM'}</span><small>{complete ? 'Entering the garment world…' : 'Tracing your journey into a complete crest…'}</small></div></Html>}
  </group>
}
