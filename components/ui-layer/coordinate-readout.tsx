'use client'

import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { formatCoordinate, type Location } from '@/lib/locations'
import { useJourney } from '@/lib/store'

function CountUp({ value, axis }: { value: number; axis: 'lat' | 'lng' }) {
  const reducedMotion = useJourney((s) => s.reducedMotion)
  const current = useMotionValue(0)
  const text = useTransform(current, (v) => formatCoordinate(v, axis, value))

  useEffect(() => {
    const controls = animate(current, value, {
      duration: reducedMotion ? 0 : 1.8,
      ease: [0.16, 1, 0.3, 1],
    })
    return () => controls.stop()
  }, [current, value, reducedMotion])

  return <motion.span>{text}</motion.span>
}

/** Monospaced lat/lng that counts up from zero whenever the location changes. */
export function CoordinateReadout({ location, label }: { location: Location; label: string }) {
  return (
    <div className="font-mono text-xs tracking-[0.12em]">
      <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-signal/40">{label}</p>
      <p className="sr-only">
        {location.name}, {formatCoordinate(location.lat, 'lat')}, {formatCoordinate(location.lng, 'lng')}
      </p>
      <div aria-hidden="true" className="flex flex-wrap gap-x-5 gap-y-1 text-signal">
        <CountUp key={`${location.id}-lat`} value={location.lat} axis="lat" />
        <CountUp key={`${location.id}-lng`} value={location.lng} axis="lng" />
      </div>
    </div>
  )
}
