export const WORLD_SECTIONS = ['Collection', 'Heritage', 'Archive', 'Journey'] as const
export type WorldSection = typeof WORLD_SECTIONS[number]

export const WORLD_GARMENTS = [
  { id: '01', name: 'Origin Coat', kind: 'coat', color: '#24272c', detail: 'A long silhouette. A personal signature.', category: 'OUTER LAYER' },
  { id: '02', name: 'Transit Hoodie', kind: 'hoodie', color: '#b9b5ab', detail: 'A familiar form, carrying the places that shaped you.', category: 'EVERYDAY LAYER' },
  { id: '03', name: 'Signature Tee', kind: 'tee', color: '#555e58', detail: 'Your coordinates, distilled into an everyday piece.', category: 'FOUNDATION LAYER' },
] as const

export function wrapGarment(index: number) {
  return ((index % WORLD_GARMENTS.length) + WORLD_GARMENTS.length) % WORLD_GARMENTS.length
}
