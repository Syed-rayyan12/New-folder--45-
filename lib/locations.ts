export type LocationId =
  | `custom:${string}`
  | 'georgetown'
  | 'kingston'
  | 'lahore'
  | 'london'
  | 'lagos'
  | 'mumbai'
  | 'port-of-spain'
  | 'karachi'
  | 'birmingham'

export type Location = {
  id: LocationId
  name: string
  country: string
  /** Three-letter code shown in readouts and on the mark serial. */
  code: string
  lat: number
  lng: number
  statement: string
}

/**
 * Edit, add or remove locations here. Everything else — globe points,
 * corridors, mark generation and the fallback selector — reads from this list.
 */
export const LOCATIONS: readonly Location[] = [
  {
    id: 'georgetown',
    name: 'Georgetown',
    country: 'Guyana',
    code: 'GEO',
    lat: 6.8013,
    lng: -58.1551,
    statement:
      'Where the river meets the Atlantic and wooden houses stand on stilts. You learned early that a foundation can float.',
  },
  {
    id: 'kingston',
    name: 'Kingston',
    country: 'Jamaica',
    code: 'KIN',
    lat: 17.9712,
    lng: -76.7936,
    statement:
      'A city that turned bass into a language. You carry its rhythm in the way you walk into a room.',
  },
  {
    id: 'lahore',
    name: 'Lahore',
    country: 'Pakistan',
    code: 'LHE',
    lat: 31.5204,
    lng: 74.3587,
    statement:
      'Gardens behind old walls, poetry spoken at full volume. Lahore taught you that ornament is a form of conviction.',
  },
  {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    code: 'LDN',
    lat: 51.5072,
    lng: -0.1276,
    statement:
      'Grey light, sharp tailoring, a hundred accents on one bus. London is where many stories are stitched together.',
  },
  {
    id: 'lagos',
    name: 'Lagos',
    country: 'Nigeria',
    code: 'LOS',
    lat: 6.5244,
    lng: 3.3792,
    statement:
      'Momentum as a way of life. Lagos dresses loud, moves fast and never asks permission to be seen.',
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    country: 'India',
    code: 'BOM',
    lat: 19.076,
    lng: 72.8777,
    statement:
      'Monsoon, cinema and a sea that never sleeps. Mumbai gave you the patience of tides and the nerve of a lead role.',
  },
  {
    id: 'port-of-spain',
    name: 'Port of Spain',
    country: 'Trinidad and Tobago',
    code: 'POS',
    lat: 10.6549,
    lng: -61.5019,
    statement:
      'Steel pans and carnival wire. Port of Spain knows that a costume can carry a whole history on its shoulders.',
  },
  {
    id: 'karachi',
    name: 'Karachi',
    country: 'Pakistan',
    code: 'KHI',
    lat: 24.8607,
    lng: 67.0011,
    statement:
      'A harbour city of salt air and late nights. Karachi made you restless in the best possible way.',
  },
  {
    id: 'birmingham',
    name: 'Birmingham',
    country: 'United Kingdom',
    code: 'BHX',
    lat: 52.4862,
    lng: -1.8904,
    statement:
      'Canals, foundries and corner shops. Birmingham is where things get made, then quietly remade as your own.',
  },
] as const

const BY_ID = new Map(LOCATIONS.map((location) => [location.id, location]))

export function getLocation(id: LocationId): Location {
  if (id.startsWith('custom:')) {
    const [lat, lng, ...name] = id.slice(7).split(':')
    const latitude = Number(lat)
    const longitude = Number(lng)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) throw new Error('Invalid coordinates')
    return { id, lat: latitude, lng: longitude, name: decodeURIComponent(name.join(':')), country: 'Custom location', code: 'YOU', statement: 'A place in your story.' }
  }
  const location = BY_ID.get(id)
  if (!location) throw new Error(`Unknown location: ${id}`)
  return location
}

export function formatCoordinate(value: number, axis: 'lat' | 'lng', sign = value) {
  const hemisphere = axis === 'lat' ? (sign >= 0 ? 'N' : 'S') : sign >= 0 ? 'E' : 'W'
  const width = axis === 'lat' ? 7 : 8
  return `${Math.abs(value).toFixed(4).padStart(width, '0')}° ${hemisphere}`
}
