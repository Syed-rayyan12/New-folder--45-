/**
 * The only two colours permitted anywhere in PRVLG.
 * Mirrored as CSS variables (--black, --signal) in app/globals.css.
 * Hierarchy comes from opacity and line weight, never from new colours.
 */
export const BLACK = '#000000' as const
export const SIGNAL = '#76FF76' as const

export const OPACITY = {
  ghost: 0.1,
  faint: 0.3,
  mid: 0.6,
  full: 1,
} as const
