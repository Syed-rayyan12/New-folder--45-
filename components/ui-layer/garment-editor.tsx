'use client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useEffect, useRef } from 'react'
import { RealisticGarment } from '../canvas/realistic-garment'
import { EmblemStamp } from '../canvas/assembling-emblem'
import { WORLD_GARMENTS } from '@/lib/garment-world'
import { useJourney } from '@/lib/store'

export function GarmentEditor({onClose}:{onClose:()=>void}) {
  const {garmentIndex,emblemSeed}=useJourney()
  const dialog=useRef<HTMLDialogElement>(null)
  useEffect(()=>{const previous=document.activeElement as HTMLElement|null;dialog.current?.showModal();return()=>{previous?.focus()}},[])
  return <dialog ref={dialog} className="garment-editor" onCancel={onClose} aria-labelledby="editor-title"><header><div><h2 id="editor-title">{WORLD_GARMENTS[garmentIndex].name}</h2></div><button autoFocus onClick={onClose} aria-label="Close garment viewer">Close</button></header>
    <div className="editor-body"><div className="editor-canvas"><Canvas camera={{position:[0,.3,6.5],fov:43}} dpr={[1,1.5]}><ambientLight intensity={1.6}/><directionalLight position={[3,4,5]} intensity={3}/><directionalLight position={[-3,2,-4]} intensity={2}/><Suspense fallback={null}><group><RealisticGarment kind={WORLD_GARMENTS[garmentIndex].kind} color={WORLD_GARMENTS[garmentIndex].color}/><group position={[-.28,.55,.36]} scale={.12}><EmblemStamp seed={emblemSeed}/></group></group></Suspense><OrbitControls makeDefault enablePan={false} enableZoom={false} minPolarAngle={Math.PI/2} maxPolarAngle={Math.PI/2}/></Canvas><p>Drag to rotate 360&deg;</p></div>
</div>
  </dialog>
}
