'use client'

import { useEffect, useRef, useState } from 'react'
import { BufferAttribute, BufferGeometry, CanvasTexture, NormalBlending, OrthographicCamera, Points, Scene, ShaderMaterial, WebGLRenderer } from 'three'
import { BRAND_LOGO_PATHS } from '@/lib/brand-logo'
import { LOGO_COMPLETE_AT, LOGO_PARTICLE_TRAVEL, LOGO_STAGE_ENDS, logoDensity, logoParticles, logoParticleArrival } from '@/lib/logo-particles'

const vertexShader = `
  attribute vec2 aOffset;
  attribute float aArrival;
  attribute float aRadius;
  uniform float uTime;
  uniform float uScale;
  uniform float uDensity;
  uniform float uTravel;
  varying float vAlpha;
  varying float vProgress;
  varying vec2 vMaskUv;
  void main() {
    float t = clamp((uTime-aArrival)/uTravel, 0.0, 1.0);
    float ease = t*t*t*(t*(t*6.0-15.0)+10.0);
    vec2 moving = position.xy + aOffset*(1.0-ease);
    float radius = aRadius * mix(0.8, 1.8, uDensity);
    gl_Position = projectionMatrix*modelViewMatrix*vec4(moving, 0.0, 1.0);
    gl_PointSize = max(1.0, radius*2.0*uScale);
    // Fade into view and settle continuously; no moving/stationary handoff.
    vAlpha = smoothstep(0.0, 0.35, t) * mix(0.35, 1.0, ease) * smoothstep(0.0, 0.3, uTime);
    vProgress = t;
    vMaskUv = vec2(position.x/330.0, 1.0-position.y/194.0);
  }
`
const fragmentShader = `
  uniform sampler2D uMask;
  varying float vAlpha;
  varying float vProgress;
  varying vec2 vMaskUv;
  void main() {
    float distance = length(gl_PointCoord-0.5);
    float circle = 1.0-smoothstep(0.3, 0.5, distance);
    float silhouette = mix(1.0, texture2D(uMask, vMaskUv).a, smoothstep(0.8, 1.0, vProgress));
    gl_FragColor = vec4(1.0, 1.0, 1.0, circle*vAlpha*silhouette);
  }
`

/** One GPU draw call animates every star, without thousands of Canvas2D draws. */
export function ParticleLogo({ reduced, onDrawn }: { reduced: boolean; onDrawn: () => void }) {
  const host = useRef<HTMLDivElement>(null)
  const complete = useRef(onDrawn)
  complete.current = onDrawn
  const [fallback, setFallback] = useState(false)
  useEffect(() => {
    const container = host.current
    if (!container) return
    let renderer: WebGLRenderer
    try { renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' }) }
    catch { setFallback(true); const timer = window.setTimeout(() => complete.current(), reduced ? 0 : LOGO_COMPLETE_AT * 1000); return () => window.clearTimeout(timer) }
    const mask = document.createElement('canvas')
    mask.width = 990; mask.height = 582
    const ink = mask.getContext('2d', { willReadFrequently: true })
    if (!ink) { renderer.dispose(); setFallback(true); complete.current(); return }
    ink.scale(3, 3)
    ink.fillStyle = '#fff'
    BRAND_LOGO_PATHS.forEach(d => ink.fill(new Path2D(d), 'evenodd'))
    const particles = logoParticles(ink.getImageData(0, 0, 990, 582).data, 990, 582)
    const positions = new Float32Array(particles.length * 3)
    const offsets = new Float32Array(particles.length * 2)
    const arrivals = new Float32Array(particles.length)
    const radii = new Float32Array(particles.length)
    particles.forEach((p, i) => {
      positions.set([p.x, p.y, 0], i * 3)
      const distance = 7 + p.rank * 17
      offsets.set([Math.cos(p.phase) * distance, Math.sin(p.phase) * distance], i * 2)
      arrivals[i] = logoParticleArrival(p.rank)
      radii[i] = p.radius
    })
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(positions, 3))
    geometry.setAttribute('aOffset', new BufferAttribute(offsets, 2))
    geometry.setAttribute('aArrival', new BufferAttribute(arrivals, 1))
    geometry.setAttribute('aRadius', new BufferAttribute(radii, 1))
    const texture = new CanvasTexture(mask)
    const material = new ShaderMaterial({
      vertexShader, fragmentShader, transparent: true, depthTest: false, depthWrite: false,
      blending: NormalBlending, uniforms: { uTime: { value: 0 }, uScale: { value: 3 }, uMask: { value: texture }, uTravel: { value: LOGO_PARTICLE_TRAVEL }, uDensity: { value: 0 } },
    })
    const scene = new Scene()
    const points = new Points(geometry, material)
    points.frustumCulled = false
    scene.add(points)
    const camera = new OrthographicCamera(0, 330, 0, 194, 0.1, 10)
    camera.position.z = 1
    renderer.setSize(990, 582, false)
    renderer.setClearColor(0, 0)
    renderer.domElement.setAttribute('aria-hidden', 'true')
    container.appendChild(renderer.domElement)
    let frame = 0, start: number | null = null, notified = false
    const finish = () => { if (!notified) { notified = true; complete.current() } }
    const onContextLost = (event: Event) => { event.preventDefault(); cancelAnimationFrame(frame); setFallback(true); finish() }
    renderer.domElement.addEventListener('webglcontextlost', onContextLost)
    const render = (now: number) => {
      if (start === null) start = now
      const seconds = reduced ? LOGO_COMPLETE_AT : (now-start)/1000
      material.uniforms.uTime.value = seconds
      material.uniforms.uDensity.value = logoDensity(seconds)
      const phase = LOGO_STAGE_ENDS.findIndex(end => seconds < end)
      container.dataset.step = String(phase === -1 ? 4 : phase + 1)
      renderer.render(scene, camera)
      if (seconds >= LOGO_COMPLETE_AT) finish()
      else frame = requestAnimationFrame(render)
    }
    // Compile before starting the clock, avoiding a shader startup hitch.
    renderer.compile(scene, camera)
    frame = requestAnimationFrame(render)
    return () => {
      cancelAnimationFrame(frame)
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
      renderer.domElement.remove()
      geometry.dispose(); material.dispose(); texture.dispose(); renderer.dispose()
    }
  }, [reduced])
  return <div ref={host} className="brand-particle-canvas brand-particle-stage" role="img" aria-label="PRVLG HERITAGE — particles smoothly forming the logo">
    {fallback && <svg viewBox="0 0 330 194" className="brand-particle-fallback" aria-hidden="true">{BRAND_LOGO_PATHS.map((d, i) => <path key={i} d={d} fill="white" fillRule="evenodd" />)}</svg>}
  </div>
}
