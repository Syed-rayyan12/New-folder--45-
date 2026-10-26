import {
  BoxGeometry,
  BufferGeometry,
  DodecahedronGeometry,
  EdgesGeometry,
  Euler,
  IcosahedronGeometry,
  Matrix4,
  OctahedronGeometry,
  Quaternion,
  TetrahedronGeometry,
  Vector3,
} from 'three'
import { arcPoints, greatCircleKm, initialBearing, latLngToVector3 } from './geo'
import { getLocation, type Location, type LocationId } from './locations'

export type Vec3 = [number, number, number]

export type MarkLayer = {
  name: 'outer' | 'inner' | 'spokes' | 'orbit' | 'journey'
  /** Flat list of segment endpoints: [a0, b0, a1, b1, ...]. */
  segments: Vec3[]
  lineWidth: number
  opacity: number
}

export type ShapeKind =
  | 'tetrahedron'
  | 'octahedron'
  | 'cube'
  | 'icosahedron'
  | 'dodecahedron'
  | 'prism'
  | 'antiprism'
  | 'bipyramid'

export type MarkSpec = {
  serial: string
  seed: number
  origin: Location
  destination: Location
  distanceKm: number
  bearing: number
  outer: ShapeKind
  inner: ShapeKind
  sides: number
  layers: MarkLayer[]
  spinAxis: Vec3
  spinSpeed: number
}

const SHAPES: ShapeKind[] = [
  'tetrahedron',
  'octahedron',
  'cube',
  'icosahedron',
  'dodecahedron',
  'prism',
  'antiprism',
  'bipyramid',
]

const POLYGON_NAMES: Record<number, string> = {
  3: 'Triangular',
  4: 'Square',
  5: 'Pentagonal',
  6: 'Hexagonal',
  7: 'Heptagonal',
  8: 'Octagonal',
}

const DEG = Math.PI / 180

/** FNV-1a followed by a murmur3 finaliser: stable 32-bit hash across runtimes. */
export function hashString(input: string) {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return h >>> 0
}

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shapeLabel(kind: ShapeKind, sides: number) {
  const polygon = POLYGON_NAMES[sides] ?? `${sides}-sided`
  switch (kind) {
    case 'prism':
      return `${polygon} prism`
    case 'antiprism':
      return `${polygon} antiprism`
    case 'bipyramid':
      return `${polygon} bipyramid`
    default:
      return kind.charAt(0).toUpperCase() + kind.slice(1)
  }
}

function edgesOf(geometry: BufferGeometry): Vec3[] {
  const edges = new EdgesGeometry(geometry, 1)
  const array = edges.attributes.position.array
  const out: Vec3[] = []
  for (let i = 0; i < array.length; i += 3) out.push([array[i], array[i + 1], array[i + 2]])
  edges.dispose()
  geometry.dispose()
  return out
}

function ring(sides: number, radius: number, y: number, offset = 0): Vec3[] {
  return Array.from({ length: sides }, (_, i) => {
    const a = offset + (i / sides) * Math.PI * 2
    return [Math.cos(a) * radius, y, Math.sin(a) * radius] as Vec3
  })
}

function closedLoop(points: Vec3[]): Vec3[] {
  return points.flatMap((p, i) => [p, points[(i + 1) % points.length]])
}

function shapeSegments(kind: ShapeKind, radius: number, sides: number): Vec3[] {
  switch (kind) {
    case 'tetrahedron':
      return edgesOf(new TetrahedronGeometry(radius))
    case 'octahedron':
      return edgesOf(new OctahedronGeometry(radius))
    case 'cube': {
      const side = (2 * radius) / Math.sqrt(3)
      return edgesOf(new BoxGeometry(side, side, side))
    }
    case 'icosahedron':
      return edgesOf(new IcosahedronGeometry(radius))
    case 'dodecahedron':
      return edgesOf(new DodecahedronGeometry(radius))
    case 'prism': {
      const h = radius * 0.62
      const top = ring(sides, radius * 0.8, h)
      const bottom = ring(sides, radius * 0.8, -h)
      return [...closedLoop(top), ...closedLoop(bottom), ...top.flatMap((p, i) => [p, bottom[i]])]
    }
    case 'antiprism': {
      const h = radius * 0.5
      const top = ring(sides, radius * 0.82, h)
      const bottom = ring(sides, radius * 0.82, -h, Math.PI / sides)
      return [
        ...closedLoop(top),
        ...closedLoop(bottom),
        ...top.flatMap((p, i) => [p, bottom[i], p, bottom[(i - 1 + sides) % sides]]),
      ]
    }
    case 'bipyramid': {
      const equator = ring(sides, radius * 0.78, 0)
      const north: Vec3 = [0, radius, 0]
      const south: Vec3 = [0, -radius, 0]
      return [...closedLoop(equator), ...equator.flatMap((p) => [p, north, p, south])]
    }
  }
}

function transform(points: Vec3[], matrix: Matrix4): Vec3[] {
  const v = new Vector3()
  return points.map((p) => {
    v.set(p[0], p[1], p[2]).applyMatrix4(matrix)
    return [v.x, v.y, v.z]
  })
}

function uniqueVertices(segments: Vec3[]): Vec3[] {
  const seen = new Map<string, Vec3>()
  for (const p of segments) seen.set(p.map((n) => n.toFixed(3)).join(','), p)
  return [...seen.values()]
}

