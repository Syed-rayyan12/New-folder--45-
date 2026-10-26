'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { BufferAttribute, BufferGeometry, type Mesh } from 'three'
import { GLOBE_RADIUS, latLngToVector3 } from '@/lib/geo'
import type { Vec3 } from '@/lib/mark'
import { BLACK } from '@/lib/palette'
import { useJourney } from '@/lib/store'
import { createPointCloudMaterial } from '@/lib/three/materials'
import { useTweened } from '@/lib/use-tweened'
import { DrawLine } from './draw-line'

function buildGraticule(): { meridians: Vec3[]; parallels: Vec3[]; equator: Vec3[] } {
  const meridians: Vec3[] = []
  const parallels: Vec3[] = []
  const equator: Vec3[] = []
  const r = GLOBE_RADIUS * 1.001
  const push = (target: Vec3[], lat0: number, lng0: number, lat1: number, lng1: number) => {
    const a = latLngToVector3(lat0, lng0, r)
    const b = latLngToVector3(lat1, lng1, r)
    target.push([a.x, a.y, a.z], [b.x, b.y, b.z])
  }
  for (let lng = -180; lng < 180; lng += 20) {
    for (let lat = -80; lat < 80; lat += 4) push(meridians, lat, lng, lat + 4, lng)
  }
  for (let lat = -60; lat <= 60; lat += 20) {
    if (lat === 0) continue
    for (let lng = -180; lng < 180; lng += 4) push(parallels, lat, lng, lat, lng + 4)
  }
  for (let lng = -180; lng < 180; lng += 3) push(equator, 0, lng, 0, lng + 3)
  return { meridians, parallels, equator }
}

/** Fibonacci-distributed constellation on the sphere, with a random resolve order. */
function buildPointCloud(count: number) {
  const positions = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const radius = Math.sqrt(1 - y * y)
    const theta = golden * i
    const jitter = 1 + (Math.sin(i * 12.9898) * 43758.5453 - Math.floor(Math.sin(i * 12.9898) * 43758.5453)) * 0.012
    positions[i * 3] = Math.cos(theta) * radius * GLOBE_RADIUS * jitter
    positions[i * 3 + 1] = y * GLOBE_RADIUS * jitter
    positions[i * 3 + 2] = Math.sin(theta) * radius * GLOBE_RADIUS * jitter
    seeds[i] = Math.random() * 0.9
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('aSeed', new BufferAttribute(seeds, 1))
  return geometry
}

const GLOBE_OPACITY: Record<string, number> = {
  intro: 0,
  network: 1,
  q1: 1,
  q2: 1,
  reveal: 0,
  garment: 0,
  world: 0.35,
}

/** Stage 2 backdrop: faint wireframe sphere plus a constellation of points. */
export function Globe() {
  const stage = useJourney((s) => s.stage)
  const isMobile = useJourney((s) => s.isMobile)
  const pixelRatio = useThree((state) => state.viewport.dpr)

  const opened = stage !== 'intro'
  const draw = useTweened(opened ? 1 : 0, { duration: 3.4, delay: 0.6, ease: 'power2.inOut', initial: 0 })
  const fade = useTweened(GLOBE_OPACITY[stage], { duration: 2, ease: 'power2.inOut', initial: 0 })

  const graticule = useMemo(buildGraticule, [])
  const geometry = useMemo(() => buildPointCloud(isMobile ? 1400 : 3200), [isMobile])
  const material = useMemo(() => createPointCloudMaterial(isMobile ? 2.6 : 2.2, 0.55), [isMobile])
  const occluder = useRef<Mesh>(null)

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  useFrame(() => {
    const f = fade.current.value
    material.uniforms.uDraw.value = draw.current.value
    material.uniforms.uOpacity.value = 0.55 * f
    material.uniforms.uPixelRatio.value = pixelRatio
    if (occluder.current) occluder.current.visible = f > 0.3
  })

  return (
    <group>
      <mesh ref={occluder} renderOrder={-1}>
        <sphereGeometry args={[GLOBE_RADIUS * 0.985, 48, 48]} />
        <meshBasicMaterial color={BLACK} />
      </mesh>
      <points geometry={geometry} material={material} />
      <DrawLine points={graticule.meridians} segments lineWidth={0.5} opacity={0.12} draw={draw} fade={fade} />
      <DrawLine points={graticule.parallels} segments lineWidth={0.5} opacity={0.1} draw={draw} fade={fade} />
      <DrawLine points={graticule.equator} segments lineWidth={0.8} opacity={0.3} draw={draw} fade={fade} />
    </group>
  )
}
