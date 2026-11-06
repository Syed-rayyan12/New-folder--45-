'use client'

import dynamic from 'next/dynamic'
import { useEffect, useLayoutEffect, useState } from 'react'
import { Globe2, Network, RotateCcw, Plus, Minus } from 'lucide-react'
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

const SceneCanvas = dynamic(() => import('./canvas/scene-canvas'), { ssr: false })

export function Experience() {
  const [introComplete, setIntroComplete] = useState(false)
  const [brandCanvas,setBrandCanvas]=useState<HTMLCanvasElement|null>(null)
  useEffect(()=>{const canvas=getCompletedLogoCanvas();if(canvas)setBrandCanvas(canvas)},[])
  const globeStyle = useJourney(s => s.globeStyle)
  const setGlobeStyle = useJourney(s => s.setGlobeStyle)
  const webgl = useEnvironment()
  const { stage, ready, setReady, setStage, emblemReady, reducedMotion, setMapView, zoomMap } = useJourney()
  const inWorld = stage === 'world'
  const transferring = stage === 'garment'
  const revealed = stage === 'reveal' || transferring || inWorld
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
  return <main className={`cosmic-experience guided-experience${!revealed ? ' is-map-stage' : ''}${inWorld||transferring?' is-garment-world':''}`} data-lighting="night">
    <BrandIntro ready={ready} complete={introComplete} onTextureReady={setBrandCanvas} onComplete={()=>{setMapView('globe');setIntroComplete(true)}}/>
    {webgl!==null&&<GalaxyBackdrop/>}
    <div className="cosmic-canvas" inert={!introComplete}>{webgl&&<SceneCanvas showBrand={!revealed} brandCanvas={brandCanvas} brandVisible={introComplete}/>}</div>
    <div className="space-vignette"/>
    <ClientDialogs enabled={introComplete}/>
    {introComplete&&<MusicToggle/>}
    <div className={`experience-content${introComplete ? ' is-entered' : ''}${inWorld || transferring ? ' is-garment-world' : ''}`} inert={!introComplete} aria-hidden={!introComplete}>
      {!revealed && <>

        {introComplete && <GuidedJourney canReveal={Boolean(webgl && ready)} />}
        <div className="map-top-controls">{webgl&&<div className="map-view-toggle" role="group" aria-label="Switch globe style"><button type="button" aria-label="Original globe" title="Original globe" aria-pressed={globeStyle === 'original'} onClick={() => setGlobeStyle('original')}><Globe2 size={14} /><span>Original Globe</span></button><button type="button" aria-label="Dotted network globe" title="Dotted network globe" aria-pressed={globeStyle === 'network'} onClick={() => setGlobeStyle('network')}><Network size={14} /><span>Network Globe</span></button></div>}<GalaxyPicker/></div>
        {webgl&&<div className="map-zoom-controls" role="group" aria-label="Map zoom and reset controls"><button type="button" aria-label="Zoom in" title="Zoom in" onClick={()=>zoomMap('in')}><Plus size={16}/></button><button type="button" aria-label="Zoom out" title="Zoom out" onClick={()=>zoomMap('out')}><Minus size={16}/></button><button type="button" aria-label="Reset map view" title="Reset map view" onClick={()=>zoomMap('reset')}><RotateCcw size={14}/></button></div>}
      </>}
      {(inWorld || transferring) && <GarmentWorld />}
      {!ready && webgl !== false && <div className="scene-loading" role="status">Gathering your universe<span>•••</span></div>}
      {webgl === false && <p className="webgl-notice">3D preview is unavailable on this device. You can still choose your journey coordinates.</p>}
    </div>
  </main>
}
