'use client'

import { useLayoutEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import styles from './dashboard-motion.module.css'

const REGIONS='section:not([aria-label="Overview metrics"]):not([aria-label="Corridor metrics"]):not([aria-label="Campaign summary"]):not([aria-label="Journal summary"]),[class*="metrics"]>div,[class*="corridorMetrics"]>div,[class*="selectedPanel"]'
const TEXT='h1,h2,h3,p,strong,dt,dd,label,th,td,time,svg text,[class*="pageHead"]>span,[class*="eventCategory"],[class*="collectionLocked"]>span'
const ROWS='tbody tr,ol>li,ul>li'
const BARS='[class*="barTrack"]>span,[class*="sourceTrack"]>span,[class*="deviceTrack"]>i,[class*="completion"]>div>i'
const LINES='svg path[class*="routePath"],svg path[class*="mapArc"],svg polyline[class*="growthLine"],svg polyline[class*="visitorLine"],svg polyline[class*="sessionsLine"]'
const SKIP='nav,button,dialog,[role="dialog"],[class*="accountMenu"],[class*="drawer"]'

/** Reveal each piece when it enters the actual viewport, including nested scrollers. */
export function DashboardMotion({ children }) {
  const scope=useRef(null)
  const pathname=usePathname()
  useLayoutEffect(()=>{
    const container=scope.current
    if(!container||!('IntersectionObserver' in window))return
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)')
    let dispose=()=>{}
    const setup=()=>{
      dispose()
      if(preference.matches)return
      const targets=new Map(),animations=new Map()
      let frame=0
      const finish=node=>{
        node.dataset.dashboardReveal='visible'
        observer.unobserve(node)
        animations.get(node)?.cancel()
        animations.delete(node)
      }
      const reveal=(node,order)=>{
        const meta=targets.get(node)
        if(!meta||node.dataset.dashboardReveal!=='pending')return
        observer.unobserve(node)
        node.dataset.dashboardReveal='revealing'
        const delay=Math.min(order,4)*75
        const options={duration:850,delay,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'}
        let frames=[{opacity:0,translate:'0 12px'},{opacity:meta.opacity,translate:'0 0'}]
        if(meta.kind==='text'){
          options.duration=900;options.delay+=100
          frames=[{opacity:0,translate:'0 8px'},{opacity:meta.opacity,translate:'0 0'}]
        }else if(meta.kind==='row'){
          options.duration=750
          frames=[{opacity:0,translate:'0 6px'},{opacity:meta.opacity,translate:'0 0'}]
        }else if(meta.kind==='chart'){
          options.duration=1100
          frames=[{opacity:0},{opacity:meta.opacity}]
        }else if(meta.kind==='bar'){
          options.duration=1250;options.delay+=140
          frames=[{opacity:0,transform:'scaleX(0)'},{opacity:meta.opacity,transform:'scaleX(1)'}]
        }else if(meta.kind==='line'){
          try{
            const length=node.getTotalLength()
            if(!Number.isFinite(length)||length<1){finish(node);return}
            options.duration=1500;options.delay+=180
            frames=[{opacity:.05,strokeDasharray:`${length} ${length}`,strokeDashoffset:length},{opacity:meta.opacity,strokeDasharray:`${length} ${length}`,strokeDashoffset:0}]
          }catch{finish(node);return}
        }
        const animation=node.animate(frames,options)
        animations.set(node,animation)
        animation.finished.then(()=>finish(node)).catch(()=>{})
      }
      const observer=new IntersectionObserver(entries=>{
        let order=0
        for(const entry of entries)if(entry.isIntersecting)reveal(entry.target,order++)
      },{root:null,rootMargin:'0px 0px -24px 0px',threshold:.08})
      const prepare=(selector,kind)=>{
        for(const node of container.querySelectorAll(selector)){
          if(targets.has(node)||node.closest(SKIP))continue
          // Read the resting style, not an opacity from an older entrance animation.
          node.dataset.dashboardReveal='visible'
          targets.set(node,{kind,opacity:getComputedStyle(node).opacity})
          node.dataset.dashboardReveal='pending'
          if(kind==='bar')node.dataset.dashboardBar='true'
          observer.observe(node)
        }
      }
      const scan=()=>{
        prepare(REGIONS,'region');prepare(ROWS,'row');prepare(TEXT,'text')
        prepare('svg[role="img"],svg[role="group"]','chart')
        prepare(BARS,'bar');prepare(LINES,'line')
      }
      // Catch data arriving after navigation without restarting visible animations.
      const mutation=new MutationObserver(changes=>{
        for(const change of changes){
          if(change.type==='attributes'&&targets.get(change.target)?.kind==='line'){
            animations.get(change.target)?.cancel()
            change.target.dataset.dashboardReveal='pending'
            observer.observe(change.target)
          }
        }
        if(changes.some(change=>[...change.addedNodes].some(node=>node.nodeType===1))){
          cancelAnimationFrame(frame);frame=requestAnimationFrame(scan)
        }
      })
      scan()
      mutation.observe(container,{childList:true,subtree:true,attributes:true,attributeFilter:['d','points']})
      const focus=event=>{
        for(let node=event.target;node&&node!==container;node=node.parentElement){
          if(node.dataset?.dashboardReveal==='pending')finish(node)
        }
      }
      container.addEventListener('focusin',focus)
      dispose=()=>{
        mutation.disconnect();observer.disconnect();cancelAnimationFrame(frame)
        container.removeEventListener('focusin',focus)
        for(const animation of animations.values())animation.cancel()
        for(const node of targets.keys()){
          delete node.dataset.dashboardReveal;delete node.dataset.dashboardBar
        }
      }
    }
    setup()
    preference.addEventListener('change',setup)
    return()=>{preference.removeEventListener('change',setup);dispose()}
  },[pathname])
  return <div ref={scope} className={styles.scope}>{children}</div>
}
