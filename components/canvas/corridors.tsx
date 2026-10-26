'use client'

import { useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import { useEffect, useMemo, useRef } from 'react'
import { CatmullRomCurve3, type Group, TubeGeometry } from 'three'
import { arcPoints, GLOBE_RADIUS, greatCircleKm, latLngToVector3 } from '@/lib/geo'
import { getLocation, LOCATIONS, type LocationId } from '@/lib/locations'
import type { Vec3 } from '@/lib/mark'
import { useJourney } from '@/lib/store'
import { createCorridorMaterial } from '@/lib/three/materials'
import { useTweened } from '@/lib/use-tweened'
import { DrawLine } from './draw-line'

function buildNetwork(): Vec3[] {
  const pairs = new Set<string>()
  for (const a of LOCATIONS) {
    const nearest = LOCATIONS.filter((b) => b.id !== a.id)
      .sort((x, y) => greatCircleKm(a, x) - greatCircleKm(a, y))
      .slice(0, 2)
    for (const b of nearest) pairs.add([a.id, b.id].sort().join('|'))
  }
  const segments: Vec3[] = []
  for (const pair of pairs) {
    const [a, b] = pair.split('|').map((id) => getLocation(id as LocationId))
    const points = arcPoints(
      latLngToVector3(a.lat, a.lng, GLOBE_RADIUS * 1.005),
      latLngToVector3(b.lat, b.lng, GLOBE_RADIUS * 1.005),
      48,
      0.12,
    )
    for (let i = 0; i < points.length - 1; i++) {
      segments.push([points[i].x, points[i].y, points[i].z], [points[i + 1].x, points[i + 1].y, points[i + 1].z])
    }
  }
  return segments
}

/** Faint lines that connect the resolved points during the network stage. */
export function NetworkLines() {
  const stage = useJourney((s) => s.stage)
  const segments = useMemo(buildNetwork, [])
  const draw = useTweened(stage === 'intro' ? 0 : 1, { duration: 3, delay: 3, ease: 'power2.inOut', initial: 0 })
  const visible = stage === 'network' || stage === 'q1' || stage === 'q2'
  const fade = useTweened(visible ? (stage === 'network' ? 1 : 0.5) : 0, { duration: 1.6, initial: 0 })

  return <DrawLine points={segments} segments lineWidth={0.7} opacity={0.3} draw={draw} fade={fade} />
}

function Corridor({ from, to }: { from: LocationId; to: LocationId }) {
  const stage = useJourney((s) => s.stage)
  const reducedMotion = useJourney((s) => s.reducedMotion)
  const group = useRef<Group>(null)

  const { core, halo } = useMemo(() => {
    const a = getLocation(from)
    const b = getLocation(to)
    const points = arcPoints(
      latLngToVector3(a.lat, a.lng, GLOBE_RADIUS * 1.005),
      latLngToVector3(b.lat, b.lng, GLOBE_RADIUS * 1.005),
      96,
      0.3,
    )
    const curve = new CatmullRomCurve3(points)
    return {
      core: new TubeGeometry(curve, 160, 0.008, 8, false),
      halo: new TubeGeometry(curve, 160, 0.032, 8, false),
    }
  }, [from, to])
  const coreMaterial = useMemo(() => createCorridorMaterial(1), [])
  const haloMaterial = useMemo(() => createCorridorMaterial(0.28), [])

  const draw = useTweened(1, { duration: 2.4, delay: 0.4, ease: 'power2.inOut', initial: 0 })
  const opacity = stage === 'q2' ? 1 : stage === 'world' ? 0.5 : 0
  const fade = useTweened(opacity, { duration: 1.8, initial: 1 })

  useEffect(() => {
    if (!group.current) return
    const collapse = stage === 'reveal' || stage === 'garment'
    const tween = gsap.to(group.current.scale, {
      x: collapse ? 0.97 : 1,
      y: collapse ? 0.97 : 1,
      z: collapse ? 0.97 : 1,
      duration: reducedMotion ? 0.01 : 2.2,
      ease: 'power3.inOut',
    })
    return () => {
      tween.kill()
    }
  }, [stage, reducedMotion])

  useEffect(() => {
    return () => {
      core.dispose()
      halo.dispose()
      coreMaterial.dispose()
      haloMaterial.dispose()
    }
  }, [core, halo, coreMaterial, haloMaterial])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    for (const material of [coreMaterial, haloMaterial]) {
      material.uniforms.uProgress.value = draw.current.value
      material.uniforms.uOpacity.value = fade.current.value
      material.uniforms.uTime.value = t
    }
    if (group.current) group.current.visible = fade.current.value > 0.002
  })

  return (
    <group ref={group}>
      <mesh geometry={halo} material={haloMaterial} />
      <mesh geometry={core} material={coreMaterial} />
    </group>
  )
}

/** The visitor's own corridor, rebuilt (and redrawn) whenever the pair changes. */
export function PersonalCorridor() {
  const origin = useJourney((s) => s.origin)
  const destination = useJourney((s) => s.destination)
  if (!origin || !destination) return null
  return <Corridor key={`${origin}-${destination}`} from={origin} to={destination} />
}
