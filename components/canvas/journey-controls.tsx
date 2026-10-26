'use client'

import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, type ComponentRef } from 'react'
import { Vector3 } from 'three'
import { useJourney } from '@/lib/store'

export function JourneyControls() {
  const camera = useThree((s) => s.camera)
  const origin = useJourney((s) => s.origin)
  const destination = useJourney((s) => s.destination)
  const stage = useJourney((s) => s.stage)
  const reducedMotion = useJourney((s) => s.reducedMotion)
  const showroom = stage === 'garment' || stage === 'world'
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)
  const flight = useRef({ from: new Vector3(), to: new Vector3(), progress: 1 })
  useEffect(() => {
    let distance = stage === 'reveal' || showroom ? 8.7 : 7.8
    if (stage !== 'reveal' && !showroom && (origin || destination)) {
      distance = 6.6
    }
    flight.current.from.copy(camera.position)
    const direction = stage === 'reveal' || showroom ? new Vector3(0, 0.02, 1).normalize() : camera.position.clone().normalize()
    flight.current.to.copy(direction.multiplyScalar(distance))
    flight.current.progress = reducedMotion ? 1 : 0
    if (reducedMotion) { camera.position.copy(flight.current.to); controls.current?.update() }
  }, [origin, destination, stage, reducedMotion, camera, showroom])
  useFrame((_, delta) => {
    const state = flight.current
    if (state.progress >= 1) return
    state.progress = Math.min(1, state.progress + Math.min(delta, 0.1) / 2.2)
    const t = state.progress
    camera.position.lerpVectors(state.from, state.to, t*t*(3-2*t))
    controls.current?.update()
  })
  return <OrbitControls ref={controls} makeDefault enablePan={false} enableRotate={!showroom} enableZoom={!showroom} minDistance={2.5} maxDistance={12} enableDamping dampingFactor={0.06} autoRotate={!reducedMotion && !origin && !destination && stage !== 'reveal' && !showroom} autoRotateSpeed={0.3} rotateSpeed={0.45} onStart={() => { flight.current.progress = 1 }} />
}
