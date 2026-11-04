'use client'

import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CatmullRomCurve3, Group, MathUtils, Mesh, TubeGeometry } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { buildSacredEmblem, type SacredStroke } from '@/lib/sacred-emblem'
import { useJourney } from '@/lib/store'

function DrawStroke({ stroke, elapsed }: { stroke: SacredStroke; elapsed: React.RefObject<number> }) {
  const tip = useRef<Mesh>(null)
  const curve = useMemo(() => new CatmullRomCurve3(stroke.points, false, 'centripetal'), [stroke])
  const geometry = useMemo(() => {
    const result = new TubeGeometry(curve, stroke.points.length > 2 ? 144 : 48, stroke.thickness, 6, false)
    result.setDrawRange(0,0)
    return result
  }, [curve,stroke.thickness,stroke.points.length])
  useEffect(() => () => geometry.dispose(), [geometry])
  useFrame(() => {
    const progress=MathUtils.smoothstep(elapsed.current,stroke.start,stroke.start+stroke.duration)
    geometry.setDrawRange(0,Math.floor(geometry.index!.count*progress/36)*36)
    if(tip.current){tip.current.visible=progress>0&&progress<1;tip.current.position.copy(curve.getPointAt(progress))}
  })
  return <group><mesh geometry={geometry}><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh><mesh ref={tip} visible={false}><sphereGeometry args={[stroke.thickness*1.7,8,8]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh></group>
}

export function EmblemStamp({ seed, color = '#ffffff' }: { seed: number; color?: string }) {
  const geometry=useMemo(() => {
    const pieces=buildSacredEmblem(seed).strokes.map(stroke => {
      const tube=new TubeGeometry(new CatmullRomCurve3(stroke.points,false,'centripetal'),stroke.points.length>2?96:1,stroke.thickness,6,false)
      const piece=tube.toNonIndexed();tube.dispose();return piece
    })
    const merged=mergeGeometries(pieces,false)!
    pieces.forEach(piece=>piece.dispose())
    return merged
  },[seed])
  useEffect(()=>()=>geometry.dispose(),[geometry])
  return <mesh geometry={geometry}><meshBasicMaterial color={color} toneMapped={false} /></mesh>
}

export function AssemblingEmblem({ seed }: { seed: number }) {
  const reducedMotion=useJourney(s=>s.reducedMotion)
  const stage=useJourney(s=>s.stage)
  const completeEmblem=useJourney(s=>s.completeEmblem)
  const elapsed=useRef(0),transfer=useRef(0)
  const root=useRef<Group>(null)
  const [complete,setComplete]=useState(false)
  const emblem=useMemo(()=>buildSacredEmblem(seed),[seed])
  const finishAt=emblem.duration+0.3
  useEffect(()=>{if(complete)completeEmblem()},[complete,completeEmblem])
  useFrame((_,delta)=>{
    elapsed.current=reducedMotion?finishAt:elapsed.current+Math.min(delta,0.1)
    if(elapsed.current>=finishAt&&!complete)setComplete(true)
    if(root.current){
      if(stage==='garment')transfer.current=reducedMotion?1:Math.min(1,transfer.current+delta/1.8)
      const t=MathUtils.smoothstep(transfer.current,0,1)
      root.current.scale.setScalar(MathUtils.lerp(.95,.12,t))
      root.current.position.set(MathUtils.lerp(0,-.28,t),MathUtils.lerp(0,.55,t),MathUtils.lerp(0,.31,t))
    }
  })
  return <group ref={root} scale={0.95}>{emblem.strokes.map((stroke,i)=><DrawStroke key={i} stroke={stroke} elapsed={elapsed} />)}
    {stage==='reveal'&&<Html center position={[0,-1.85,0]} style={{pointerEvents:'none'}}><div className="emblem-progress" role="status"><span>{complete?'YOUR SACRED SIGNATURE':'DRAWING YOUR SACRED EMBLEM'}</span><small>{emblem.name} · {complete?'Entering the garment world…':'Circles. Symmetry. Your connection.'}</small></div></Html>}
  </group>
}
