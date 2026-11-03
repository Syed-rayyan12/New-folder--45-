'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { Globe2, Map } from 'lucide-react'
import { useJourney } from '@/lib/store'
import { useEnvironment } from '@/lib/use-environment'
import { BrandIntro } from './ui-layer/brand-intro'
import { GuidedJourney } from './ui-layer/guided-journey'
import { GarmentWorld } from './ui-layer/garment-world'
import { GalaxyPicker } from './ui-layer/galaxy-picker'
import { GalaxyBackdrop } from './ui-layer/galaxy-backdrop'

const SceneCanvas = dynamic(() => import('./canvas/scene-canvas'), { ssr: false })

export function Experience() {
  const [introComplete, setIntroComplete] = useState(false)
  const webgl = useEnvironment()
  const { stage, ready, setReady, setStage, emblemReady, reducedMotion, mapView, setMapView, zoomMap } = useJourney()
  const inWorld = stage === 'world'
  const transferring = stage === 'garment'
  const revealed = stage === 'reveal' || transferring || inWorld
  useEffect(() => { useJourney.getState().setLighting('night') }, [])
  useEffect(() => { if (webgl === false) setReady() }, [webgl, setReady])
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
  return <main className={`cosmic-experience guided-experience${!revealed ? ' is-map-stage' : ''}`} data-lighting="night">
    <BrandIntro ready={ready} onComplete={() => setIntroComplete(true)} />
    <div className={`experience-content${introComplete ? ' is-entered' : ''}${inWorld || transferring ? ' is-garment-world' : ''}`} inert={!introComplete} aria-hidden={!introComplete}>
      {webgl !== null && <GalaxyBackdrop />}
      <div className="cosmic-canvas">{webgl && <SceneCanvas />}</div>
      <div className="space-vignette" />
      {!revealed && <>
        <GalaxyPicker />
        {introComplete && <GuidedJourney canReveal={Boolean(webgl && ready)} />}
        {webgl && <div className="map-toolbar" aria-label="Map controls">
          <div className="map-view-toggle" role="group" aria-label="Switch between flat map and 3D globe"><button type="button" aria-pressed={mapView === 'flat'} onClick={() => setMapView('flat')}><Map size={14} />2D Flat Map</button><button type="button" aria-pressed={mapView === 'globe'} onClick={() => setMapView('globe')}><Globe2 size={14} />3D Globe</button></div>
          <div role="group" aria-label="Zoom controls"><button type="button" aria-label="Zoom in" onClick={() => zoomMap('in')}>+</button><button type="button" aria-label="Zoom out" onClick={() => zoomMap('out')}>−</button></div>
          <small>{mapView === 'flat' ? 'DRAG TO PAN · SCROLL / PINCH TO ZOOM' : 'DRAG TO ROTATE · SCROLL / PINCH TO ZOOM'}</small>
        </div>}
      </>}
      {(inWorld || transferring) && <GarmentWorld />}
      {!ready && webgl !== false && <div className="scene-loading" role="status">Gathering your universe<span>•••</span></div>}
      {webgl === false && <p className="webgl-notice">3D preview is unavailable on this device. You can still choose your journey coordinates.</p>}
    </div>
  </main>
}
