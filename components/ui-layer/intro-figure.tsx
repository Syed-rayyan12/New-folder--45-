'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimationMixer, Bone, Box3, Group, MathUtils, Mesh, OrthographicCamera, Vector3 } from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'

// Textured Mixamo human from the official Three.js skeletal animation example.
const HUMAN_SOURCES = [
  '/models/intro-man.glb',
  'https://threejs.org/examples/models/gltf/Soldier.glb',
  'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Soldier.glb',
  'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r180/examples/models/gltf/Soldier.glb',
]

class HumanBoundary extends Component<{ children: ReactNode; onUnavailable: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onUnavailable() }
  render() { return this.state.failed ? null : this.props.children }
}

function Person({ modelUrl, reduced, onArrive }: { modelUrl: string; reduced: boolean; onArrive: () => void }) {
  const gltf = useGLTF(modelUrl)
  const root = useRef<Group>(null)
  const elapsed = useRef(0)
  const announced = useRef(false)
  const startX = useRef<number | null>(null)
  const { camera, size } = useThree()
  const rig = useMemo(() => {
    const model = clone(gltf.scene)
    const box = new Box3().setFromObject(model)
    const scale = 2.8 / box.getSize(new Vector3()).y
    const mixer = new AnimationMixer(model)
    const walkClip = gltf.animations.find(c => /walk/i.test(c.name))
    const idleClip = gltf.animations.find(c => /idle/i.test(c.name))
    if (!walkClip || !idleClip) throw new Error('The intro human needs Walk and Idle animation clips.')
    const walk = mixer.clipAction(walkClip)
    const idle = mixer.clipAction(idleClip)
    const arms: Bone[] = []
    const forearms: Bone[] = []
    model.traverse(object => {
      if (object instanceof Mesh) { object.castShadow = true; object.frustumCulled = false }
      if (object instanceof Bone && /(?:Right|Left)Arm$/.test(object.name)) arms.push(object)
      if (object instanceof Bone && /(?:Right|Left)ForeArm$/.test(object.name)) forearms.push(object)
    })
    return { model, mixer, walk, idle, scale, baseY: -box.min.y * scale, arms, forearms }
  }, [gltf])
  useEffect(() => {
    rig.walk.reset().setEffectiveWeight(reduced ? 0 : 1).play()
    rig.idle.reset().setEffectiveWeight(reduced ? 1 : 0).play()
    return () => { rig.mixer.stopAllAction(); rig.mixer.uncacheRoot(rig.model) }
  }, [rig, reduced])
  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, .05)
    const cam = camera as OrthographicCamera
    const zoom = Math.min(size.height / 5.6, size.width / 4.8)
    if (cam.zoom !== zoom) { cam.zoom = zoom; cam.updateProjectionMatrix() }
    if (startX.current === null) startX.current = -size.width / zoom / 2 - 1
    const distance = -startX.current
    const duration = distance / 1.65
    elapsed.current += delta
    const t = reduced ? duration + Math.min(elapsed.current, 2.5) : elapsed.current
    const progress = Math.min(1, t / duration)
    const stopping = MathUtils.smoothstep(t, duration - .35, duration + .25)
    rig.walk.setEffectiveWeight(1 - stopping)
    rig.idle.setEffectiveWeight(stopping)
    rig.walk.setEffectiveTimeScale(1.65 / (1.35 * rig.scale))
    rig.mixer.update(reduced ? 0 : delta)
    if (root.current) {
      root.current.position.set(MathUtils.lerp(startX.current, 0, progress), -1.6, 0)
      root.current.rotation.y = MathUtils.lerp(-Math.PI / 2, -Math.PI, MathUtils.smoothstep(t, duration, duration + .8))
    }
    // A short, two-handed presenting gesture after the walk has settled.
    const lift = MathUtils.smoothstep(t, duration + .8, duration + 1.4) * (1 - MathUtils.smoothstep(t, duration + 1.9, duration + 2.4))
    rig.arms.forEach(bone => { bone.rotation.z += (/Right/.test(bone.name) ? -1 : 1) * lift * .42; bone.rotation.x -= lift * .55 })
    rig.forearms.forEach(bone => { bone.rotation.y += (/Right/.test(bone.name) ? -1 : 1) * lift * .75 })
    if (t >= duration + 2 && !announced.current) { announced.current = true; onArrive() }
  })
  return <group ref={root} position={[-20,-1.6,0]}>
    <group scale={rig.scale} position={[0,rig.baseY,0]}><primitive object={rig.model} /></group>
  </group>
}

export default function IntroFigure({ reduced, onArrive, onUnavailable }: { reduced: boolean; onArrive: () => void; onUnavailable: () => void }) {
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const unavailable = useRef(onUnavailable)
  unavailable.current = onUnavailable
  useEffect(() => {
    let cancelled = false
    let blobUrl: string | null = null
    const controller = new AbortController()
    async function load() {
      // Prefer an embedded local asset, then race independent public mirrors.
      async function fetchModel(source: string) {
        const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(14000)])
        const response = await fetch(source, { signal })
        if (!response.ok) throw new Error(`Human asset: ${response.status}`)
        const buffer = await response.arrayBuffer()
        if (buffer.byteLength < 20 || new DataView(buffer).getUint32(0, true) !== 0x46546c67) throw new Error('Human asset is not a GLB model')
        return buffer
      }
      try {
        let buffer: ArrayBuffer
        try { buffer = await fetchModel(HUMAN_SOURCES[0]) }
        catch {
          buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
            const mirrors = HUMAN_SOURCES.slice(1)
            let failures = 0
            mirrors.forEach(source => {
              fetchModel(source).then(resolve).catch(() => {
                failures += 1
                if (failures === mirrors.length) reject(new Error('All human model sources failed'))
              })
            })
          })
        }
        if (cancelled) return
        blobUrl = URL.createObjectURL(new Blob([buffer], { type:'model/gltf-binary' }))
        setModelUrl(blobUrl)
      } catch {
        if (!cancelled) unavailable.current()
      }
    }
    void load()
    return () => { cancelled = true; controller.abort(); if (blobUrl) URL.revokeObjectURL(blobUrl) }
  }, [])
  if (!modelUrl) return null
  return <HumanBoundary onUnavailable={onUnavailable}><Canvas shadows orthographic camera={{ position:[0,0,10], zoom:100 }} dpr={[1,1.5]} gl={{alpha:true,antialias:true}} aria-hidden="true">
    <hemisphereLight args={['#fff4eb','#263044',2]} />
    <directionalLight castShadow position={[-3,5,5]} intensity={3} color="#fff3e8" shadow-mapSize={[1024,1024]} />
    <directionalLight position={[3,2,-3]} intensity={2.5} color="#b8ceff" />
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.62,0]} receiveShadow><planeGeometry args={[40,40]} /><shadowMaterial transparent opacity={.3} /></mesh>
    <Suspense fallback={null}><Person modelUrl={modelUrl} reduced={reduced} onArrive={onArrive} /></Suspense>
  </Canvas></HumanBoundary>
}
