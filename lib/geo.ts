import { Quaternion, Vector3 } from 'three'

export const GLOBE_RADIUS = 2
const EARTH_RADIUS_KM = 6371
const DEG = Math.PI / 180

type LatLng = { lat: number; lng: number }

export function latLngToVector3(lat: number, lng: number, radius = GLOBE_RADIUS, target = new Vector3()) {
  const phi = (90 - lat) * DEG
  const theta = (lng + 180) * DEG
  return target.set(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

export function greatCircleKm(a: LatLng, b: LatLng) {
  const dLat = (b.lat - a.lat) * DEG
  const dLng = (b.lng - a.lng) * DEG
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * DEG) * Math.cos(b.lat * DEG) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Initial compass bearing from a to b, in degrees 0–360. */
export function initialBearing(a: LatLng, b: LatLng) {
  const φ1 = a.lat * DEG
  const φ2 = b.lat * DEG
  const Δλ = (b.lng - a.lng) * DEG
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  return ((Math.atan2(y, x) / DEG) + 360) % 360
}

/**
 * Points along the great circle between two surface points, lifted off the
 * sphere so the corridor reads as an arc travelling over the globe.
 */
export function arcPoints(from: Vector3, to: Vector3, segments = 64, liftScale = 0.3) {
  const radius = from.length()
  const a = from.clone().normalize()
  const b = to.clone().normalize()
  const rotation = new Quaternion().setFromUnitVectors(a, b)
  const identity = new Quaternion()
  const step = new Quaternion()
  const lift = (0.06 + a.angleTo(b) * liftScale) * radius
  const points: Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    step.slerpQuaternions(identity, rotation, t)
    points.push(
      a
        .clone()
        .applyQuaternion(step)
        .multiplyScalar(radius + Math.sin(Math.PI * t) * lift),
    )
  }
  return points
}
