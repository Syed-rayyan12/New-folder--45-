'use client'

import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { Suspense, useEffect } from 'react'
import { useJourney } from '@/lib/store'
import { CosmicWorld } from './cosmic-world'
import { JourneyControls } from './journey-controls'

function Ready() {
  const setReady = useJourney((s) => s.setReady)
  useEffect(() => { setReady() }, [setReady])
  return null
}

export default function SceneCanvas() {
  const reducedMotion = useJourney((s) => s.reducedMotion)
  const isMobile = useJourney((s) => s.isMobile)
  const stage = useJourney((s) => s.stage)
  const showBloom = !isMobile && (stage === 'reveal' || stage === 'garment' || stage === 'world')
  return (
    <Canvas key="local-earth-jpeg-v2" dpr={isMobile ? 1 : 1.25} camera={{ position: [0, 0.7, 8.7], fov: 43 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.24} color="#ffffff" />
      <directionalLight position={[-4, 3, 5]} intensity={1.8} color="#ffffff" />
      <directionalLight position={[4, 1, -3]} intensity={0.65} color="#d8e3df" />
      <Suspense fallback={null}>
        <Stars radius={65} depth={45} count={isMobile ? 200 : 500} factor={2} saturation={0} fade speed={reducedMotion ? 0 : 0.15} />
        <CosmicWorld />
        <Ready />
      </Suspense>
      <JourneyControls />
      {showBloom && <EffectComposer multisampling={0}><Bloom mipmapBlur intensity={0.65} luminanceThreshold={1} luminanceSmoothing={0.4} /></EffectComposer>}
    </Canvas>
  )
}

