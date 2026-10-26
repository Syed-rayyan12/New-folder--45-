'use client'

import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { MathUtils, Quaternion, Vector2, Vector3 } from 'three'
import { latLngToVector3 } from '@/lib/geo'
import { getLocation, type LocationId } from '@/lib/locations'
import { pointer, scrollState } from '@/lib/runtime'
import { type Stage, useJourney } from '@/lib/store'

type Shot = { position: Vector3; look: Vector3; duration: number }

function locationDirection(id: LocationId) {
  const { lat, lng } = getLocation(id)
  return latLngToVector3(lat, lng, 1)
}

function shotFor(stage: Stage, origin: LocationId | null, destination: LocationId | null, isMobile: boolean): Shot {
  const pull = isMobile ? 1.35 : 1
  switch (stage) {
    case 'intro':
      return { position: new Vector3(0, 0, 6.5 * pull), look: new Vector3(0, 0.1, 0), duration: 2 }
    case 'network':
      return { position: new Vector3(0.6, 1.1, 7.6 * pull), look: new Vector3(0, 0, 0), duration: 3.2 }
    case 'q1': {
      if (!origin) return { position: new Vector3(-0.4, 0.8, 7.2 * pull), look: new Vector3(), duration: 2.2 }
      const dir = locationDirection(origin)
      return { position: dir.multiplyScalar(5.4 * pull).add(new Vector3(0, 0.25, 0)), look: new Vector3(), duration: 2.4 }
    }
    case 'q2': {
      const a = origin ? locationDirection(origin) : new Vector3(0, 0, 1)
      if (!destination) return { position: a.multiplyScalar(6.4 * pull), look: new Vector3(), duration: 2 }
      const b = locationDirection(destination)
      const mid = a.clone().add(b).normalize()
      const spread = a.angleTo(b)
      return { position: mid.multiplyScalar((5.6 + spread * 1.4) * pull), look: new Vector3(), duration: 2.6 }
    }
    case 'reveal':
      return { position: new Vector3(0, 0, 6.2 * pull), look: new Vector3(), duration: 2.4 }
    case 'garment':
      return { position: new Vector3(0, 0, 5.4 * pull), look: new Vector3(0, 0, 0), duration: 2.4 }
    case 'world':
      return { position: new Vector3(0, 0, 6 * pull), look: new Vector3(), duration: 2 }
  }
}

/**
 * GSAP flies the camera between shots along a spherical path (so it never
 * passes through the globe); useFrame layers on pointer/tilt parallax and,
 * in the world stage, a scroll-driven dolly.
 */
export function CameraRig() {
  const camera = useThree((state) => state.camera)
  const stage = useJourney((s) => s.stage)
  const origin = useJourney((s) => s.origin)
  const destination = useJourney((s) => s.destination)
  const isMobile = useJourney((s) => s.isMobile)
  const reducedMotion = useJourney((s) => s.reducedMotion)

  const position = useRef(new Vector3(0, 0, 6.5))
  const look = useRef(new Vector3(0, 0.1, 0))
  const parallax = useRef(new Vector2())

  useEffect(() => {
    const shot = shotFor(stage, origin, destination, isMobile)
    const fromLook = look.current.clone()
    const r0 = position.current.length()
    const r1 = shot.position.length()
    const d0 = position.current.clone().normalize()
    const d1 = shot.position.clone().normalize()
    const rotation = new Quaternion().setFromUnitVectors(d0, d1)
    const identity = new Quaternion()
    const step = new Quaternion()
    const lift = d0.angleTo(d1) > 0.6 ? 1.1 : 0.15
    const state = { t: 0 }

    const tween = gsap.to(state, {
      t: 1,
      duration: reducedMotion ? 0.01 : shot.duration,
      ease: 'power3.inOut',
      onUpdate: () => {
        const t = state.t
        step.slerpQuaternions(identity, rotation, t)
        position.current
          .copy(d0)
          .applyQuaternion(step)
          .multiplyScalar(MathUtils.lerp(r0, r1, t) + Math.sin(Math.PI * t) * lift)
        look.current.lerpVectors(fromLook, shot.look, t)
      },
    })
    return () => {
      tween.kill()
    }
  }, [stage, origin, destination, isMobile, reducedMotion])

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1)
    const strength = reducedMotion ? 0 : 1
    parallax.current.lerp(new Vector2(pointer.x, pointer.y), 1 - Math.exp(-delta * 2.2))

    camera.position.copy(position.current)

    if (stage === 'world') {
      const p = scrollState.progress
      camera.position.z += p * 3.2
      camera.position.y += Math.sin(p * Math.PI) * 0.6
    } else if (stage === 'network' && !reducedMotion) {
      const t = state.clock.elapsedTime
      camera.position.x += Math.sin(t * 0.08) * 0.35
      camera.position.y += Math.cos(t * 0.06) * 0.15
    }

    camera.lookAt(look.current)
    camera.translateX(parallax.current.x * 0.32 * strength)
    camera.translateY(parallax.current.y * 0.2 * strength)
    camera.lookAt(look.current)
  })

  return null
}
