'use client'

import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Group, Quaternion } from 'three'
import { arcPoints, latLngToVector3 } from '@/lib/geo'
import { getLocation, LOCATIONS, type Location } from '@/lib/locations'
import { useJourney } from '@/lib/store'
import { journeyOrientation } from '@/lib/globe-focus'
import { Earth } from './earth'
import { AnimatedRoute } from './animated-route'
import { AssemblingEmblem } from './assembling-emblem'
import { GarmentWorldScene } from './garment-world-scene'
import { TechFlightNetwork, TechPlaceEffect } from './tech-earth-effects'
import { TECH_EARTH_LOCATIONS } from '@/lib/tech-earth-locations'

function PlaceMarker({ place, selected }: { place: Location; selected: boolean }) {
  const hovered = useJourney((s) => s.hovered)
  const origin = useJourney((s) => s.origin)
  const stage = useJourney((s) => s.stage)
  const setHovered = useJourney((s) => s.setHovered)
  const active = hovered === place.id
  const position = latLngToVector3(place.lat, place.lng, 2.025)
  return <group>
    <TechPlaceEffect place={place} selected={selected || active} />
    <group position={position}>
    <mesh onPointerOver={(e) => { e.stopPropagation(); setHovered(place.id) }} onPointerOut={() => { if (useJourney.getState().hovered === place.id) setHovered(null) }} onClick={(e) => {
      e.stopPropagation()
      if (stage === 'reveal') return
      if (!origin || stage === 'q1') useJourney.setState({ origin: place.id, stage: 'q2', ...(useJourney.getState().destination === place.id ? { destination: null } : {}) })
      else if (origin !== place.id) useJourney.setState({ destination: place.id, stage: 'q2' })
    }}>
      <sphereGeometry args={[0.065, 12, 12]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
    <mesh raycast={() => {}}><sphereGeometry args={[active ? 0.03 : selected ? 0.025 : 0.016, 16, 16]} /><meshBasicMaterial color="#76ff76" toneMapped={false} /></mesh>
    <mesh raycast={() => {}}><sphereGeometry args={[selected || active ? 0.055 : 0.035, 16, 16]} /><meshBasicMaterial color="#76ff76" transparent opacity={0.16} depthWrite={false} /></mesh>
    {selected && !active && <Html position={[0, place.id === origin ? -0.12 : 0.18, 0]} center occlude zIndexRange={[9, 0]} style={{ pointerEvents: 'none' }}><div className="selected-place-label"><span>{place.id === origin ? 'ORIGIN' : 'CONTINUATION'}</span><strong>{place.name}</strong></div></Html>}
    {active && <Html center position={[0, 0.28, 0]} occlude zIndexRange={[30, 20]} style={{ pointerEvents: 'none' }}><div className="globe-tooltip is-visible"><small>LOCATION / {place.country}</small><strong>{place.name}</strong><span>{Math.abs(place.lat).toFixed(4)}° {place.lat >= 0 ? 'N' : 'S'} · {Math.abs(place.lng).toFixed(4)}° {place.lng >= 0 ? 'E' : 'W'}</span></div></Html>}
    </group>
  </group>
}

export function CosmicWorld() {
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
    if (!globe.current || (!origin && !destination)) return
    fromRotation.current.copy(globe.current.quaternion)
    const previous = previousSelection.current
    const focus = origin !== previous.origin && origin ? origin : destination !== previous.destination && destination ? destination : stage === 'q1' ? origin ?? destination : destination ?? origin
    previousSelection.current = { origin, destination }
    targetRotation.current.copy(journeyOrientation(getLocation(focus!), null, camera.position))
    transition.current = reducedMotion ? 1 : 0
    if (reducedMotion) globe.current.quaternion.copy(targetRotation.current)
  }, [origin, destination, stage, camera, reducedMotion])
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
  const personal = useMemo(() => origin && destination ? arcPoints(latLngToVector3(getLocation(origin).lat, getLocation(origin).lng, 2.025), latLngToVector3(getLocation(destination).lat, getLocation(destination).lng, 2.025), 180, 0.16) : null, [origin, destination])
  const revealed = stage === 'reveal' || stage === 'garment' || stage === 'world'
  const seed = emblemSeed
  return <>
    {!revealed ? <group ref={globe} quaternion={fromRotation.current}>
      <Earth />
      <TechFlightNetwork />
      {personal && <AnimatedRoute key={`${origin}-${destination}`} points={personal} />}
      {places.map((p) => <PlaceMarker key={p.id} place={p} selected={origin === p.id || destination === p.id} />)}
    </group> : null}
    {(stage==='reveal' || stage==='garment') && <AssemblingEmblem key={seed} seed={seed} />}
    {(stage==='garment' || stage==='world') && <GarmentWorldScene seed={seed} />}
  </>
}
