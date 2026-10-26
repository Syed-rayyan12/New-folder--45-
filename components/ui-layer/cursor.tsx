'use client'

import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useJourney } from '@/lib/store'

/** Minimal green cursor; expands over globe points and interactive elements. */
export function Cursor() {
  const hoveredPoint = useJourney((s) => s.hovered)
  const [enabled, setEnabled] = useState(false)
  const [overUi, setOverUi] = useState(false)
  const [pressed, setPressed] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, { stiffness: 260, damping: 30, mass: 0.6 })
  const ringY = useSpring(y, { stiffness: 260, damping: 30, mass: 0.6 })

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)')
    if (!fine.matches) return
    setEnabled(true)
    document.documentElement.classList.add('has-cursor')
    const move = (event: PointerEvent) => {
      x.set(event.clientX)
      y.set(event.clientY)
      const target = event.target as Element | null
      setOverUi(Boolean(target?.closest('a, button, select, input, [data-cursor="hover"]')))
    }
    const down = () => setPressed(true)
    const up = () => setPressed(false)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
    }
  }, [x, y])

  if (!enabled) return null
  const active = Boolean(hoveredPoint) || overUi
  const ringSize = hoveredPoint ? 56 : overUi ? 36 : 22

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60]">
      <motion.div className="absolute left-0 top-0" style={{ x, y }}>
        <div className="size-1 -translate-x-1/2 -translate-y-1/2 bg-signal" />
      </motion.div>
      <motion.div className="absolute left-0 top-0" style={{ x: ringX, y: ringY }}>
        <motion.div
          className="-translate-x-1/2 -translate-y-1/2 rounded-full border border-signal"
          animate={{
            width: ringSize,
            height: ringSize,
            opacity: active ? 1 : 0.4,
            scale: pressed ? 0.8 : 1,
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.div>
    </div>
  )
}
