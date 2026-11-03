'use client'

import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, type ComponentRef } from 'react'
import { MOUSE, TOUCH, OrthographicCamera, PerspectiveCamera, Vector3 } from 'three'
import { FLAT_HEIGHT, FLAT_WIDTH, GLOBE_RADIUS } from '@/lib/geo'
import { useJourney } from '@/lib/store'

export function JourneyControls() {
  const camera = useThree((s) => s.camera)
  const origin = useJourney((s) => s.origin)
  const destination = useJourney((s) => s.destination)
  const stage = useJourney((s) => s.stage)
  const reducedMotion = useJourney((s) => s.reducedMotion)
  const mapView = useJourney(s => s.mapView)
  const zoomCommand = useJourney(s => s.zoomCommand)
  const size = useThree(s => s.size)
  const flat = mapView === 'flat' && !['reveal', 'garment', 'world'].includes(stage)
  const fitZoom = Math.min(size.width / (FLAT_WIDTH * 1.15), size.height / (FLAT_HEIGHT * 1.15))
  const showroom = stage === 'garment' || stage === 'world'
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)
  const flight = useRef({ from: new Vector3(), to: new Vector3(), progress: 1 })
  const fitDistance = () => {
    if (camera instanceof OrthographicCamera) return 20
    const fov = camera instanceof PerspectiveCamera ? camera.fov * Math.PI / 180 : Math.PI / 4
    return Math.max(FLAT_HEIGHT / 2, FLAT_WIDTH / 2 / (size.width / size.height)) / Math.tan(fov / 2) * 1.15
  }
  useEffect(() => {
    if (camera instanceof OrthographicCamera) { camera.zoom = fitZoom; camera.updateProjectionMatrix() }
    let distance = stage === 'reveal' || showroom ? 8.7 : 7.8
    if (stage !== 'reveal' && !showroom && (origin || destination)) {
      distance = 6.6
    }
    if (flat && stage !== 'reveal' && !showroom) distance = fitDistance()
    controls.current?.target.set(0, 0, 0)
    flight.current.from.copy(camera.position)
    const direction = flat || stage === 'reveal' || showroom ? new Vector3(0, flat ? 0 : 0.02, 1).normalize() : camera.position.clone().normalize()
    flight.current.to.copy(direction.multiplyScalar(distance))
    flight.current.progress = reducedMotion ? 1 : 0
    if (reducedMotion) { camera.position.copy(flight.current.to); controls.current?.update() }
  }, [origin, destination, stage, reducedMotion, camera, showroom, flat, size.width, size.height])
  useEffect(() => {
    if (!zoomCommand.sequence || !controls.current || showroom) return
    flight.current.progress = 1
    const control = controls.current
    if (camera instanceof OrthographicCamera) {
      camera.zoom = zoomCommand.action === 'reset' ? fitZoom : Math.max(fitZoom * 0.35, Math.min(fitZoom * 50, camera.zoom * (zoomCommand.action === 'in' ? 1.15 : 1 / 1.15)))
      if (zoomCommand.action === 'reset') { control.target.set(0, 0, 0); camera.position.set(0, 0, 20) }
      camera.updateProjectionMatrix()
      control.update()
      return
    }
    const offset = camera.position.clone().sub(control.target)
    if (zoomCommand.action === 'reset') {
      control.target.set(0, 0, 0)
      camera.position.copy(flat ? new Vector3(0, 0, 1).normalize().multiplyScalar(fitDistance()) : new Vector3(0, 0.7, 7.8))
    } else {
      const distance = offset.length()
      const next = Math.max(flat ? 0.3 : GLOBE_RADIUS + 0.15, Math.min(flat ? 70 : 18, distance * (zoomCommand.action === 'in' ? 1 / 1.15 : 1.15)))
      camera.position.copy(control.target).add(offset.multiplyScalar(next / distance))
    }
    control.update()
  }, [zoomCommand])
  useFrame((_, delta) => {
    const state = flight.current
    if (state.progress >= 1) return
    state.progress = Math.min(1, state.progress + Math.min(delta, 0.1) / 2.2)
    const t = state.progress
    camera.position.lerpVectors(state.from, state.to, t*t*(3-2*t))
    controls.current?.update()
  })
  return <OrbitControls ref={controls} makeDefault enablePan={flat && !showroom} screenSpacePanning enableRotate={!flat && !showroom} mouseButtons={flat ? { LEFT: MOUSE.PAN, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN } : { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN }} touches={flat ? { ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_PAN } : { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }} enableZoom={!showroom} minZoom={fitZoom * 0.35} maxZoom={fitZoom * 50} minDistance={flat ? 0.3 : GLOBE_RADIUS + 0.15} maxDistance={flat ? 70 : 18} minAzimuthAngle={flat ? 0 : -Infinity} maxAzimuthAngle={flat ? 0 : Infinity} minPolarAngle={flat ? Math.PI / 2 : 0} maxPolarAngle={flat ? Math.PI / 2 : Math.PI} zoomSpeed={0.45} enableDamping dampingFactor={0.06} autoRotate={!flat && !reducedMotion && !origin && !destination && stage !== 'reveal' && !showroom} autoRotateSpeed={0.3} rotateSpeed={0.45} onStart={() => { flight.current.progress = 1 }} />
}
