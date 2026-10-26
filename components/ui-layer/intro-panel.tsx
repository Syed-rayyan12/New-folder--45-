'use client'

import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { LocationId } from '@/lib/locations'
import { panel, rise } from '@/lib/motion'
import { useJourney } from '@/lib/store'
import { enableTiltParallax } from '@/lib/use-environment'

export const PAIR_STORAGE_KEY = 'prvlg:pair'

const HOLD_SECONDS = 1.1
const CIRCUMFERENCE = 2 * Math.PI * 27

/** The single invitation to enter: click, tap, or hold. */
export function IntroPanel() {
  const setStage = useJourney((s) => s.setStage)
  const isMobile = useJourney((s) => s.isMobile)
  const [savedPair, setSavedPair] = useState<[LocationId, LocationId] | null>(null)
  const [tiltOn, setTiltOn] = useState(false)
  const hold = useMotionValue(0)
  const dash = useTransform(hold, (v) => CIRCUMFERENCE * (1 - v))
  const pressStart = useRef(0)
  const holdAnimation = useRef<ReturnType<typeof animate> | null>(null)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PAIR_STORAGE_KEY)
      if (raw) setSavedPair(JSON.parse(raw))
    } catch {
      setSavedPair(null)
    }
  }, [])

  const enter = () => {
    holdAnimation.current?.stop()
    setStage('network')
  }

  const startHold = () => {
    pressStart.current = performance.now()
    holdAnimation.current = animate(hold, 1, { duration: HOLD_SECONDS, ease: 'linear', onComplete: enter })
  }
  const endHold = () => {
    const quick = performance.now() - pressStart.current < 260
    if (quick) return enter()
    holdAnimation.current?.stop()
    animate(hold, 0, { duration: 0.5 })
  }

  const resume = () => {
    if (!savedPair) return
    useJourney.setState({ origin: savedPair[0], destination: savedPair[1], stage: 'world', lighting: 'night' })
  }

  return (
    <motion.div variants={panel} initial="hidden" animate="visible" exit="exit" className="absolute inset-0">
      <h1 className="sr-only">PRVLG — Visible by day, revealed by night.</h1>

      <motion.div
        variants={rise}
        className="pointer-events-auto absolute inset-x-0 bottom-[12vh] flex flex-col items-center gap-5"
        transition={{ delay: 3.2 }}
      >
        <button
          type="button"
          aria-label="Enter PRVLG"
          className="group relative flex size-16 items-center justify-center rounded-full"
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={() => {
            holdAnimation.current?.stop()
            animate(hold, 0, { duration: 0.5 })
          }}
          onClick={(event) => {
            if (event.detail === 0) enter()
          }}
        >
          <svg viewBox="0 0 60 60" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
            <circle cx="30" cy="30" r="27" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
            <motion.circle
              cx="30"
              cy="30"
              r="27"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray={CIRCUMFERENCE}
              style={{ strokeDashoffset: dash }}
            />
          </svg>
          <span className="size-1.5 rounded-full bg-signal/60 transition-all duration-700 group-hover:size-2.5 group-hover:bg-signal" />
        </button>
        <p className="font-sans text-[10px] font-light uppercase tracking-[0.55em] text-signal/40">
          {isMobile ? 'Tap or hold to enter' : 'Click or hold to enter'}
        </p>
      </motion.div>

      <motion.div
        variants={rise}
        className="pointer-events-auto absolute inset-x-0 bottom-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6"
      >
        {savedPair && (
          <button
            type="button"
            onClick={resume}
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-signal/30 transition-colors duration-700 hover:text-signal"
          >
            Return to your mark
          </button>
        )}
        <button
          type="button"
          onClick={() => setStage('q1')}
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-signal/30 transition-colors duration-700 hover:text-signal"
        >
          Skip intro
        </button>
        {isMobile && !tiltOn && (
          <button
            type="button"
            onClick={async () => setTiltOn(await enableTiltParallax())}
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-signal/30 transition-colors duration-700 hover:text-signal"
          >
            Enable tilt
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}
