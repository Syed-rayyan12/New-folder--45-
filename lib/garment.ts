/**
 * GARMENT SWAP POINT
 * Replace `src` with the real garment photograph (ideally shot on pure black
 * with a rim light). The shader in components/canvas/garment.tsx converts any
 * image into the black → #76FF76 duotone, so colour photos are fine.
 * To use a 3D model instead, see the README section "Replacing the garment".
 */
export const GARMENT = {
  src: '/images/garment.png',
  name: 'Look 01 — Origin Coat',
  height: 3.3,
} as const
