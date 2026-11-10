'use client'

import { useEffect, useRef, useState } from 'react'
import { BufferAttribute, BufferGeometry, CanvasTexture, DoubleSide, Mesh, PlaneGeometry, NormalBlending, OrthographicCamera, Points, Scene, ShaderMaterial, WebGLRenderer } from 'three'
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
    vAlpha = smoothstep(0.0, 0.35, t) * mix(0.35, 1.0, ease) * smoothstep(0.0, 0.3, uTime)
      * (1.0-smoothstep(5.5,${LOGO_COMPLETE_AT.toFixed(2)},uTime));
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

// Fill the spaces between the arriving particles on the same animation clock.
// Every grain becomes white continuously; there is no second logo reveal.
const fillFragmentShader = `
  uniform sampler2D uMask;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec2 uv=vec2(vUv.x,1.-vUv.y);
    float mask=texture2D(uMask,uv).a;
    vec2 grain=floor(uv*vec2(990.,582.));
    float noise=fract(sin(dot(grain,vec2(12.9898,78.233)))*43758.5453);
    float progress=smoothstep(3.8,${LOGO_COMPLETE_AT.toFixed(2)},uTime)*1.4-.2;
    float ink=smoothstep(noise-.2,noise+.2,progress);
    gl_FragColor=vec4(1.,1.,1.,mask*ink);
  }
`

let completedLogoCanvas:HTMLCanvasElement|null=null
export function getCompletedLogoCanvas(){return completedLogoCanvas}

/** One GPU draw call animates every star, without thousands of Canvas2D draws. */
export function ParticleLogo({ reduced, onDrawn,onTextureReady }: { reduced: boolean; onDrawn: () => void;onTextureReady?:(canvas:HTMLCanvasElement)=>void }) {
  const host = useRef<HTMLDivElement>(null)
  const capture=useRef(onTextureReady)
  capture.current=onTextureReady
  const complete = useRef(onDrawn)
  complete.current = onDrawn
  const [fallback, setFallback] = useState(false)
  const [resolved,setResolved]=useState(false)
  useEffect(() => {
    const container = host.current
    if (!container) return
    let renderer: WebGLRenderer
    try { renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power',preserveDrawingBuffer:true }) }
    catch { setFallback(true); const timer = window.setTimeout(() => {setResolved(true);complete.current()}, reduced ? 0 : LOGO_COMPLETE_AT * 1000); return () => window.clearTimeout(timer) }
    const mask = document.createElement('canvas')
    mask.width = 990; mask.height = 582
    const ink = mask.getContext('2d', { willReadFrequently: true })
    if (!ink) { renderer.dispose(); setFallback(true);setResolved(true); complete.current(); return }
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
    const fillGeometry=new PlaneGeometry(330,194)
    const fillMaterial=new ShaderMaterial({
      vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:fillFragmentShader,transparent:true,depthTest:false,depthWrite:false,side:DoubleSide,
      uniforms:{uTime:material.uniforms.uTime,uMask:{value:texture}},
    })
    const fill=new Mesh(fillGeometry,fillMaterial)
    fill.position.set(165,97,0);fill.renderOrder=0
    scene.add(fill)
    const points = new Points(geometry, material)
    points.renderOrder=1
    points.frustumCulled = false
    scene.add(points)
    const camera = new OrthographicCamera(0, 330, 0, 194, 0.1, 10)
    camera.position.z = 1
    renderer.setSize(990, 582, false)
    renderer.setClearColor(0, 0)
    renderer.domElement.setAttribute('aria-hidden', 'true')
    container.appendChild(renderer.domElement)
    let frame = 0, start: number | null = null, notified = false
    const finish = () => { if (!notified) {
      notified = true
      // Resolve to the actual white artwork, rather than freezing noisy particles.
      completedLogoCanvas=mask;capture.current?.(mask)
      complete.current()
    } }
    const onContextLost = (event: Event) => { event.preventDefault(); cancelAnimationFrame(frame); setFallback(true); setResolved(true); finish() }
    renderer.domElement.addEventListener('webglcontextlost', onContextLost)
    const render = (now: number) => {
      if (start === null) start = now
      const seconds = reduced ? LOGO_COMPLETE_AT : (now-start)/1000
      material.uniforms.uTime.value = seconds
      material.uniforms.uDensity.value = logoDensity(seconds)
      const phase = LOGO_STAGE_ENDS.findIndex(end => seconds < end)
      container.dataset.step = String(phase === -1 ? 4 : phase + 1)
      container.dataset.animationTime = seconds.toFixed(3)
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
      geometry.dispose(); material.dispose();fillGeometry.dispose();fillMaterial.dispose(); texture.dispose(); renderer.dispose()
    }
  }, [reduced])
  return <div ref={host} className={`brand-particle-canvas brand-particle-stage${resolved?' is-resolved':''}`} role="img" aria-label="PRVLG HERITAGE">
    <svg viewBox="0 0 330 194" className="brand-particle-base" aria-hidden="true">{BRAND_LOGO_PATHS.map((d,i)=><path key={i} d={d} fill="black" fillRule="evenodd"/>)}</svg>
    {fallback && <svg viewBox="0 0 330 194" className="brand-particle-fallback" aria-hidden="true">{BRAND_LOGO_PATHS.map((d, i) => <path key={i} d={d} fill="white" fillRule="evenodd" />)}</svg>}
    {resolved && <svg viewBox="0 0 330 194" className="brand-logo-resolved" aria-hidden="true">{BRAND_LOGO_PATHS.map((d,i)=><path key={i} d={d} fill="#ffffff" fillRule="evenodd"/>)}</svg>}
  </div>
}
