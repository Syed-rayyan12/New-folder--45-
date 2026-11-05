'use client'
import { useJourney } from '@/lib/store'
import { getLocation } from '@/lib/locations'
import { locationStatement } from '@/lib/statements'

export function Statements() {
  const {origin,destination}=useJourney()
  const places=[origin,destination].filter((id):id is NonNullable<typeof origin>=>Boolean(id)).map(getLocation)
  return <div className="statement-browser"><p className="eyebrow">WORDS TO WEAR</p><h2>Your places.<br/><em>Your statement.</em></h2>{places.length?places.map(place=><article key={place.id}><h3>{place.name}</h3><blockquote>{locationStatement(place)}</blockquote></article>):<small>Choose a location to discover your words.</small>}</div>
}
