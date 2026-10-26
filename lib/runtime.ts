import type Lenis from 'lenis'

/**
 * Mutable, non-reactive values read inside the render loop. Kept outside React
 * so pointer moves and scroll ticks never trigger re-renders.
 */
export const pointer = { x: 0, y: 0 }
export const scrollState = { progress: 0 }
export const runtime: { lenis: Lenis | null } = { lenis: null }

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}
