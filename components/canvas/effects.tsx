'use client'

import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { KernelSize } from 'postprocessing'
import { useEffect, useMemo } from 'react'
import { useJourney } from '@/lib/store'
import { PaletteEffect } from '@/lib/three/palette-effect'

/**
 * Bloom on the green signal, then the palette pass (grain + vignette)
 * which guarantees the final frame is only black and #76FF76.
 */
export function Effects() {
  const isMobile = useJourney((s) => s.isMobile)
  const reducedMotion = useJourney((s) => s.reducedMotion)
  const palette = useMemo(
    () => new PaletteEffect({ grain: reducedMotion ? 0.025 : 0.045, vignette: isMobile ? 0.95 : 1.15 }),
    [isMobile, reducedMotion],
  )

  useEffect(() => () => palette.dispose(), [palette])

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        mipmapBlur
        luminanceThreshold={0.18}
        luminanceSmoothing={0.3}
        intensity={isMobile ? 0.7 : 1.05}
        radius={0.72}
        kernelSize={isMobile ? KernelSize.SMALL : KernelSize.MEDIUM}
        resolutionScale={isMobile ? 0.4 : 0.6}
      />
      <primitive object={palette} />
    </EffectComposer>
  )
}
