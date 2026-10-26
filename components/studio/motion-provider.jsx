'use client'

import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import Lenis from 'lenis'

export function MotionProvider({ children }) {
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    let lenis, frame
    const stop = () => { cancelAnimationFrame(frame); lenis?.destroy(); lenis = null }
    const start = () => {
      stop()
      if (query.matches) return
      lenis = new Lenis({ duration: 1.05, smoothWheel: true, anchors: { offset: -96 } })
      const tick = time => { lenis?.raf(time); frame = requestAnimationFrame(tick) }
      frame = requestAnimationFrame(tick)
    }
    const visibility = () => {
      document.documentElement.dataset.pageHidden = String(document.hidden)
      document.hidden ? stop() : start()
    }
    start(); query.addEventListener('change', start); document.addEventListener('visibilitychange', visibility)
    return () => { stop(); delete document.documentElement.dataset.pageHidden; query.removeEventListener('change', start); document.removeEventListener('visibilitychange', visibility) }
  }, [])
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
