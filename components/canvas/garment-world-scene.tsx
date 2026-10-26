'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { DoubleSide, Group, MathUtils } from 'three'
import { WORLD_GARMENTS } from '@/lib/garment-world'
import { useJourney } from '@/lib/store'
import { EmblemStamp } from './assembling-emblem'
import { RealisticGarment } from './realistic-garment'

function Look({ index, seed }: { index: number; seed: number }) {
  const garment = WORLD_GARMENTS[index]
  const selected = useJourney(s => s.garmentIndex)
  const stage = useJourney(s => s.stage)
  const reduced = useJourney(s => s.reducedMotion)
  const select = useJourney(s => s.selectGarment)
  const root = useRef<Group>(null)
  const reveal = useRef(0)
  const step = Math.PI * 2 / WORLD_GARMENTS.length
  const angle = useRef((index-selected)*step)
  const targetAngle = useRef(angle.current)
  const previousSelection = useRef(selected)
  // Keep each mesh mounted and move the carousel by the shortest turn,
  // including the final-to-first transition. React must not reset positions.
  useEffect(() => {
    let delta = selected-previousSelection.current
    if (delta > WORLD_GARMENTS.length/2) delta -= WORLD_GARMENTS.length
    if (delta < -WORLD_GARMENTS.length/2) delta += WORLD_GARMENTS.length
    targetAngle.current -= delta*step
    previousSelection.current = selected
  }, [selected, step])
  useFrame((state, rawDelta) => {
    if (!root.current) return
    const delta=Math.min(rawDelta,.05)
    reveal.current = reduced ? 1 : Math.min(1,reveal.current+delta/1.6)
    angle.current = reduced ? targetAngle.current : MathUtils.damp(angle.current,targetAngle.current,4.8,delta)
    const a=angle.current
    const focus=(1+Math.cos(a))*.5
    const t=MathUtils.smoothstep(reveal.current,0,1)
    root.current.position.x=Math.sin(a)*3.5
    root.current.position.z=(Math.cos(a)-1)*2.6
    root.current.position.y=MathUtils.lerp(-.6,0,t)-(1-focus)*.12+(reduced?0:Math.sin(state.clock.elapsedTime*.7+index)*.025)
    const turn=stage==='garment'?0:-Math.sin(a)*.55+(reduced?0:state.pointer.x*.16*focus)
    root.current.rotation.y=MathUtils.damp(root.current.rotation.y,turn,6,delta)
    const scale=(.7+focus*.3)*t
    root.current.scale.setScalar(Math.max(.001,scale))
  })
  const active=index===selected
  return <group ref={root} scale={.001} onClick={e=>{e.stopPropagation();select(index);useJourney.setState({editorOpen:true})}}>
    <RealisticGarment kind={garment.kind} color={garment.color} />
    {(stage==='world' || !active) && <group position={[-.28,.55,.335]} scale={.12}><EmblemStamp seed={seed} /></group>}
  </group>
}

export function GarmentWorldScene({ seed }: { seed: number }) {
  return <group>
    <pointLight position={[0,2,3]} color="#ffffff" intensity={8} distance={9} />
    <pointLight position={[-3,1,-1]} color="#aecbff" intensity={9} distance={8} />
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.85,0]}>
      <ringGeometry args={[1.4,1.41,96]} /><meshBasicMaterial color="#b9c2d1" transparent opacity={.3} side={DoubleSide} />
    </mesh>
    {WORLD_GARMENTS.map((look,i)=><Look key={look.id} index={i} seed={seed} />)}
  </group>
}
