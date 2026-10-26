'use client'

import { Html, Instance, Instances } from '@react-three/drei'
import { type ThreeEvent, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { MathUtils, type Object3D, Quaternion, Vector3 } from 'three'
import { GLOBE_RADIUS, latLngToVector3 } from '@/lib/geo'
import { LOCATIONS, type LocationId } from '@/lib/locations'
import { SIGNAL } from '@/lib/palette'
import { useJourney } from '@/lib/store'
import { useTweened } from '@/lib/use-tweened'

const FORWARD = new Vector3(0, 0, 1)
const cameraDir = new Vector3()

const LABEL_BASE: Record<string, number> = {
  network: 0.5,
  q1: 0.65,
  q2: 0.65,
}

/**
 * Real locations resolving out of the constellation. Dots, rings and hit
 * targets are instanced; labels are lightweight DOM nodes updated per frame.
 */
export function LocationMarkers() {
  const stage = useJourney((s) => s.stage)
  const origin = useJourney((s) => s.origin)
  const destination = useJourney((s) => s.destination)
  const hovered = useJourney((s) => s.hovered)
  const setHovered = useJourney((s) => s.setHovered)
  const selectLocation = useJourney((s) => s.selectLocation)

  const visibleStage = stage === 'network' || stage === 'q1' || stage === 'q2'
  const interactive = stage === 'q1' || stage === 'q2'
  const resolve = useTweened(stage === 'intro' ? 0 : 1, { duration: 2.6, delay: 1.6, ease: 'power2.out', initial: 0 })
  const fade = useTweened(visibleStage ? 1 : 0, { duration: 1.4, initial: 0 })

  const markers = useMemo(
    () =>
      LOCATIONS.map((location) => {
        const normal = latLngToVector3(location.lat, location.lng, 1)
        return {
          location,
          normal,
          position: normal.clone().multiplyScalar(GLOBE_RADIUS * 1.005),
          labelPosition: normal.clone().multiplyScalar(GLOBE_RADIUS * 1.09),
          quaternion: new Quaternion().setFromUnitVectors(FORWARD, normal),
        }
      }),
    [],
  )

  const dots = useRef<(Object3D | null)[]>([])
  const rings = useRef<(Object3D | null)[]>([])
  const labels = useRef<(HTMLDivElement | null)[]>([])
  const scales = useRef(markers.map(() => 0))

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1)
    const t = state.clock.elapsedTime
    const r = resolve.current.value
    const f = fade.current.value
    cameraDir.copy(state.camera.position).normalize()

    markers.forEach((marker, i) => {
      const id = marker.location.id
      const appear = MathUtils.smoothstep(r, i / markers.length * 0.7, i / markers.length * 0.7 + 0.3)
      const selected = id === origin || id === destination
      const isHovered = id === hovered && interactive
      const target = appear * f * (selected ? 1.7 : isHovered ? 1.45 : 1)
      scales.current[i] = MathUtils.damp(scales.current[i], target, 6, delta)
      const s = scales.current[i]

      dots.current[i]?.scale.setScalar(Math.max(s, 0.0001))
      const pulse = selected ? 1 + ((t * 0.6 + i * 0.13) % 1) * 1.6 : 1 + Math.sin(t * 1.4 + i) * 0.08
      rings.current[i]?.scale.setScalar(Math.max(s * pulse, 0.0001))

      const label = labels.current[i]
      if (label) {
        const facing = MathUtils.smoothstep(marker.normal.dot(cameraDir), 0.05, 0.35)
        const base = LABEL_BASE[stage] ?? 0
        const emphasis = selected || isHovered ? 1 : base
        label.style.opacity = String(emphasis * facing * appear * f)
        label.style.visibility = facing * appear * f > 0.01 ? 'visible' : 'hidden'
      }
    })
  })

  const onOver = (id: LocationId) => (event: ThreeEvent<PointerEvent>) => {
    if (!interactive) return
    event.stopPropagation()
    if (stage === 'q2' && id === origin) return
    setHovered(id)
  }
  const onOut = () => setHovered(null)
  const onClick = (id: LocationId) => (event: ThreeEvent<MouseEvent>) => {
    if (!interactive) return
    event.stopPropagation()
    selectLocation(id)
  }

  return (
    <group>
      <Instances limit={markers.length} frustumCulled={false}>
        <octahedronGeometry args={[0.035, 0]} />
        <meshBasicMaterial color={SIGNAL} toneMapped={false} />
        {markers.map((marker, i) => (
          <Instance
            key={marker.location.id}
            ref={(node: Object3D | null) => {
              dots.current[i] = node
            }}
            position={marker.position}
            quaternion={marker.quaternion}
            scale={0.0001}
          />
        ))}
      </Instances>

      <Instances limit={markers.length} frustumCulled={false}>
        <ringGeometry args={[0.075, 0.085, 48]} />
        <meshBasicMaterial color={SIGNAL} transparent opacity={0.55} depthWrite={false} toneMapped={false} />
        {markers.map((marker, i) => (
          <Instance
            key={marker.location.id}
            ref={(node: Object3D | null) => {
              rings.current[i] = node
            }}
            position={marker.position}
            quaternion={marker.quaternion}
            scale={0.0001}
          />
        ))}
      </Instances>

      <Instances limit={markers.length} frustumCulled={false} visible={interactive}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        {markers.map((marker) => (
          <Instance
            key={marker.location.id}
            position={marker.position}
            onPointerOver={onOver(marker.location.id)}
            onPointerOut={onOut}
            onClick={onClick(marker.location.id)}
          />
        ))}
      </Instances>

      {markers.map((marker, i) => (
        <Html key={marker.location.id} position={marker.labelPosition} center zIndexRange={[10, 0]} pointerEvents="none">
          <div
            ref={(node) => {
              labels.current[i] = node
            }}
            aria-hidden="true"
            className="pointer-events-none select-none whitespace-nowrap text-center"
            style={{ opacity: 0, visibility: 'hidden' }}
          >
            <span className="block font-mono text-[10px] tracking-[0.2em] text-signal/60">{marker.location.code}</span>
            <span className="block font-sans text-[10px] uppercase tracking-[0.35em] text-signal">
              {marker.location.name}
            </span>
          </div>
        </Html>
      ))}
    </group>
  )
}
