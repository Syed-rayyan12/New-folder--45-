'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { BRAND_LOGO_PATHS } from '@/lib/brand-logo'


// Shared paths drive the engraving, metallic body, and travelling forge sparks.
const letters = BRAND_LOGO_PATHS.slice(0, 5)
const forgePaths = letters.map((_, i) => i === 5 ? 'M12 170H318' : 'M' + (40 + i * 61) + ' 12V142')

export function BrandIntro({ ready, onComplete }: { ready: boolean; onComplete: () => void }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const reduced = useReducedMotion()
  const [drawn, setDrawn] = useState(false)
  const [docking, setDocking] = useState(false)
  const [finished, setFinished] = useState(false)
  useEffect(() => {
    const timer = window.setTimeout(() => setDrawn(true), reduced ? 100 : 6400)
    return () => window.clearTimeout(timer)
  }, [reduced])

  useEffect(() => {
    if (drawn && ready) setDocking(true)
  }, [drawn, ready])

  // SVG trigonometry and Motion transforms differ slightly across server and
  // browser engines. Animate only after mount to keep hydration deterministic.
  if (!mounted) return <div className="brand-intro-curtain" aria-hidden="true" />
  return <>
    <motion.div className="brand-intro-curtain" aria-hidden="true"
      initial={{ opacity: 1 }} animate={{ opacity: finished ? 0 : 1 }}
      transition={{ duration: reduced ? 0 : 0.85 }} />
    <motion.div className="brand-intro-logo"
      initial={{ left: '50%', top: '50%', x: '-50%', y: '-50%', scale: 1 }}
      animate={{ left: docking ? '24px' : '50%', top: docking ? '22px' : '50%', x: docking ? '0%' : '-50%', y: docking ? '0%' : '-50%', scale: docking ? 0.4 : 1 }}
      transition={{ duration: reduced ? 0 : 1.35, ease: [0.76, 0, 0.24, 1] }}
      onAnimationComplete={() => {
        if (!docking || finished) return
        setFinished(true)
        onComplete()
      }}>
      <a href="/" aria-label="PRVLG home" tabIndex={finished ? 0 : -1}>
        <svg className="brand-forge-svg" viewBox="0 0 330 145" fill="none" role="img" aria-label="PRVLG">
          <defs>
            <filter id="brand-engraving-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.5" /></filter>
            <linearGradient id="brand-metal" x1="0" y1="0" x2="0.2" y2="1">
              <stop stopColor="#fff" /><stop offset=".24" stopColor="#ffffff" /><stop offset=".46" stopColor="#fff" /><stop offset=".52" stopColor="#ffffff" /><stop offset=".76" stopColor="#ffffff" /><stop offset="1" stopColor="#fff" />
            </linearGradient>
            <linearGradient id="brand-sweep"><stop stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
            <mask id="brand-stroke-mask">{letters.map((d, i) => <path key={i} d={d} fill="white" fillRule="evenodd" />)}</mask>
            {letters.map((_, i) => <clipPath key={i} id={`brand-letter-reveal-${i}`} clipPathUnits="userSpaceOnUse">
              <motion.rect x="0" width="330" initial={{ y: reduced ? 0 : 195, height: reduced ? 195 : 0 }} animate={{ y: 0, height: 195 }} transition={{ duration: reduced ? 0 : 2.2, delay: reduced ? 0 : 1.5+i*.3, ease: 'easeInOut' }} />
            </clipPath>)}
          </defs>
          {!reduced && <motion.g aria-hidden="true" animate={{ opacity: docking ? 0 : 1 }} transition={{ duration: .45 }}>
            <motion.g initial={{ opacity: 0, scale: .4, rotate: -80 }} animate={{ opacity: [0, .65, .3], scale: 1, rotate: 0 }} transition={{ duration: 2 }} style={{ originX: '165px', originY: '95px' }}>
              <ellipse cx="165" cy="95" rx="150" ry="106" stroke="#ffffff25" strokeWidth=".5" />
              <ellipse cx="165" cy="95" rx="177" ry="124" stroke="#ffffff18" strokeWidth=".5" strokeDasharray="2 7" />
              <path d="M-30 95H360M165-55V245M25-5L305 195M25 195L305-5" stroke="#ffffff16" strokeWidth=".5" />
              {Array.from({length: 40}, (_, i) => {
                const a = i / 40 * Math.PI * 2
                return <path key={i} d={`M${165+Math.cos(a)*156} ${95+Math.sin(a)*112}L${165+Math.cos(a)*(i%5===0?166:160)} ${95+Math.sin(a)*(i%5===0?120:116)}`} stroke={i%10===0?'#ffffff':'#ffffff55'} strokeWidth=".7" />
              })}
            </motion.g>
            <motion.ellipse cx="165" cy="95" rx="143" ry="99" stroke="#ffffff80" strokeWidth=".8" strokeDasharray="30 160" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 270, opacity: [0,.75,0] }} transition={{ duration: 5.7, ease: 'easeInOut' }} style={{ originX: '165px', originY: '95px' }} />
            {Array.from({length: 52}, (_, i) => {
              const angle=i*2.39996, radius=130+(i%7)*16
              const x=165+Math.cos(angle)*radius, y=95+Math.sin(angle)*radius*.7
              const endX=14+(i*47)%300, endY=15+(i*19)%125
              return <motion.path key={i} d={`M0 0l${i%2?3:1} ${i%3?1:4}`} stroke={i%13===0?'#ffffff':'#fff'} strokeWidth={i%4===0?1.5:.6}
                initial={{ x, y, opacity:0, rotate:i*37 }} animate={{ x:[x,x*.8+endX*.2,endX], y:[y,y*.8+endY*.2,endY], opacity:[0,.8,0], rotate:0 }} transition={{ duration:2.1, delay:.4+(i%13)*.14, ease:[.4,0,.2,1] }} />
            })}
          </motion.g>}
          {letters.map((d, i) => <motion.g key={i}
            initial={reduced ? false : { y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, delay: reduced ? 0 : .8+i*.17, ease: [.16,1,.3,1] }}>
            <g clipPath={`url(#brand-letter-reveal-${i})`}>
              <path d={d} fill="#ffffff" fillRule="evenodd" stroke="white" strokeWidth=".25" />
              <motion.path d={d} fill="white" fillRule="evenodd" initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : .65, delay: reduced ? 0 : 5.35 }} />
            </g>
          </motion.g>)}
          {!reduced && <g aria-hidden="true">
            {letters.map((d,i) => <motion.g key={d} initial={{opacity:0}} animate={{opacity:[0,1,1,0]}} transition={{duration:2.3,delay:1.5+i*.3,times:[0,.05,.9,1]}}>
              <circle r="3" fill="#fff" filter="url(#brand-engraving-glow)"><animateMotion path={forgePaths[i]} begin={`${1.5+i*.3}s`} dur="2.2s" calcMode="paced" fill="freeze" /></circle>
              <circle r="1" fill="#fff"><animateMotion path={forgePaths[i]} begin={`${1.5+i*.3}s`} dur="2.2s" calcMode="paced" fill="freeze" /></circle>
            </motion.g>)}
            <g mask="url(#brand-stroke-mask)"><motion.rect x="-100" y="0" width="75" height="195" fill="url(#brand-sweep)" initial={{x:0,opacity:0}} animate={{x:480,opacity:[0,1,1,0]}} transition={{duration:1.25,delay:4.65,ease:'easeInOut'}} /></g>
            <motion.ellipse cx="165" cy="95" rx="156" ry="112" stroke="#ffffff" strokeWidth=".6" initial={{scale:.85,opacity:0}} animate={{scale:[.85,1.2,1.5],opacity:[0,.4,0]}} transition={{duration:1.4,delay:4.8}} style={{originX:'165px',originY:'95px'}} />
          </g>}
        </svg>
      </a>
    </motion.div>
    {!finished && <div className={`brand-intro-caption${docking ? ' is-leaving' : ''}`} role="status" aria-live="polite">
      <span>{drawn ? 'PREPARING YOUR UNIVERSE' : 'CRAFTING YOUR SIGNATURE'}</span>
      <i aria-hidden="true" />
    </div>}
  </>
}
