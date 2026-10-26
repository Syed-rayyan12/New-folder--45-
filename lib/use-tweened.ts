'use client'

import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { useJourney } from './store'

export type Tween = { current: { value: number } }

type Options = {
  duration?: number
  delay?: number
  ease?: string
  initial?: number
}

/**
 * A GSAP-driven scalar for the 3D layer. Returns a ref read inside useFrame,
 * so scene choreography never round-trips through React state.
 */
export function useTweened(target: number, { duration = 1.8, delay = 0, ease = 'power3.inOut', initial }: Options = {}): Tween {
  const ref = useRef({ value: initial ?? target })
  const reducedMotion = useJourney((s) => s.reducedMotion)

  useEffect(() => {
    const tween = gsap.to(ref.current, {
      value: target,
      duration: reducedMotion ? 0.01 : duration,
      delay: reducedMotion ? 0 : delay,
      ease,
      overwrite: true,
    })
    return () => {
      tween.kill()
    }
  }, [target, duration, delay, ease, reducedMotion])

  return ref
}
