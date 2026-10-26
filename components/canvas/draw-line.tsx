'use client'

import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { type ComponentRef, useMemo, useRef } from 'react'
import { SIGNAL } from '@/lib/palette'
import type { Vec3 } from '@/lib/mark'
import type { Tween } from '@/lib/use-tweened'

type DrawLineProps = {
  points: Vec3[]
  segments?: boolean
  lineWidth?: number
  opacity?: number
  draw: Tween
  fade?: Tween
}

type DashMaterial = { dashSize: number; gapSize: number; opacity: number }

function measure(points: Vec3[], segments: boolean) {
  let total = 0
  const step = segments ? 2 : 1
  for (let i = 0; i + 1 < points.length; i += step) {
    const [ax, ay, az] = points[i]
    const [bx, by, bz] = points[i + 1]
    total += Math.hypot(bx - ax, by - ay, bz - az)
  }
  return total
}

/**
 * Fat signal line (pixel-width, so weight is a hierarchy tool) that draws
 * itself in via a single dash whose length grows with `draw`.
 */
export function DrawLine({ points, segments = false, lineWidth = 1, opacity = 1, draw, fade }: DrawLineProps) {
  const ref = useRef<ComponentRef<typeof Line>>(null)
  const total = useMemo(() => measure(points, segments), [points, segments])

  useFrame(() => {
    const line = ref.current
    if (!line) return
    const material = line.material as unknown as DashMaterial
    const f = fade ? fade.current.value : 1
    const d = draw.current.value
    line.visible = f > 0.002 && d > 0.0005
    material.dashSize = Math.max(total * d, 0.0001)
    material.gapSize = total * 2 + 10
    material.opacity = opacity * f
  })

  return (
    <Line
      ref={ref}
      points={points}
      segments={segments}
      lineWidth={lineWidth}
      color={SIGNAL}
      transparent
      opacity={opacity}
      dashed
      dashSize={0.0001}
      gapSize={total * 2 + 10}
      depthWrite={false}
      toneMapped={false}
    />
  )
}
