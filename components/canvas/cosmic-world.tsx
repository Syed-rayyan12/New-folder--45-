'use client'

import { LocationTooltip } from '@/components/ui-layer/location-tooltip'
import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Group, Mesh, OrthographicCamera, Quaternion } from 'three'
import { mapPosition, routeSegments } from '@/lib/geo'
import { getLocation, LOCATIONS, type Location } from '@/lib/locations'
import { useJourney } from '@/lib/store'
import { POINT_COLOR } from '@/lib/palette'
import { journeyOrientation } from '@/lib/globe-focus'
import { Earth } from './earth'
import { GlobeBrand, type GlobeBrandTarget } from './globe-brand'
import { AnimatedRoute } from './animated-route'
import { AssemblingEmblem } from './assembling-emblem'

import { TechPlaceEffect } from './tech-earth-effects'
import { TECH_EARTH_LOCATIONS } from '@/lib/tech-earth-locations'

function PlaceMarker({ place, selected }: { place: Location; selected: boolean }) {
  const hovered = useJourney((s) => s.hovered)
  const origin = useJourney((s) => s.origin)
  const stage = useJourney((s) => s.stage)
  const setHovered = useJourney((s) => s.setHovered)
  const active = hovered === place.id
  const mapView = useJourney(s => s.mapView)
  const position = mapPosition(place.lat, place.lng, 2.025, mapView)
  const dot = useRef<Mesh>(null)
  const halo = useRef<Mesh>(null)
  const hit = useRef<Mesh>(null)
  useFrame(state => {
    const camera = state.camera
    const scale = mapView === 'flat' && camera instanceof OrthographicCamera ? 3 / (camera.zoom * 0.018) : 1
    dot.current?.scale.setScalar(scale)
    halo.current?.scale.setScalar(scale)
    hit.current?.scale.setScalar(mapView === 'flat' && camera instanceof OrthographicCamera ? 9 / (camera.zoom * 0.065) : 1)
  })
  return <group>
    <TechPlaceEffect place={place} selected={selected || active} />
    <group position={position}>
    <mesh ref={hit} onPointerOver={(e) => { e.stopPropagation(); setHovered(place.id) }} onPointerOut={() => { if (useJourney.getState().hovered === place.id) setHovered(null) }} onClick={(e) => {
      e.stopPropagation()
      if (stage === 'reveal') return
      useJourney.getState().selectLocation(place.id)
    }}>
      <sphereGeometry args={[0.065, 12, 12]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
    <mesh ref={dot} renderOrder={mapView === 'flat' ? 7 : 0} raycast={() => {}}>{mapView === 'flat' ? <circleGeometry args={[active ? 0.035 : selected ? 0.03 : 0.018, 24]} /> : <sphereGeometry args={[active ? 0.03 : selected ? 0.025 : 0.016, 16, 16]} />}<meshBasicMaterial color={POINT_COLOR} transparent depthWrite={false} depthTest={mapView !== 'flat'} toneMapped={false} /></mesh>
    <mesh ref={halo} renderOrder={mapView === 'flat' ? 6 : 0} raycast={() => {}}>{mapView === 'flat' ? <ringGeometry args={[0.04, selected || active ? 0.055 : 0.045, 24]} /> : <sphereGeometry args={[selected || active ? 0.055 : 0.035, 16, 16]} />}<meshBasicMaterial color={POINT_COLOR} depthTest={mapView !== 'flat'} transparent opacity={0.16} depthWrite={false} /></mesh>
    {selected && !active && <Html position={[0, mapView === 'flat' ? 0 : place.id === origin ? -0.12 : 0.18, 0]} center occlude={mapView !== 'flat'} zIndexRange={[9, 0]} style={{ pointerEvents: 'none' }}><div className="selected-place-label" style={mapView === 'flat' ? { transform: `translateY(${place.id === origin ? 25 : -25}px)` } : undefined}><span>{place.id === origin ? 'ORIGIN' : 'CONTINUATION'}</span><strong>{place.name}</strong></div></Html>}
    {active && <Html center position={[0, 0.28, 0]} occlude={mapView !== 'flat'} zIndexRange={[30, 20]} style={{ pointerEvents: 'none' }}><div className="coordinate-tooltip-anchor" style={mapView === 'flat' ? {transform:'translateY(-35px)'} : undefined}><LocationTooltip place={place}/></div></Html>}
    </group>
  </group>
}

export function CosmicWorld({showBrand=false,brandCanvas,brandVisible=true,onBrandTarget}:{showBrand?:boolean;brandCanvas?:HTMLCanvasElement|null;brandVisible?:boolean;onBrandTarget?:(target:GlobeBrandTarget)=>void}) {
  const mapView = useJourney(s => s.mapView)
  const journeyStep = useJourney(s => s.journeyStep)
  const emblemSeed = useJourney((s) => s.emblemSeed)
  const origin = useJourney((s) => s.origin)
  const destination = useJourney((s) => s.destination)
  const stage = useJourney((s) => s.stage)
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const reducedMotion = useJourney((s) => s.reducedMotion)
  const globe = useRef<Group>(null)
  const fromRotation = useRef(journeyOrientation({lat:22,lng:80},null,camera.position))
  const targetRotation = useRef(fromRotation.current.clone())
  const transition = useRef(1)
  const previousSelection = useRef({ origin, destination })
  useEffect(() => {
    if (!globe.current) return
    if (mapView === 'flat') { globe.current.quaternion.identity(); transition.current = 1; return }
    if (!origin && !destination) { globe.current.quaternion.copy(fromRotation.current); return }
    fromRotation.current.copy(globe.current.quaternion)
    const previous = previousSelection.current
    const focus = origin !== previous.origin && origin ? origin : destination !== previous.destination && destination ? destination : stage === 'q1' ? origin ?? destination : destination ?? origin
    previousSelection.current = { origin, destination }
    targetRotation.current.copy(journeyOrientation(getLocation(focus!), null, camera.position))
    transition.current = reducedMotion ? 1 : 0
    if (reducedMotion) globe.current.quaternion.copy(targetRotation.current)
  }, [origin, destination, stage, camera, reducedMotion, mapView])
  useEffect(() => {
    const stop = () => { transition.current = 1 }
    gl.domElement.addEventListener('pointerdown', stop)
    return () => gl.domElement.removeEventListener('pointerdown', stop)
  }, [gl])
  useFrame((_, delta) => {
    if (!globe.current || transition.current >= 1) return
    transition.current = Math.min(1, transition.current + Math.min(delta, 0.1) / 2.2)
    const t = transition.current
    const eased = t * t * (3 - 2 * t)
    globe.current.quaternion.slerpQuaternions(fromRotation.current, targetRotation.current, eased)
  })
  const places = useMemo(() => {
    const all = new Map([...LOCATIONS,...TECH_EARTH_LOCATIONS].map((p) => [p.id, p]))
    for (const id of [origin, destination]) if (id) all.set(id, getLocation(id))
    return [...all.values()]
  }, [origin, destination])
  const personal = useMemo(() => origin && destination ? routeSegments(getLocation(origin), getLocation(destination), mapView) : [], [origin, destination, mapView])
  const revealed = stage === 'reveal' || stage === 'garment' || stage === 'world'
  const seed = emblemSeed
  return <>
    {!revealed ? <group ref={globe} quaternion={mapView === 'flat' ? new Quaternion() : fromRotation.current}>
      <Earth />
      {showBrand&&mapView==='globe'&&<GlobeBrand orientation={fromRotation.current} canvas={brandCanvas} visible={brandVisible} onTarget={onBrandTarget}/>}
      {journeyStep === 'connected' && personal.map((points, i) => <AnimatedRoute key={`${origin}-${destination}-${mapView}-${i}`} points={points} />)}
      {places.map((p) => <PlaceMarker key={p.id} place={p} selected={origin === p.id || destination === p.id} />)}
    </group> : null}
    {stage==='reveal' && <AssemblingEmblem key={seed} seed={seed} />}
  </>
}
