import type { Location } from '@/lib/locations'
import { locationStatement } from '@/lib/statements'

/** Shared location card for globe and atlas coordinate points. */
export function LocationTooltip({ place }: { place: Location }) {
  const coordinate = (value: number, positive: string, negative: string) =>
    `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`
  return <div className="coordinate-tooltip" role="tooltip">
    <small>LOCATION / {place.country}</small>
    <strong>{place.name}</strong>
    <span>{coordinate(place.lat, 'N', 'S')} / {coordinate(place.lng, 'E', 'W')}</span>
    <p>{locationStatement(place)}</p>
  </div>
}
