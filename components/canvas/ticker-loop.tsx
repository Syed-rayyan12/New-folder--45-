'use client'

import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useEffect } from 'react'

/**
 * The Canvas runs with frameloop="never"; GSAP's ticker advances it. Lenis is
 * also driven by the same ticker, so scroll, timelines and WebGL share one RAF.
 */
export function TickerLoop() {
  const advance = useThree((state) => state.advance)

  useEffect(() => {
    const tick = (time: number) => advance(time)
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [advance])

  return null
}
