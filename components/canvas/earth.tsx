'use client'

import { useFrame, useLoader } from '@react-three/fiber'
import { memo, useEffect, useMemo, useRef } from 'react'
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Group } from 'three'
import { useJourney } from '@/lib/store'
import { techEarthVertex, techEarthFragment, atmosphereVertex, atmosphereFragment } from '@/lib/ghostcat-earth-shaders'
import { LocalTextureLoader } from '@/lib/local-texture-loader'

function OrbitalRing({ radius, tilt, color, offset }: { radius: number; tilt: number; color: string; offset: number }) {
  const orbit = useRef<Group>(null)
  const reduced = useJourney(s => s.reducedMotion)
  useFrame((_, delta) => { if (orbit.current && !reduced) orbit.current.rotation.y += Math.min(delta,.05)*.18 })
  return <group rotation={[0,0,tilt]}>
    <group ref={orbit} rotation={[0,offset,0]}>
      <mesh rotation={[Math.PI/2,0,0]} raycast={() => {}}><torusGeometry args={[radius,.0025,4,160]}/><meshBasicMaterial color="#76ff76" transparent opacity={.42} depthWrite={false}/></mesh>
      {[0,Math.PI].map(a=><mesh key={a} position={[Math.cos(a)*radius,0,Math.sin(a)*radius]} raycast={() => {}}><sphereGeometry args={[.035,12,10]}/><meshBasicMaterial color={color} toneMapped={false}/></mesh>)}
    </group>
  </group>
}

/** Port of the source globe's texture, scanning shader, atmosphere and satellite rings. */
export const Earth = memo(function Earth() {
  const isMobile = useJourney(s => s.isMobile)
  const reduced = useJourney(s => s.reducedMotion)
  const [map, glow] = useLoader(LocalTextureLoader,[`/vendor/ghostcat-earth/earth-${isMobile?2048:4096}.jpg`,'/vendor/ghostcat-earth/glow.png'])
  const uniforms = useMemo(()=>({
    map:{value:map},glowColor:{value:new Color('#76ff76')},scale:{value:-1},bias:{value:1},power:{value:3.3},time:{value:100},
  }),[map])
  const elapsed = useRef(0)
  const geometry=useMemo(()=>{
    const count=isMobile?700:1600,positions=new Float32Array(count*3),golden=Math.PI*(3-Math.sqrt(5))
    for(let i=0;i<count;i++){
      const y=1-2*(i+.5)/count,r=Math.sqrt(1-y*y),a=i*golden
      positions.set([Math.cos(a)*r*2.4,y*2.4,Math.sin(a)*r*2.4],i*3)
    }
    return new BufferGeometry().setAttribute('position',new BufferAttribute(positions,3))
  },[isMobile])
  useEffect(()=>()=>geometry.dispose(),[geometry])
  useFrame((_,delta)=>{if(!reduced){elapsed.current+=Math.min(delta,.05);uniforms.time.value=100-(elapsed.current*20)%200}})
  return <group>
    <mesh onPointerOver={e=>e.stopPropagation()} onPointerMove={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()}>
      <sphereGeometry args={[2,isMobile?48:64,isMobile?40:64]}/>
      <shaderMaterial uniforms={uniforms} vertexShader={techEarthVertex} fragmentShader={techEarthFragment} toneMapped={false}/>
    </mesh>
    <sprite scale={[4.3,4.3,1]} raycast={()=>{}}><spriteMaterial map={glow} color="#76ff76" transparent opacity={.1} depthWrite={false} blending={AdditiveBlending}/></sprite>
    <mesh raycast={()=>{}}><sphereGeometry args={[2.002,48,40]}/><shaderMaterial vertexShader={atmosphereVertex} fragmentShader={atmosphereFragment} transparent depthWrite={false}/></mesh>
    <points geometry={geometry} raycast={()=>{}}><pointsMaterial color="#76ff76" size={.012} transparent opacity={.2} depthWrite={false} blending={AdditiveBlending}/></points>
    <OrbitalRing radius={2.6} tilt={0} color="#76ff76" offset={.3}/>
    <OrbitalRing radius={3.12} tilt={Math.PI/6} color="#76ff76" offset={2.1}/>
    <OrbitalRing radius={2.08} tilt={-Math.PI/6} color="#76ff76" offset={4}/>
  </group>
})
