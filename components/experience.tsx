'use client'

import dynamic from 'next/dynamic'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Globe2, Map, RotateCcw, Plus, Minus } from 'lucide-react'
import { useJourney } from '@/lib/store'
import { useEnvironment } from '@/lib/use-environment'
import { BrandIntro } from './ui-layer/brand-intro'
import { getCompletedLogoCanvas } from './ui-layer/particle-logo'
import ClientDialogs from './ui-layer/client-dialogs'
import { MusicToggle } from './ui-layer/music-toggle'
import { GuidedJourney } from './ui-layer/guided-journey'
import { GarmentWorld } from './ui-layer/garment-world'
import { GalaxyPicker } from './ui-layer/galaxy-picker'
import { GalaxyBackdrop } from './ui-layer/galaxy-backdrop'
import { JourneyPersistence } from './ui-layer/journey-persistence'
import { FlatWorldMap } from './ui-layer/flat-world-map'

const SceneCanvas = dynamic(() => import('./canvas/scene-canvas'), { ssr: false })

export function Experience() {
  const root=useRef<HTMLElement>(null)
  const switching=useRef(false)
  const [introComplete, setIntroComplete] = useState(false)
  const [brandCanvas,setBrandCanvas]=useState<HTMLCanvasElement|null>(null)
  useEffect(()=>{const canvas=getCompletedLogoCanvas();if(canvas)setBrandCanvas(canvas)},[])
  const webgl = useEnvironment()
  const { stage, ready, setReady, setStage, emblemReady, reducedMotion, mapView, setMapView, zoomMap } = useJourney()
  const inWorld = stage === 'world'
  const transferring = stage === 'garment'
  const revealed = stage === 'reveal' || transferring || inWorld
  const flat = mapView === 'flat' && !revealed
  const switchView=async(view:'globe'|'flat')=>{
    if(view===mapView||switching.current)return
    if(reducedMotion){setMapView(view);return}
    switching.current=true
    // Yield for the retained scene's commit without waiting for a suppressed paint.
    const update=async()=>{
      flushSync(()=>setMapView(view))
      await new Promise<void>(resolve=>window.setTimeout(resolve,32))
    }
    try {
      if(typeof document.startViewTransition==='function'){
        const transition=document.startViewTransition(update)
        void transition.ready.catch(()=>{})
        await transition.finished
      }else if(root.current){
        const out=root.current.animate([{opacity:1},{opacity:0}],{duration:160,fill:'forwards'})
        await out.finished
        await update()
        const incoming=root.current.animate([{opacity:0},{opacity:1}],{duration:400,easing:'cubic-bezier(.22,1,.36,1)'})
        out.cancel()
        await incoming.finished
      }else await update()
    }catch{setMapView(view)}finally{switching.current=false}
  }
  // Start every page visit in 3D, including returns from a previously selected map.
  useLayoutEffect(() => { setMapView('globe') }, [setMapView])
  useEffect(() => { useJourney.getState().setLighting('night') }, [])
  useEffect(() => { if (webgl === false) setReady() }, [webgl, setReady])
  useEffect(()=>{if(stage!=='intro'&&!introComplete)setIntroComplete(true)},[stage,introComplete])
  useEffect(() => { if (introComplete && stage === 'intro') setStage('q1') }, [introComplete, stage, setStage])
  useEffect(() => {
    if (stage !== 'reveal' || !emblemReady) return
    const timer = window.setTimeout(() => setStage('garment'), reducedMotion ? 300 : 1400)
    return () => window.clearTimeout(timer)
  }, [stage, emblemReady, reducedMotion, setStage])
  useEffect(() => {
    if (stage !== 'garment') return
    const timer = window.setTimeout(() => setStage('world'), reducedMotion ? 300 : 2800)
    return () => window.clearTimeout(timer)
  }, [stage, reducedMotion, setStage])
  return <main ref={root} className={`cosmic-experience guided-experience${!revealed ? ' is-map-stage' : ''}${flat?' is-flat-layout':''}${inWorld||transferring?' is-garment-world':''}`} data-lighting="night">
    <JourneyPersistence/>
    <BrandIntro ready={ready} complete={introComplete} onTextureReady={setBrandCanvas} onComplete={()=>{setMapView('globe');setIntroComplete(true)}}/>
    {webgl!==null&&<GalaxyBackdrop/>}
    <div className={`cosmic-canvas globe-scene${flat?' is-inactive':''}`} inert={!introComplete||flat} aria-hidden={flat}>{webgl&&<SceneCanvas active={!flat} showBrand={!revealed} brandCanvas={brandCanvas} brandVisible={introComplete}/>}</div>
    {flat&&<div className="cosmic-canvas flat-scene" inert={!introComplete}><section className="flat-map-viewport" aria-label="Flat world map"><FlatWorldMap/></section></div>}
    {!inWorld&&!transferring&&<div className="space-vignette"/>}
    <ClientDialogs enabled={introComplete}/>
    {introComplete&&<MusicToggle/>}
    <div className={`experience-content${introComplete ? ' is-entered' : ''}${inWorld || transferring ? ' is-garment-world' : ''}`} inert={!introComplete} aria-hidden={!introComplete}>
      {!revealed && <>

        {introComplete && <GuidedJourney canReveal={Boolean(webgl && ready)} />}
        <div className="map-top-controls">{webgl&&<div className="map-view-toggle" role="group" aria-label="Switch between globe and flat map"><button type="button" aria-label="Original globe" title="Original globe" aria-pressed={mapView === 'globe'} onClick={()=>void switchView('globe')}><Globe2 size={14} /><span>Original Globe</span></button><button type="button" aria-label="Flat world map" title="Flat world map" aria-pressed={mapView === 'flat'} onClick={()=>void switchView('flat')}><Map size={14} /><span>Flat Map</span></button></div>}
        <div className="map-secondary-controls">
        {webgl&&<div className="map-zoom-controls" role="group" aria-label="Map zoom and reset controls"><button type="button" aria-label="Zoom in" title="Zoom in" onClick={()=>zoomMap('in')}><Plus size={16}/></button><button type="button" aria-label="Zoom out" title="Zoom out" onClick={()=>zoomMap('out')}><Minus size={16}/></button><button type="button" aria-label="Reset map view" title="Reset map view" onClick={()=>zoomMap('reset')}><RotateCcw size={14}/></button></div>}
        <GalaxyPicker/></div></div>
      </>}
      {(inWorld || transferring) && <GarmentWorld />}
      {!ready && webgl !== false && <div className="scene-loading" role="status">Gathering your universe<span>•••</span></div>}
      {webgl === false && <p className="webgl-notice">3D preview is unavailable on this device. You can still choose your journey coordinates.</p>}
    </div>
  </main>
}
