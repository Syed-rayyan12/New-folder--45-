import { Quaternion, Vector3 } from 'three'

export const GLOBE_RADIUS = 2
const EARTH_RADIUS_KM = 6371
const DEG = Math.PI / 180

type LatLng = { lat: number; lng: number }

export type MapView = 'globe' | 'flat'
// Equal Earth polynomial, shared by the surface, markers and route samples.
// Formula reference: https://github.com/d3/d3-geo/blob/main/src/projection/equalEarth.js
export function flatPosition(lat: number, lng: number, height = 0) {
  const theta = Math.asin(Math.sqrt(3) / 2 * Math.sin(lat * DEG))
  const t2 = theta * theta, t6 = t2 * t2 * t2
  return new Vector3(
    GLOBE_RADIUS * lng * DEG * Math.cos(theta) / (Math.sqrt(3) / 2 * (1.340264 - 3 * 0.081106 * t2 + t6 * (7 * 0.000893 + 9 * 0.003796 * t2))),
    GLOBE_RADIUS * theta * (1.340264 - 0.081106 * t2 + t6 * (0.000893 + 0.003796 * t2)),
    height,
  )
}
export const FLAT_WIDTH = 2 * flatPosition(0, 180).x
export const FLAT_HEIGHT = 2 * flatPosition(90, 0).y

export function mapPosition(lat: number, lng: number, radius: number, view: MapView) {
  return view === 'globe' ? latLngToVector3(lat, lng, radius) : flatPosition(lat, lng, radius - GLOBE_RADIUS)
}

/** Keep the geographic path unchanged, splitting at the curved date-line edges. */
export function routeSegments(from: LatLng, to: LatLng, view: MapView, lift = 0.16) {
  const samples = arcPoints(latLngToVector3(from.lat, from.lng, 2.025), latLngToVector3(to.lat, to.lng, 2.025), 180, lift)
  if (view === 'globe') return [samples]
  const segments: Vector3[][] = [[]]
  let previous: { lat: number; lng: number; height: number } | null = null
  for (const sample of samples) {
    const coordinate = {
      lat: Math.asin(Math.max(-1, Math.min(1, sample.y / sample.length()))) / DEG,
      lng: Math.atan2(-sample.z, sample.x) / DEG,
      height: (sample.length() - GLOBE_RADIUS) * 0.18,
    }
    if (previous && Math.abs(coordinate.lng - previous.lng) > 180) {
      const edge = previous.lng > 0 ? 180 : -180
      const unwrapped = coordinate.lng + (previous.lng > 0 ? 360 : -360)
      const span = unwrapped - previous.lng
      const t = Math.abs(span) < 1e-9 ? 0.5 : (edge - previous.lng) / span
      const lat = previous.lat + (coordinate.lat - previous.lat) * t
      const height = previous.height + (coordinate.height - previous.height) * t
      segments[segments.length - 1].push(flatPosition(lat, edge, height))
      segments.push([flatPosition(lat, -edge, height)])
    }
    segments[segments.length - 1].push(flatPosition(coordinate.lat, coordinate.lng, coordinate.height))
    previous = coordinate
  }
  // Pin route endpoints to exactly the same height as the location dots.
  segments[0][0].copy(mapPosition(from.lat, from.lng, 2.025, 'flat'))
  const last = segments[segments.length - 1]
  last[last.length - 1].copy(mapPosition(to.lat, to.lng, 2.025, 'flat'))
  return segments.filter(segment => segment.length > 1)
}

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