function cross(center: Vector3, size: number): Vec3[] {
  const out: Vec3[] = []
  for (const axis of [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)]) {
    const a = center.clone().addScaledVector(axis, size)
    const b = center.clone().addScaledVector(axis, -size)
    out.push([a.x, a.y, a.z], [b.x, b.y, b.z])
  }
  return out
}

/**
 * Deterministically builds a visitor's mark from an ordered pair of locations.
 * The same origin → continuation always yields the same structure; every input
 * (coordinates, great-circle distance, bearing) feeds the seed or the geometry.
 */
export function generateMark(originId: LocationId, destinationId: LocationId): MarkSpec {
  const origin = getLocation(originId)
  const destination = getLocation(destinationId)
  const key = `${origin.id}:${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}>${destination.id}:${destination.lat.toFixed(4)},${destination.lng.toFixed(4)}`
  const seed = hashString(key)
  const rng = mulberry32(seed)

  const distanceKm = greatCircleKm(origin, destination)
  const bearing = initialBearing(origin, destination)
  const dLat = destination.lat - origin.lat
  const dLng = ((destination.lng - origin.lng + 540) % 360) - 180

  const sides = 3 + ((Math.floor(distanceKm / 1200) + Math.floor(rng() * 3)) % 6)
  const outer = SHAPES[Math.floor(rng() * SHAPES.length)]
  let inner = SHAPES[Math.floor(rng() * SHAPES.length)]
  if (inner === outer) inner = SHAPES[(SHAPES.indexOf(outer) + 1 + Math.floor(rng() * (SHAPES.length - 1))) % SHAPES.length]

  const stretch = new Vector3(1 + (Math.abs(dLng) / 180) * 0.45, 1 + (Math.abs(dLat) / 90) * 0.6, 1 + rng() * 0.2)
  const outerMatrix = new Matrix4().compose(
    new Vector3(),
    new Quaternion().setFromEuler(new Euler(rng() * Math.PI, rng() * Math.PI, bearing * DEG)),
    stretch,
  )
  const innerRadius = 0.48 + rng() * 0.3
  const innerMatrix = new Matrix4().compose(
    new Vector3(),
    new Quaternion().setFromEuler(new Euler(rng() * Math.PI * 2, rng() * Math.PI * 2, rng() * Math.PI * 2)),
    new Vector3(1, 1, 1),
  )

  const outerSegments = transform(shapeSegments(outer, 1.25, sides), outerMatrix)
  const innerSegments = transform(shapeSegments(inner, innerRadius, sides), innerMatrix)

  const outerVertices = uniqueVertices(outerSegments)
  const innerVertices = uniqueVertices(innerSegments)
  const spokeCount = 2 + Math.floor(rng() * Math.min(7, outerVertices.length))
  const spokes: Vec3[] = []
  for (let i = 0; i < spokeCount; i++) {
    spokes.push(
      outerVertices[Math.floor(rng() * outerVertices.length)],
      innerVertices[Math.floor(rng() * innerVertices.length)],
    )
  }

  const orbitRadius = 1.75 + rng() * 0.15
  const orbitMatrix = new Matrix4().makeRotationFromEuler(
    new Euler((90 - Math.abs(origin.lat)) * DEG * 0.6, bearing * DEG, destination.lat * DEG * 0.5),
  )
  const ticks = Math.min(14, 3 + Math.floor(distanceKm / 1500))
  const orbitBase: Vec3[] = closedLoop(ring(96, orbitRadius, 0))
  for (let i = 0; i < ticks; i++) {
    const a = (i / ticks) * Math.PI * 2 + rng() * 0.15
    const len = i === 0 ? 0.32 : 0.12
    orbitBase.push(
      [Math.cos(a) * orbitRadius, 0, Math.sin(a) * orbitRadius],
      [Math.cos(a) * (orbitRadius + len), 0, Math.sin(a) * (orbitRadius + len)],
    )
  }
  const orbit = transform(orbitBase, orbitMatrix)

  const journeyRadius = 1.95
  const start = latLngToVector3(origin.lat, origin.lng, journeyRadius)
  const end = latLngToVector3(destination.lat, destination.lng, journeyRadius)
  const arc = arcPoints(start, end, 64, 0.18)
  const journey: Vec3[] = []
  for (let i = 0; i < arc.length - 1; i++) {
    journey.push([arc[i].x, arc[i].y, arc[i].z], [arc[i + 1].x, arc[i + 1].y, arc[i + 1].z])
  }
  journey.push(...cross(start, 0.09), ...cross(end, 0.09))

  const spin = new Vector3(rng() - 0.5, 1, rng() - 0.5).normalize()

  return {
    serial: `PRVLG-${seed.toString(16).toUpperCase().padStart(8, '0').slice(0, 6)}`,
    seed,
    origin,
    destination,
    distanceKm,
    bearing,
    outer,
    inner,
    sides,
    spinAxis: [spin.x, spin.y, spin.z],
    spinSpeed: 0.08 + rng() * 0.12,
    layers: [
      { name: 'orbit', segments: orbit, lineWidth: 0.7, opacity: 0.3 },
      { name: 'spokes', segments: spokes, lineWidth: 0.6, opacity: 0.3 },
      { name: 'inner', segments: innerSegments, lineWidth: 0.8 + rng() * 0.6, opacity: 0.6 },
      { name: 'outer', segments: outerSegments, lineWidth: 1.3 + rng() * 1.1, opacity: 1 },
      { name: 'journey', segments: journey, lineWidth: 1.1 + rng() * 0.6, opacity: 0.85 },
    ],
  }
}
