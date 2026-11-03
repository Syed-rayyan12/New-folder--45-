'use client'

import { useTexture } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, CatmullRomCurve3, DoubleSide, Mesh, MeshBasicMaterial, Quaternion, SRGBColorSpace, TubeGeometry, Vector3 } from 'three'
import type { Location } from '@/lib/locations'
import { mapPosition, routeSegments } from '@/lib/geo'
import { useJourney } from '@/lib/store'
import { TECH_EARTH_LOCATIONS, TECH_FLIGHT_PAIRS } from '@/lib/tech-earth-locations'

export function TechPlaceEffect({ place, selected }: { place: Location; selected: boolean }) {
  const mapView = useJourney(s=>s.mapView)
  const reduced = useJourney(s=>s.reducedMotion)
  const wave=useRef<Mesh>(null),waveMaterial=useRef<MeshBasicMaterial>(null)
  const elapsed=useRef((Math.abs(place.lat)+Math.abs(place.lng))%1)
  const [aperture,pillar]=useTexture(['/vendor/ghostcat-earth/aperture.png','/vendor/ghostcat-earth/light_column.png'])
  const rotation=useMemo(()=>mapView === 'flat' ? new Quaternion() : new Quaternion().setFromUnitVectors(new Vector3(0,0,1),mapPosition(place.lat,place.lng,1,mapView)),[place.lat,place.lng,mapView])
  const label=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=384;canvas.height=80
    const ctx=canvas.getContext('2d')!
    ctx.fillStyle='rgba(5,24,10,.82)';ctx.fillRect(1,9,382,62)
    ctx.strokeStyle='#76ff76';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,9);ctx.lineTo(384,9);ctx.stroke()
    ctx.font='500 28px Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#e7f7ff';ctx.fillText(place.name,192,42,354)
    const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;return texture
  },[place.name])
  useEffect(()=>()=>label.dispose(),[label])
  useFrame((_,delta)=>{
    if(!reduced)elapsed.current+=Math.min(delta,.05)*.38
    const t=reduced?.5:elapsed.current%1
    wave.current?.scale.setScalar(.12*(1+t))
    if(waveMaterial.current)waveMaterial.current.opacity=reduced?.35:Math.sin(t*Math.PI)*.7
  })
  return <>
    <group position={mapPosition(place.lat,place.lng,2.012,mapView)} quaternion={rotation} raycast={()=>{}}>
      <mesh scale={.12}><planeGeometry args={[1,1]}/><meshBasicMaterial map={aperture} color="#76ff76" transparent depthWrite={false} blending={AdditiveBlending}/></mesh>
      <mesh ref={wave} scale={.12}><planeGeometry args={[1,1]}/><meshBasicMaterial ref={waveMaterial} map={aperture} color="#76ff76" transparent depthWrite={false} blending={AdditiveBlending}/></mesh>
      {mapView !== 'flat' && [0,Math.PI/2].map(angle=><group key={angle} rotation={[0,0,angle]}><mesh position={[0,0,.22]} rotation={[Math.PI/2,0,0]}><planeGeometry args={[.045,.44]}/><meshBasicMaterial map={pillar} color={selected?'#76ff76':'#76ff76'} transparent opacity={selected?.85:.55} depthWrite={false} side={DoubleSide} blending={AdditiveBlending}/></mesh></group>)}
    </group>
    {!selected&&<sprite position={mapPosition(place.lat,place.lng,2.22,mapView)} scale={[Math.min(.62,.24+place.name.length*.023),.12,1]} raycast={()=>{}}><spriteMaterial map={label} transparent depthWrite={false} toneMapped={false}/></sprite>}
  </>
}

function Flight({ points, index }: { points: Vector3[]; index: number }) {
  const reduced=useJourney(s=>s.reducedMotion)
  const dpr=useThree(s=>s.viewport.dpr)
  const geometry=useMemo(()=>{
    const curve=new CatmullRomCurve3(points)
    const tail=new BufferGeometry().setFromPoints(curve.getPoints(160))
    tail.setAttribute('aFraction',new BufferAttribute(Float32Array.from({length:161},(_,i)=>i/160),1))
    return {base:new TubeGeometry(curve,80,.0023,4,false),tail}
  },[points])
  useEffect(()=>()=>{geometry.base.dispose();geometry.tail.dispose()},[geometry])
  const uniforms=useMemo(()=>({uTravel:{value:index*.13},uDpr:{value:dpr}}),[index,dpr])
  useFrame((_,delta)=>{if(!reduced)uniforms.uTravel.value=(uniforms.uTravel.value+Math.min(delta,.05)*.17)%1})
  return <group raycast={()=>{}}>
    <mesh geometry={geometry.base}><meshBasicMaterial color="#76ff76" transparent opacity={.55}/></mesh>
    <points geometry={geometry.tail}><shaderMaterial transparent depthWrite={false} blending={AdditiveBlending} uniforms={uniforms}
      vertexShader={`attribute float aFraction;uniform float uTravel;uniform float uDpr;varying float vAlpha;
        void main(){float trail=fract(uTravel-aFraction);vAlpha=1.-smoothstep(0.,.13,trail);vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp((2.+vAlpha*5.)*uDpr*5./max(1.,-mv.z),1.,10.);}`}
      fragmentShader={`varying float vAlpha;void main(){float d=length(gl_PointCoord-.5);if(d>.5||vAlpha<.01)discard;gl_FragColor=vec4(.463,1.,.463,vAlpha*(1.-smoothstep(.1,.5,d)));}`}/></points>
  </group>
}

export function TechFlightNetwork() {
  const mobile=useJourney(s=>s.isMobile)
  const mapView=useJourney(s=>s.mapView)
  const routes=useMemo(()=>TECH_FLIGHT_PAIRS.slice(0,mobile?4:9).flatMap(([from,to],index)=>routeSegments(TECH_EARTH_LOCATIONS[from],TECH_EARTH_LOCATIONS[to],mapView,.28).map((points,part)=>({points,index,key:from+'-'+to+'-'+mapView+'-'+part}))),[mobile,mapView])
  return <group>{routes.map(route=><Flight key={route.key} points={route.points} index={route.index}/>)}</group>
}
