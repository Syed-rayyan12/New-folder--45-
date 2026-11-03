import type { LocationId } from './locations'

export type JourneyStep = 'origin' | 'destination' | 'connected'

/** Map clicks and typed locations follow the same question order. */
export function journeySelection(step: JourneyStep, id: LocationId, origin: LocationId | null) {
  if (step === 'origin') return { origin: id, destination: null, stage: 'q2' as const, journeyStep: 'destination' as const }
  if (step === 'destination' && origin && id !== origin) return { destination: id, stage: 'q2' as const, journeyStep: 'connected' as const }
  return null
}

