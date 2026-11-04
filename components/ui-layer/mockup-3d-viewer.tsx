'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Color, Group, MathUtils, Mesh, Plane, Vector3 } from 'three'
import { RealisticGarment } from '../canvas/realistic-garment'
import { TankGarment } from '../canvas/tank-garment'
import { EmblemStamp } from '../canvas/assembling-emblem'
import { useJourney } from '@/lib/store'
import type { MockupAsset } from '@/lib/mockups'

function Garment({asset,color,seed,replay}:{asset:MockupAsset;color:string;seed:number;replay:number}){
  const root=useRef<Group>(null),elapsed=useRef(0)
  const reduced=useJourney(s=>s.reducedMotion)
  const clip=useMemo(()=>new Plane(new Vector3(0,1,0),-1.6),[])
  const shade=color==='original'?(asset.id==='original-tank'?'#2bbb83':'#b4b8b3'):color
  const c=new Color(shade),ink=c.r*.2126+c.g*.7152+c.b*.0722>.45?'#17201a':'#f0eee6'
  const name=`${asset.id} ${asset.name}`.toLowerCase()
  const kind=name.includes('hood')?'hoodie':name.includes('coat')||name.includes('jacket')?'coat':name.includes('tee')||name.includes('t-shirt')?'tee':'tank'
  useEffect(()=>{elapsed.current=0;root.current?.traverse(object=>{if(object instanceof Mesh){const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(material=>{material.clippingPlanes=[clip];material.clipShadows=true;material.needsUpdate=true})}})},[asset.id,kind,seed,replay,clip])
  useFrame((_,delta)=>{elapsed.current=reduced?3:elapsed.current+Math.min(delta,.1);const t=MathUtils.smoothstep(elapsed.current,0,2.4);clip.constant=-MathUtils.lerp(1.6,-1.4,t)})
  return <group ref={root} key={asset.id}>{kind==='tank'?<TankGarment color={shade}/>:<RealisticGarment kind={kind} color={shade}/>}<group position={[.28,.69,kind==='tank'?.303:.335]} scale={.09}><EmblemStamp seed={seed} color={ink}/></group></group>
}

export default function Mockup3DViewer({asset,color,seed,replay}:{asset:MockupAsset;color:string;seed:number;replay:number}){
  const reduced=useJourney(s=>s.reducedMotion)
  const [spin,setSpin]=useState(!reduced)
  return <div className="mockup-3d-viewer"><Canvas shadows dpr={[1,1.5]} camera={{position:[0,.2,5.3],fov:38}} gl={{alpha:true,antialias:true}} onCreated={({gl})=>{gl.localClippingEnabled=true}}>
    <ambientLight intensity={.85}/><directionalLight position={[3,5,5]} intensity={3.2} castShadow/><directionalLight position={[-4,2,2]} intensity={1.3}/><directionalLight position={[0,3,-4]} intensity={2.4}/>
    <Suspense fallback={null}><Garment asset={asset} color={color} seed={seed} replay={replay}/><ContactShadows position={[0,-1.25,0]} opacity={.35} scale={6} blur={2.5} far={3} resolution={256}/></Suspense>
    <OrbitControls makeDefault enablePan={false} enableZoom minDistance={3.4} maxDistance={7.5} minPolarAngle={.3} maxPolarAngle={Math.PI-.3} enableDamping dampingFactor={.07} autoRotate={spin} autoRotateSpeed={.7} onStart={()=>setSpin(false)}/>
  </Canvas><div className="mockup-3d-hint"><span>DRAG TO ROTATE 360° · SCROLL / PINCH TO ZOOM</span><button type="button" onClick={()=>setSpin(!spin)} aria-pressed={spin}>{spin?'Pause rotation':'360° auto-spin'}</button></div></div>
}
