'use client'

import { useEffect, useRef, useState } from 'react'

export default function HeroScene() {
  const host = useRef(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let disposed = false, renderer, frame, observer, visibility, motion, cleanupMotion
    const geometries = [], materials = []
    const container = host.current
    const pointerTarget = container?.closest('.studio-hero')
    async function initialize() {
      try {
        const THREE = await import('three')
        if (disposed || !container) return
        const mobile = window.matchMedia('(max-width: 700px)').matches
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !mobile, powerPreference: 'low-power' })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.6))
        renderer.setClearColor(0x050505, 0)
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.05
        container.appendChild(renderer.domElement)
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 60)
        camera.position.set(0, 0, 12)
        scene.add(new THREE.AmbientLight(0x777d88, 0.65))
        const orange = new THREE.PointLight(0xff5a12, 180, 20, 2)
        orange.position.set(5, 4, 3); scene.add(orange)
        const copper = new THREE.PointLight(0xff8c47, 75, 17, 2)
        copper.position.set(9, -1, 2); scene.add(copper)
        const silver = new THREE.DirectionalLight(0xbcc6d5, 3)
        silver.position.set(-6, 5, 5); scene.add(silver)
        const tunnel = new THREE.Group()
        tunnel.position.set(mobile ? 4.7 : 5.25, 1, -2.6)
        tunnel.rotation.set(0.55, -0.48, -0.32)
        scene.add(tunnel)
        const baseGeometry = new THREE.TorusGeometry(3.6, 1.26, mobile ? 20 : 36, mobile ? 64 : 112)
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x080808, metalness: 0.85, roughness: 0.38 })
        geometries.push(baseGeometry); materials.push(baseMaterial)
        tunnel.add(new THREE.Mesh(baseGeometry, baseMaterial))
        const ovalGeometry = new THREE.TorusGeometry(1, 0.17, 6, 16)
        const ovalMaterial = new THREE.MeshStandardMaterial({ color: 0x554239, metalness: 0.94, roughness: 0.32 })
        geometries.push(ovalGeometry); materials.push(ovalMaterial)
        const columns = mobile ? 54 : 100, rows = mobile ? 12 : 23
        const perforations = new THREE.InstancedMesh(ovalGeometry, ovalMaterial, columns * rows)
        const dummy = new THREE.Object3D(), normal = new THREE.Vector3()
        const forward = new THREE.Vector3(0, 0, 1)
        let index = 0
        for (let i=0; i<columns; i++) for (let j=0; j<rows; j++) {
          const u = i/columns*Math.PI*2, v = (j+(i%2)*0.5)/rows*Math.PI*2
          const r = 3.6 + 1.277*Math.cos(v)
          dummy.position.set(r*Math.cos(u), r*Math.sin(u), 1.277*Math.sin(v))
          normal.set(Math.cos(v)*Math.cos(u), Math.cos(v)*Math.sin(u), Math.sin(v))
          dummy.quaternion.setFromUnitVectors(forward, normal)
          dummy.rotateZ(u)
          dummy.scale.set(mobile ? 0.15 : 0.095, mobile ? 0.22 : 0.145, 0.075)
          dummy.updateMatrix(); perforations.setMatrixAt(index++, dummy.matrix)
        }
        tunnel.add(perforations)
        const sculpture = new THREE.Group()
        sculpture.position.set(mobile ? -5.2 : -5.6, 0, -0.8)
        sculpture.rotation.set(0.5, -0.3, -0.4); scene.add(sculpture)
        const count = mobile ? 6500 : 24000
        const positions = new Float32Array(count*3), seeds = new Float32Array(count)
        const color = new Float32Array(count*3)
        const center = t => new THREE.Vector3((1.45+0.5*Math.cos(3*t))*Math.cos(2*t), (1.45+0.5*Math.cos(3*t))*Math.sin(2*t)*1.4, 0.7*Math.sin(3*t))
        for (let i=0;i<count;i++) {
          const u = i/count*Math.PI*2, v = i*2.399963
          const c = center(u), tangent = center(u+0.001).sub(c).normalize()
          const n = new THREE.Vector3().crossVectors(tangent,new THREE.Vector3(0,0,1)).normalize()
          const b = new THREE.Vector3().crossVectors(tangent,n).normalize()
          const radius = 0.38+0.12*Math.sin(u*5)
          c.addScaledVector(n, Math.cos(v)*radius).addScaledVector(b,Math.sin(v)*radius)
          positions.set([c.x,c.y,c.z],i*3); seeds[i] = i/count
          const highlight = 0.15+Math.pow(Math.max(0,Math.cos(v-0.8)),5)*0.85
          color.set([highlight,highlight,highlight*1.03],i*3)
        }
        const particleGeometry = new THREE.BufferGeometry()
        particleGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3))
        particleGeometry.setAttribute('color',new THREE.BufferAttribute(color,3))
        particleGeometry.setAttribute('aSeed',new THREE.BufferAttribute(seeds,1))
        const particleMaterial = new THREE.ShaderMaterial({
          transparent:true, depthWrite:false, vertexColors:true,
          uniforms:{uTime:{value:0},uPixelRatio:{value:renderer.getPixelRatio()}},
          vertexShader:'attribute float aSeed; uniform float uTime; uniform float uPixelRatio; varying vec3 vColor; void main(){vColor=color; vec3 p=position; p+=normalize(position)*sin(aSeed*42.0+uTime*0.4)*0.07; vec4 mv=modelViewMatrix*vec4(p,1.0); gl_Position=projectionMatrix*mv; gl_PointSize=clamp(17.0*uPixelRatio/-mv.z,0.7,2.8);}',
          fragmentShader:'varying vec3 vColor; void main(){float d=length(gl_PointCoord-0.5); if(d>0.5)discard; gl_FragColor=vec4(vColor,smoothstep(0.5,0.15,d)*0.85);}',
        })
        geometries.push(particleGeometry); materials.push(particleMaterial)
        sculpture.add(new THREE.Points(particleGeometry,particleMaterial))
        let pointerX = 0, pointerY = 0, time = 0, previous = 0, inView = true
        motion = e => { const box=container.getBoundingClientRect(); pointerX=(e.clientX-box.left)/box.width-0.5; pointerY=(e.clientY-box.top)/box.height-0.5 }
        pointerTarget?.addEventListener('pointermove',motion,{passive:true})
        const render = timestamp => {
          const delta = previous ? Math.min((timestamp-previous)/1000,0.05) : 0; previous=timestamp
          if (!reduced.matches) { time+=delta; tunnel.rotation.z=-0.32+time*0.018; tunnel.rotation.y=-0.48+Math.sin(time*0.15)*0.035; sculpture.rotation.y=-0.3+Math.sin(time*0.15)*0.12; particleMaterial.uniforms.uTime.value=time; camera.position.x+=(pointerX*0.16-camera.position.x)*0.025; camera.position.y+=(-pointerY*0.1-camera.position.y)*0.025 }
          renderer.render(scene,camera)
          if(!disposed && !document.hidden && inView && !reduced.matches)frame=requestAnimationFrame(render)
        }
        const resume = () => { cancelAnimationFrame(frame); previous=0; if(!document.hidden&&inView)frame=requestAnimationFrame(render) }
        const resize = () => { const {width,height}=container.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();resume() }
        observer=new ResizeObserver(resize);observer.observe(container)
        const intersection=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;resume()});intersection.observe(container)
        visibility=resume;document.addEventListener('visibilitychange',visibility)
        reduced.addEventListener('change',resume)
        cleanupMotion=()=>{intersection.disconnect();reduced.removeEventListener('change',resume);pointerTarget?.removeEventListener('pointermove',motion)}
        renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);if(!disposed)setFailed(true)},{once:true})
        resize()
      } catch { if(!disposed)setFailed(true) }
    }
    initialize()
    return () => {disposed=true;cancelAnimationFrame(frame);observer?.disconnect();cleanupMotion?.();if(visibility)document.removeEventListener('visibilitychange',visibility);for(const geometry of geometries)geometry.dispose();for(const material of materials)material.dispose();renderer?.dispose();renderer?.forceContextLoss();renderer?.domElement.remove()}
  }, [])
  return <div className={`hero-webgl ${failed?'has-failed':''}`} ref={host} aria-hidden="true" />
}
