'use client'

import { Canvas } from '@react-three/fiber'
import { OrthographicCamera, Stars } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { Suspense, useEffect } from 'react'
import { useJourney } from '@/lib/store'
import { CosmicWorld } from './cosmic-world'
import type { GlobeBrandTarget } from './globe-brand'
import { JourneyControls } from './journey-controls'
import { FLAT_HEIGHT, FLAT_WIDTH } from '@/lib/geo'
import { useThree } from '@react-three/fiber'

function FlatMapCamera() {
  const size = useThree(s => s.size)
  const zoom = Math.min(size.width / (FLAT_WIDTH * 1.15), size.height / (FLAT_HEIGHT * 1.15))
  return <OrthographicCamera makeDefault position={[0, 0, 20]} near={0.01} far={200} zoom={zoom} />
}

function Ready() {
  const setReady = useJourney((s) => s.setReady)
  useEffect(() => { setReady() }, [setReady])
  return null
}

export default function SceneCanvas({active=true,showBrand=false,brandCanvas,brandVisible=true,onBrandTarget}:{active?:boolean;showBrand?:boolean;brandCanvas?:HTMLCanvasElement|null;brandVisible?:boolean;onBrandTarget?:(target:GlobeBrandTarget)=>void}) {
  const reducedMotion = useJourney((s) => s.reducedMotion)
  const isMobile = useJourney((s) => s.isMobile)
  const stage = useJourney((s) => s.stage)
  const mapView = useJourney(s => s.mapView)
  const flat = mapView === 'flat' && !['reveal', 'garment', 'world'].includes(stage)
  const showBloom = !isMobile && (stage === 'reveal' || stage === 'garment' || stage === 'world')
  return (
    <Canvas key="local-earth-jpeg-v2" frameloop={active?'always':'never'} dpr={isMobile ? 1 : 1.25} camera={{ position: [0, 0.7, 8.7], fov: 43 }} gl={{ antialias: true, alpha: true }}>
      {flat && <FlatMapCamera />}
      <ambientLight intensity={0.24} color="#ffffff" />
      <directionalLight position={[-4, 3, 5]} intensity={1.8} color="#ffffff" />
      <directionalLight position={[4, 1, -3]} intensity={0.65} color="#d8e3df" />
      <Suspense fallback={null}>
        <Stars radius={65} depth={45} count={isMobile ? 200 : 500} factor={2} saturation={0} fade speed={reducedMotion ? 0 : 0.15} />
        <CosmicWorld showBrand={showBrand} brandCanvas={brandCanvas} brandVisible={brandVisible} onBrandTarget={onBrandTarget}/>
        <Ready />
      </Suspense>
      <JourneyControls />
      {showBloom && <EffectComposer multisampling={0}><Bloom mipmapBlur intensity={0.65} luminanceThreshold={1} luminanceSmoothing={0.4} /></EffectComposer>}
    </Canvas>
  )
}

