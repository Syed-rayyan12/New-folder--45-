'use client'

import { motion,useReducedMotion } from 'framer-motion'
import { useEffect,useRef,useState } from 'react'
import { ParticleLogo } from './particle-logo'
import type { GlobeBrandTarget } from '../canvas/globe-brand'

/** Form on black first; hand the completed logo to its matching 3D anchor. */
export function BrandIntro({ready,target,onComplete,onTextureReady}:{ready:boolean;target?:GlobeBrandTarget|null;onComplete:()=>void;onTextureReady?:(canvas:HTMLCanvasElement)=>void}){
  const reduced=Boolean(useReducedMotion())
  const logo=useRef<HTMLDivElement>(null),notified=useRef(false)
  const [mounted,setMounted]=useState(false),[drawn,setDrawn]=useState(false),[naturalWidth,setNaturalWidth]=useState(660)
  useEffect(()=>{setMounted(true)},[])
  useEffect(()=>{if(!mounted||!logo.current)return;const element=logo.current,observer=new ResizeObserver(()=>setNaturalWidth(Math.max(1,element.offsetWidth)));observer.observe(element);return()=>observer.disconnect()},[mounted])
  const docking=drawn&&ready
  if(!mounted)return <div className="brand-intro-curtain" aria-hidden="true"/>
  return <>
    <motion.div className="brand-intro-curtain" aria-hidden="true" initial={{opacity:1}} animate={{opacity:docking?0:1}} transition={{duration:reduced?0:.95}}/>
    <motion.div ref={logo} className="brand-intro-logo brand-particle-logo" style={{transformOrigin:'50% 50%'}} initial={{left:'50%',top:'50%',x:'-50%',y:'-50%',scale:1,opacity:1}} animate={{left:docking&&target?`${target.x}px`:'50%',top:docking&&target?`${target.y}px`:'50%',x:'-50%',y:'-50%',scale:docking?(target?.width||160)/naturalWidth:1,opacity:docking?0:1}} transition={{duration:reduced?0:.95,ease:[.22,1,.36,1]}} onAnimationComplete={()=>{if(docking&&!notified.current){notified.current=true;onComplete()}}}>
      <ParticleLogo reduced={reduced} onDrawn={()=>setDrawn(true)} onTextureReady={onTextureReady}/>
    </motion.div>
    <div className={`brand-intro-caption${docking?' is-leaving':''}`} role="status" aria-live="polite"><span>{drawn?'OPENING YOUR UNIVERSE':'CRAFTING YOUR SIGNATURE'}</span><i aria-hidden="true"/></div>
  </>
}
