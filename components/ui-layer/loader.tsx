'use client'

import { useProgress } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import { useJourney } from '@/lib/store'

/** A single thin green progress line while the scene and garment load. */
export function Loader() {
  const ready = useJourney((s) => s.ready)
  const { progress } = useProgress()
  const value = Math.max(progress, 6)

  return (
    <AnimatePresence>
      {!ready && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] } }}
          role="status"
          aria-live="polite"
        >
          <div className="flex w-48 flex-col items-center gap-4">
            <div className="relative h-px w-full bg-signal/10">
              <motion.div
                className="absolute inset-y-0 left-0 bg-signal"
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="font-mono text-[10px] tracking-[0.3em] text-signal/40">
              {String(Math.round(progress)).padStart(3, '0')}
            </span>
            <span className="sr-only">Loading the PRVLG experience</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
