'use client'

import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { AdditiveBlending, Color, LinearFilter, type Mesh, NoColorSpace, ShaderMaterial, Vector2 } from 'three'
import { GARMENT } from '@/lib/garment'
import { SIGNAL } from '@/lib/palette'
import { useJourney } from '@/lib/store'
import { useTweened } from '@/lib/use-tweened'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * Any photograph is reduced to one intensity and re-emitted as signal green,
 * so the garment can never leave the black → #76FF76 palette.
 *  - day:   readable duotone of the whole garment
 *  - night: near darkness, with edge glow, rim highlights and a light sweep
 *           cast from the visitor's mark (upper left).
 */
const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uSignal;
  uniform vec2 uTexel;
  uniform float uReveal;
  uniform float uNight;
  uniform float uTime;
  uniform float uMotion;
  varying vec2 vUv;

  float intensity(vec2 uv) {
    vec3 c = texture2D(uMap, uv).rgb;
    return max(c.r, max(c.g, c.b));
  }

  void main() {
    float l = intensity(vUv);
    float mask = smoothstep(0.01, 0.045, l);

    vec2 o = uTexel * 2.0;
    float gx = intensity(vUv + vec2(o.x, 0.0)) - intensity(vUv - vec2(o.x, 0.0));
    float gy = intensity(vUv + vec2(0.0, o.y)) - intensity(vUv - vec2(0.0, o.y));
    float edge = smoothstep(0.015, 0.09, length(vec2(gx, gy)));

    float day = pow(l, 0.62) * 1.7 * mask;

    float rim = smoothstep(0.16, 0.5, l) * 1.8;
    float axis = vUv.y * 0.85 + (1.0 - vUv.x) * 0.45;
    float sweepPos = mix(-0.2, 1.5, fract(uTime * 0.07 * uMotion + 0.55));
    float sweep = exp(-pow((axis - sweepPos) * 7.0, 2.0)) * mask * (0.25 + l * 4.0);
    float pulse = (0.85 + 0.15 * sin(uTime * 0.8 * uMotion)) * mask;
    float night = l * 0.35 * pulse + edge * mask * 0.9 + rim + sweep;

    float value = mix(day, night, uNight) * uReveal;
    gl_FragColor = vec4(uSignal * value, 1.0);
  }
`

/**
 * Stage 6: the garment, lit by the mark. Swap the asset in lib/garment.ts.
 */
export function Garment() {
  const stage = useJourney((s) => s.stage)
  const lighting = useJourney((s) => s.lighting)
  const isMobile = useJourney((s) => s.isMobile)
  const reducedMotion = useJourney((s) => s.reducedMotion)
  const texture = useTexture(GARMENT.src)
  const mesh = useRef<Mesh>(null)

  const reveal = useTweened(stage === 'garment' ? 1 : 0, {
    duration: stage === 'garment' ? 3.2 : 1.4,
    delay: stage === 'garment' ? 1.2 : 0,
    ease: 'power2.inOut',
    initial: 0,
  })
  const night = useTweened(lighting === 'night' ? 1 : 0, { duration: 2.2, ease: 'power3.inOut', initial: 1 })

  const aspect = useMemo(() => {
    const image = texture.image as { width: number; height: number } | undefined
    return image ? image.width / image.height : 0.75
  }, [texture])

  const material = useMemo(() => {
    texture.colorSpace = NoColorSpace
    texture.minFilter = LinearFilter
    texture.generateMipmaps = false
    const image = texture.image as { width: number; height: number }
    return new ShaderMaterial({
      uniforms: {
        uMap: { value: texture },
        uSignal: { value: new Color(SIGNAL) },
        uTexel: { value: new Vector2(1 / image.width, 1 / image.height) },
        uReveal: { value: 0 },
        uNight: { value: 1 },
        uTime: { value: 0 },
        uMotion: { value: 1 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      toneMapped: false,
    })
  }, [texture])

  useEffect(() => {
    return () => material.dispose()
  }, [material])

  useFrame((state) => {
    material.uniforms.uReveal.value = reveal.current.value
    material.uniforms.uNight.value = night.current.value
    material.uniforms.uTime.value = state.clock.elapsedTime
    material.uniforms.uMotion.value = reducedMotion ? 0 : 1
    if (mesh.current) {
      mesh.current.visible = reveal.current.value > 0.002
      mesh.current.position.y = (1 - reveal.current.value) * -0.15 + (isMobile ? -0.35 : 0)
    }
  })

  const height = isMobile ? GARMENT.height * 0.92 : GARMENT.height
  return (
    <mesh ref={mesh} material={material} position={[isMobile ? 0 : -0.15, 0, 0]}>
      <planeGeometry args={[height * aspect, height]} />
    </mesh>
  )
}
