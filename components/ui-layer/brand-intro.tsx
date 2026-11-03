'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ParticleLogo } from './particle-logo'

export function BrandIntro({ ready, onComplete }: { ready: boolean; onComplete: () => void }) {
  const reduced = Boolean(useReducedMotion())
  const [mounted, setMounted] = useState(false)
  const [drawn, setDrawn] = useState(false)
  const [finished, setFinished] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const docking = drawn && ready
  if (!mounted) return <div className="brand-intro-curtain" aria-hidden="true" />
  return <>
    <motion.div className="brand-intro-curtain" aria-hidden="true" initial={{ opacity: 1 }} animate={{ opacity: finished ? 0 : 1 }} transition={{ duration: reduced ? 0 : 0.55 }} />
    <motion.div className="brand-intro-logo brand-particle-logo"
      initial={{ left: '50%', top: '50%', x: '-50%', y: '-50%', scale: 1 }}
      animate={{ left: docking ? '24px' : '50%', top: docking ? '18px' : '50%', x: docking ? '0%' : '-50%', y: docking ? '0%' : '-50%', scale: docking ? 0.2 : 1 }}
      transition={{ duration: reduced ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={() => { if (docking && !finished) { setFinished(true); onComplete() } }}>
      <a href="/" aria-label="PRVLG HERITAGE home" tabIndex={finished ? 0 : -1}>
        <ParticleLogo reduced={reduced} onDrawn={() => setDrawn(true)} />
      </a>
    </motion.div>
    {!finished && <div className={`brand-intro-caption${docking ? ' is-leaving' : ''}`} role="status" aria-live="polite">
      <span>{drawn ? 'PREPARING YOUR UNIVERSE' : 'CRAFTING YOUR SIGNATURE'}</span><i aria-hidden="true" />
    </div>}
  </>
}
