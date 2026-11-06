'use client'

import { motion,useReducedMotion } from 'framer-motion'
import { useEffect,useRef,useState } from 'react'
import { ParticleLogo } from './particle-logo'

/** Form on black, then retain the same logo in the page's top-left corner. */
export function BrandIntro({ready,complete=false,onComplete,onTextureReady}:{ready:boolean;complete?:boolean;onComplete:()=>void;onTextureReady?:(canvas:HTMLCanvasElement)=>void}){
  const reduced=Boolean(useReducedMotion())
  const logo=useRef<HTMLDivElement>(null),notified=useRef(false)
  const [mounted,setMounted]=useState(false),[drawn,setDrawn]=useState(false),[naturalWidth,setNaturalWidth]=useState(660)
  useEffect(()=>{setMounted(true)},[])
  useEffect(()=>{if(!mounted||!logo.current)return;const element=logo.current,observer=new ResizeObserver(()=>setNaturalWidth(Math.max(1,element.offsetWidth)));observer.observe(element);return()=>observer.disconnect()},[mounted])
  const docking=complete||(drawn&&ready)
  if(!mounted)return <div className="brand-intro-curtain" aria-hidden="true"/>
  return <>
    {!complete&&<motion.div className="brand-intro-curtain" aria-hidden="true" initial={{opacity:1}} animate={{opacity:docking?0:1}} transition={{duration:reduced?0:.95}}/>}
    <motion.div ref={logo} className="brand-intro-logo brand-particle-logo" style={{transformOrigin:'0% 0%'}} initial={{left:'50%',top:'50%',x:'-50%',y:'-50%',scale:1,opacity:1}} animate={{left:docking?'clamp(16px, 4vw, 56px)':'50%',top:docking?'20px':'50%',x:docking?'0%':'-50%',y:docking?'0%':'-50%',scale:docking?Math.min(120,naturalWidth*.28)/naturalWidth:1,opacity:1}} transition={{duration:reduced?0:.95,ease:[.22,1,.36,1]}} onAnimationComplete={()=>{if(docking&&!notified.current){notified.current=true;onComplete()}}}>
      <ParticleLogo reduced={reduced} onDrawn={()=>setDrawn(true)} onTextureReady={onTextureReady}/>
    </motion.div>
    {!complete&&<div className={`brand-intro-caption${docking?' is-leaving':''}`} role="status" aria-live="polite"><span>{drawn?'OPENING YOUR UNIVERSE':'CRAFTING YOUR SIGNATURE'}</span><i aria-hidden="true"/></div>}
  </>
}
