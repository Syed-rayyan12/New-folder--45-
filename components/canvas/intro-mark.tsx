'use client'

import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { EdgesGeometry, type Group, OctahedronGeometry } from 'three'
import type { Vec3 } from '@/lib/mark'
import { pointer } from '@/lib/runtime'
import { useJourney } from '@/lib/store'
import { useTweened } from '@/lib/use-tweened'
import { DrawLine } from './draw-line'

type Stroke = [number, number, number, number]

const LETTERS: Record<string, { width: number; strokes: Stroke[] }> = {
  P: { width: 0.7, strokes: [[0, 0, 0, 1], [0, 1, 0.7, 1], [0.7, 1, 0.7, 0.5], [0.7, 0.5, 0, 0.5]] },
  R: {
    width: 0.7,
    strokes: [[0, 0, 0, 1], [0, 1, 0.7, 1], [0.7, 1, 0.7, 0.5], [0.7, 0.5, 0, 0.5], [0.3, 0.5, 0.7, 0]],
  },
  V: { width: 0.8, strokes: [[0, 1, 0.4, 0], [0.4, 0, 0.8, 1]] },
  L: { width: 0.6, strokes: [[0, 1, 0, 0], [0, 0, 0.6, 0]] },
  G: {
    width: 0.7,
    strokes: [[0.7, 1, 0, 1], [0, 1, 0, 0], [0, 0, 0.7, 0], [0.7, 0, 0.7, 0.45], [0.7, 0.45, 0.35, 0.45]],
  },
}

const WORD = 'PRVLG'
const LETTER_HEIGHT = 0.4
const TRACKING = 0.5
const DEPTH = 0.07

function buildWordmark() {
  const total = [...WORD].reduce((sum, ch) => sum + LETTERS[ch].width, 0) + TRACKING * (WORD.length - 1)
  let cursor = -total / 2
  const front: Vec3[] = []
  const back: Vec3[] = []
  const depth: Vec3[] = []
  const corners = new Set<string>()

  for (const ch of WORD) {
    const letter = LETTERS[ch]
    for (const [x1, y1, x2, y2] of letter.strokes) {
      const ax = (cursor + x1) * LETTER_HEIGHT
      const bx = (cursor + x2) * LETTER_HEIGHT
      const ay = y1 * LETTER_HEIGHT
      const by = y2 * LETTER_HEIGHT
      front.push([ax, ay, DEPTH], [bx, by, DEPTH])
      back.push([ax, ay, -DEPTH], [bx, by, -DEPTH])
      for (const [x, y] of [[ax, ay], [bx, by]]) {
        const key = `${x.toFixed(3)},${y.toFixed(3)}`
        if (corners.has(key)) continue
        corners.add(key)
        depth.push([x, y, DEPTH], [x, y, -DEPTH])
      }
    }
    cursor += letter.width + TRACKING
  }
  return { front, back, depth }
}

function buildEmblem() {
  const edges = new EdgesGeometry(new OctahedronGeometry(0.62))
  const array = edges.attributes.position.array
  const octa: Vec3[] = []
  for (let i = 0; i < array.length; i += 3) octa.push([array[i], array[i + 1], array[i + 2]])
  edges.dispose()

  const ring: Vec3[] = []
  const steps = 96
  for (let i = 0; i < steps; i++) {
    const a0 = (i / steps) * Math.PI * 2
    const a1 = ((i + 1) / steps) * Math.PI * 2
    ring.push([Math.cos(a0) * 0.95, 0, Math.sin(a0) * 0.95], [Math.cos(a1) * 0.95, 0, Math.sin(a1) * 0.95])
  }
  const axis: Vec3[] = [
    [0, -1.05, 0],
    [0, 1.05, 0],
  ]
  return { octa, ring, axis }
}

/**
 * Stage 1: the PRVLG wordmark and emblem draw themselves in as 3D linework,
 * then expand and dissolve as the coordinate network unfolds.
 */
export function IntroMark() {
  const ready = useJourney((s) => s.ready)
  const stage = useJourney((s) => s.stage)
  const reducedMotion = useJourney((s) => s.reducedMotion)
  const active = stage === 'intro'

  const emblemDraw = useTweened(ready ? 1 : 0, { duration: 2.8, ease: 'power2.inOut', initial: 0 })
  const wordDraw = useTweened(ready ? 1 : 0, { duration: 2.4, delay: 1, ease: 'power2.inOut', initial: 0 })
  const depthDraw = useTweened(ready ? 1 : 0, { duration: 1.6, delay: 2.4, ease: 'power2.out', initial: 0 })
  const fade = useTweened(active ? 1 : 0, { duration: 1.6, ease: 'power2.inOut', initial: 1 })
  const expand = useTweened(active ? 1 : 3.4, { duration: 2.4, ease: 'expo.in', initial: 1 })

  const wordmark = useMemo(buildWordmark, [])
  const emblem = useMemo(buildEmblem, [])

  const root = useRef<Group>(null)
  const emblemGroup = useRef<Group>(null)
  const wordGroup = useRef<Group>(null)

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1)
    if (!root.current || !emblemGroup.current || !wordGroup.current) return
    root.current.visible = fade.current.value > 0.002
    if (!root.current.visible) return

    const t = state.clock.elapsedTime
    const scale = expand.current.value
    emblemGroup.current.scale.setScalar(scale)
    if (!reducedMotion) {
      emblemGroup.current.rotation.y += delta * 0.22
      emblemGroup.current.rotation.x = Math.sin(t * 0.3) * 0.14 + pointer.y * 0.12
      emblemGroup.current.rotation.z = Math.sin(t * 0.21) * 0.05
      wordGroup.current.rotation.y = pointer.x * 0.22
      wordGroup.current.rotation.x = -pointer.y * 0.12
    }
    wordGroup.current.position.y = -1.05 - (scale - 1) * 0.6
    wordGroup.current.position.z = (scale - 1) * 0.8
  })

  return (
    <group ref={root}>
      <group ref={emblemGroup} position={[0, 0.5, 0]}>
        <DrawLine points={emblem.octa} segments lineWidth={1.4} opacity={1} draw={emblemDraw} fade={fade} />
        <group rotation={[1.15, 0, 0.2]}>
          <DrawLine points={emblem.ring} segments lineWidth={0.8} opacity={0.35} draw={emblemDraw} fade={fade} />
        </group>
        <DrawLine points={emblem.axis} segments lineWidth={0.6} opacity={0.25} draw={emblemDraw} fade={fade} />
      </group>
      <group ref={wordGroup} position={[0, -1.05, 0]}>
        <DrawLine points={wordmark.front} segments lineWidth={1.6} opacity={1} draw={wordDraw} fade={fade} />
        <DrawLine points={wordmark.back} segments lineWidth={0.8} opacity={0.3} draw={wordDraw} fade={fade} />
        <DrawLine points={wordmark.depth} segments lineWidth={0.6} opacity={0.3} draw={depthDraw} fade={fade} />
      </group>
    </group>
  )
}
