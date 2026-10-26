'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { CatmullRomCurve3, Mesh, TubeGeometry, type Vector3 } from 'three'
import { useJourney } from '@/lib/store'

/** Draw the selected route once, from origin to destination, then leave it still. */
export function AnimatedRoute({ points }: { points: Vector3[] }) {
  const reducedMotion = useJourney((s) => s.reducedMotion)
  const progress = useRef(0)
  const tip = useRef<Mesh>(null)
  const curve = useMemo(() => new CatmullRomCurve3(points), [points])
  const geometry = useMemo(() => {
    const tube = new TubeGeometry(curve, 240, 0.007, 8, false)
    tube.setDrawRange(0, 0)
    return tube
  }, [curve])
  useEffect(() => () => geometry.dispose(), [geometry])
  useFrame((_, delta) => {
    progress.current = reducedMotion ? 1 : Math.min(1, progress.current + Math.min(delta, 0.1) / 2.2)
    const count = geometry.index!.count
    geometry.setDrawRange(0, Math.floor(count * progress.current / 48) * 48)
    if (tip.current) tip.current.position.copy(curve.getPointAt(progress.current))
  })
  return <group><mesh geometry={geometry}><meshBasicMaterial color="#76ff76" transparent opacity={0.85} toneMapped={false} /></mesh><mesh ref={tip}><sphereGeometry args={[0.026, 12, 12]} /><meshBasicMaterial color="#76ff76" toneMapped={false} /></mesh></group>
}
