'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { Location } from '@/lib/locations'
import { locationStatement } from '@/lib/statements'

/** Shared location card for globe and atlas coordinate points. */
export function LocationTooltip({ place, show = true }: { place: Location; show?: boolean }) {
  const reduced = useReducedMotion()
  const coordinate = (value: number, positive: string, negative: string) =>
    `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`
  return <AnimatePresence>{show && <motion.div key={place.id} className="coordinate-tooltip" role="tooltip" initial={{ opacity: 0, y: 12, scale: .88, filter: 'blur(7px)', clipPath: 'inset(35% 25% 35% 25% round 28px)' }} animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', clipPath: 'inset(0% 0% 0% 0% round 14px)' }} exit={{ opacity: 0, y: 6, scale: .97, filter: 'blur(4px)', transition: { duration: reduced ? 0 : .24 } }} transition={{ duration: reduced ? 0 : .48, ease: [.16, 1, .3, 1] }}>
    <small>LOCATION / {place.country}</small>
    <strong>{place.name}</strong>
    <span>{coordinate(place.lat, 'N', 'S')} / {coordinate(place.lng, 'E', 'W')}</span>
    <p>{locationStatement(place)}</p>
  </motion.div>}</AnimatePresence>
}
