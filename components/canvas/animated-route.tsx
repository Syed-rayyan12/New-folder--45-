'use client'

import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type ComponentRef } from 'react'
import { CatmullRomCurve3, Mesh, OrthographicCamera, type Vector3 } from 'three'
import { CONNECTION_COLOR, POINT_COLOR } from '@/lib/palette'
import { useJourney } from '@/lib/store'

/** Draw the selected route once, from origin to destination, then leave it still. */
export function AnimatedRoute({ points }: { points: Vector3[] }) {
  const reducedMotion = useJourney((s) => s.reducedMotion)
  const flat = useJourney(s => s.mapView === 'flat')
  const progress = useRef(0)
  const line = useRef<ComponentRef<typeof Line>>(null)
  const tip = useRef<Mesh>(null)
  const curve = useMemo(() => new CatmullRomCurve3(points), [points])
  useEffect(() => { progress.current = 0 }, [points])
  useFrame((state, delta) => {
    progress.current = reducedMotion ? 1 : Math.min(1, progress.current + Math.min(delta, 0.1) / 2.2)
    if (line.current) line.current.geometry.instanceCount = Math.floor((points.length - 1) * progress.current)
    if (tip.current) {
      tip.current.position.copy(curve.getPoint(progress.current))
      tip.current.scale.setScalar(flat && state.camera instanceof OrthographicCamera ? 3.5 / (state.camera.zoom * 0.026) : 1)
    }
  })
  return <group><Line ref={line} points={points} color={CONNECTION_COLOR} lineWidth={flat ? 2.5 : 1.8} transparent depthTest={!flat} depthWrite={false} renderOrder={flat ? 5 : 0} toneMapped={false} raycast={() => {}} /><mesh ref={tip} renderOrder={flat ? 6 : 0}>{flat ? <circleGeometry args={[0.026, 24]} /> : <sphereGeometry args={[0.026, 12, 12]} />}<meshBasicMaterial color={POINT_COLOR} transparent depthWrite={false} depthTest={!flat} toneMapped={false} /></mesh></group>
}
