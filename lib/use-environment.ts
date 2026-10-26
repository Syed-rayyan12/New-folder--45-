'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useEffect, useState } from 'react'
import { pointer, runtime } from './runtime'
import { useJourney } from './store'

export function detectWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

/** Reduced motion, mobile detection and WebGL support. `null` until measured on the client. */
export function useEnvironment() {
  const setEnvironment = useJourney((s) => s.setEnvironment)
  const [webgl, setWebgl] = useState<boolean | null>(null)

  useEffect(() => {
    setWebgl(detectWebGL())
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mobile = window.matchMedia('(max-width: 768px), (pointer: coarse)')
    const update = () => setEnvironment({ reducedMotion: motion.matches, isMobile: mobile.matches })
    update()
    motion.addEventListener('change', update)
    mobile.addEventListener('change', update)
    return () => {
      motion.removeEventListener('change', update)
      mobile.removeEventListener('change', update)
    }
  }, [setEnvironment])

  return webgl
}

/** Normalised pointer (-1..1) shared with the render loop. */
export function usePointerParallax() {
  useEffect(() => {
    const move = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.y = -((event.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])
}

type OrientationPermission = { requestPermission?: () => Promise<'granted' | 'denied'> }

/** Gyroscope parallax, only ever attached after an explicit user gesture. */
export async function enableTiltParallax() {
  const Orientation = window.DeviceOrientationEvent as unknown as OrientationPermission | undefined
  if (!Orientation) return false
  if (typeof Orientation.requestPermission === 'function') {
    const result = await Orientation.requestPermission().catch(() => 'denied' as const)
    if (result !== 'granted') return false
  }
  window.addEventListener('deviceorientation', (event) => {
    if (event.gamma == null || event.beta == null) return
    pointer.x = Math.max(-1, Math.min(1, event.gamma / 30))
    pointer.y = Math.max(-1, Math.min(1, -(event.beta - 45) / 30))
  })
  return true
}

/**
 * Lenis driven by GSAP's ticker, feeding ScrollTrigger. Scrolling is locked
 * until the world stage opens.
 */
export function useSmoothScroll() {
  const stage = useJourney((s) => s.stage)
  const reducedMotion = useJourney((s) => s.reducedMotion)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const lenis = new Lenis({ autoRaf: false, lerp: reducedMotion ? 1 : 0.075, smoothWheel: !reducedMotion })
    runtime.lenis = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      runtime.lenis = null
    }
  }, [reducedMotion])

  useEffect(() => {
    const lenis = runtime.lenis
    const root = document.documentElement
    if (stage === 'world') {
      root.classList.remove('is-locked')
      lenis?.start()
      requestAnimationFrame(() => ScrollTrigger.refresh())
    } else {
      lenis?.scrollTo(0, { immediate: true, force: true })
      lenis?.stop()
      root.classList.add('is-locked')
    }
  }, [stage])
}
