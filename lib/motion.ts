import type { Transition, Variants } from 'framer-motion'

/** Expo-out style curve shared by every UI transition. No bounce, ever. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const

export const panel: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.2, ease: EASE_OUT, delayChildren: 0.5, staggerChildren: 0.12 } },
  exit: { opacity: 0, transition: { duration: 0.8, ease: EASE_IN_OUT } },
}

export const rise: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1.4, ease: EASE_OUT } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.6, ease: EASE_IN_OUT } },
}

export const slow: Transition = { duration: 1.6, ease: EASE_OUT }
