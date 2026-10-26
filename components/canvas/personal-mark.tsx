'use client'

import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useEffect, useMemo, useRef } from 'react'
import { type Group, Vector2, Vector3 } from 'three'
import { generateMark, type MarkLayer, type MarkSpec } from '@/lib/mark'
import { scrollState } from '@/lib/runtime'
import { type Stage, useJourney } from '@/lib/store'
import { type Tween, useTweened } from '@/lib/use-tweened'
import { DrawLine } from './draw-line'

const Y_AXIS = new Vector3(0, 1, 0)
const X_AXIS = new Vector3(1, 0, 0)

const SHOWN: Stage[] = ['reveal', 'garment', 'world']
const FADE: Partial<Record<Stage, number>> = { reveal: 1, garment: 0.75, world: 0.85 }

function placement(stage: Stage, isMobile: boolean) {
  if (stage === 'garment') {
    return isMobile
      ? { position: [0, 2.15, -0.8] as const, scale: 0.34 }
      : { position: [-2.05, 0.95, -0.6] as const, scale: 0.42 }
  }
  if (stage === 'world') {
    return isMobile ? { position: [0, 0.6, -1] as const, scale: 0.62 } : { position: [1.75, 0, 0] as const, scale: 0.62 }
  }
  return { position: [0, 0, 0] as const, scale: 1 }
}

function useOrbitDrag(enabled: boolean) {
  const gl = useThree((state) => state.gl)
  const velocity = useRef(new Vector2())
  const dragging = useRef(false)

  useEffect(() => {
    if (!enabled) return
    const element = gl.domElement
    let last = { x: 0, y: 0 }
    const down = (event: PointerEvent) => {
      dragging.current = true
      last = { x: event.clientX, y: event.clientY }
      element.setPointerCapture(event.pointerId)
    }
    const move = (event: PointerEvent) => {
      if (!dragging.current) return
      velocity.current.set((event.clientX - last.x) * 0.0055, (event.clientY - last.y) * 0.0055)
      last = { x: event.clientX, y: event.clientY }
    }
    const up = (event: PointerEvent) => {
      dragging.current = false
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId)
    }
    element.style.touchAction = 'none'
    element.style.cursor = 'grab'
    element.addEventListener('pointerdown', down)
    element.addEventListener('pointermove', move)
    element.addEventListener('pointerup', up)
    element.addEventListener('pointercancel', up)
    return () => {
      element.style.touchAction = ''
      element.style.cursor = ''
      element.removeEventListener('pointerdown', down)
      element.removeEventListener('pointermove', move)
      element.removeEventListener('pointerup', up)
      element.removeEventListener('pointercancel', up)
    }
  }, [enabled, gl])

  return { velocity, dragging }
}

function Layer({ layer, draw, fade }: { layer: MarkLayer; draw: Tween; fade: Tween }) {
  return <DrawLine points={layer.segments} segments lineWidth={layer.lineWidth} opacity={layer.opacity} draw={draw} fade={fade} />
}

function MarkStructure({ spec }: { spec: MarkSpec }) {
  const stage = useJourney((s) => s.stage)
  const isMobile = useJourney((s) => s.isMobile)
  const reducedMotion = useJourney((s) => s.reducedMotion)
  const shown = SHOWN.includes(stage)

  const fade = useTweened(FADE[stage] ?? 0, { duration: 1.8, initial: 0 })
  const target = shown ? 1 : 0
  const journey = useTweened(target, { duration: 1.6, delay: 0.2, initial: 0 })
  const outer = useTweened(target, { duration: 2.2, delay: 1.1, initial: 0 })
  const inner = useTweened(target, { duration: 2, delay: 1.7, initial: 0 })
  const spokes = useTweened(target, { duration: 1.6, delay: 2.6, initial: 0 })
  const orbit = useTweened(target, { duration: 2.4, delay: 2.1, initial: 0 })
  const emerge = useTweened(target, { duration: 2.6, delay: 0.9, ease: 'expo.out', initial: 0 })
  const draws: Record<MarkLayer['name'], Tween> = { journey, outer, inner, spokes, orbit }

  const placementGroup = useRef<Group>(null)
  const scrollGroup = useRef<Group>(null)
  const spinGroup = useRef<Group>(null)
  const core = useRef<Group>(null)
  const spinAxis = useMemo(() => new Vector3(...spec.spinAxis), [spec.spinAxis])
  const { velocity, dragging } = useOrbitDrag(stage === 'reveal')

  useEffect(() => {
    const node = placementGroup.current
    if (!node) return
    const { position, scale } = placement(stage, isMobile)
    const duration = reducedMotion ? 0.01 : 2.4
    const tl = gsap.timeline({ defaults: { duration, ease: 'power3.inOut' } })
    tl.to(node.position, { x: position[0], y: position[1], z: position[2] }, 0)
    tl.to(node.scale, { x: scale, y: scale, z: scale }, 0)
    return () => {
      tl.kill()
    }
  }, [stage, isMobile, reducedMotion])

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1)
    if (!placementGroup.current || !spinGroup.current || !scrollGroup.current || !core.current) return
    placementGroup.current.visible = fade.current.value > 0.002

    const e = emerge.current.value
    core.current.scale.setScalar(0.15 + e * 0.85)

    if (!dragging.current) velocity.current.multiplyScalar(Math.exp(-delta * 2.4))
    const idle = reducedMotion || !shown ? 0 : spec.spinSpeed * delta * e * e
    spinGroup.current.rotateOnWorldAxis(Y_AXIS, velocity.current.x)
    spinGroup.current.rotateOnWorldAxis(X_AXIS, velocity.current.y)
    spinGroup.current.rotateOnAxis(spinAxis, idle)
    if (dragging.current) velocity.current.multiplyScalar(0.6)

    scrollGroup.current.rotation.y = stage === 'world' ? scrollState.progress * Math.PI * 1.6 : 0
  })

  const journeyLayer = spec.layers.find((l) => l.name === 'journey')
  const structural = spec.layers.filter((l) => l.name !== 'journey')

  return (
    <group ref={placementGroup}>
      <group ref={scrollGroup}>
        <group ref={spinGroup}>
          {journeyLayer && <Layer layer={journeyLayer} draw={draws.journey} fade={fade} />}
          <group ref={core}>
            {structural.map((layer) => (
              <Layer key={layer.name} layer={layer} draw={draws[layer.name]} fade={fade} />
            ))}
          </group>
        </group>
      </group>
    </group>
  )
}

/** Stage 5: the visitor's deterministic PRVLG mark. */
export function PersonalMark() {
  const origin = useJourney((s) => s.origin)
  const destination = useJourney((s) => s.destination)
  const spec = useMemo(() => (origin && destination ? generateMark(origin, destination) : null), [origin, destination])
  if (!spec) return null
  return <MarkStructure key={spec.serial} spec={spec} />
}
