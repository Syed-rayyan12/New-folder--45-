import { create } from 'zustand'
import type { LocationId } from './locations'
import { wrapGarment, type WorldSection } from './garment-world'
import { hashString } from './mark'
import { GALAXY_BACKGROUNDS } from './galaxy-backgrounds'
import type { MapView } from './geo'
import { journeySelection, type JourneyStep } from './journey-flow'

export type Stage = 'intro' | 'network' | 'q1' | 'q2' | 'reveal' | 'garment' | 'world'
export type Lighting = 'day' | 'night'

export const STAGES: readonly Stage[] = ['intro', 'network', 'q1', 'q2', 'reveal', 'garment', 'world']

export const STAGE_LABELS: Record<Stage, string> = {
  intro: 'Entry',
  network: 'Network',
  q1: 'Origin',
  q2: 'Continuation',
  reveal: 'Your mark',
  garment: 'The garment',
  world: 'World',
}

type JourneyState = {
  mockupId: string
  mockupColor: string
  setMockup: (id: string) => void
  setMockupColor: (color: string) => void
  journeyStep: JourneyStep
  editJourney: (kind: 'origin' | 'destination') => void
  mapView: MapView
  setMapView: (view: MapView) => void
  zoomCommand: { action: 'in' | 'out'; sequence: number }
  zoomMap: (action: 'in' | 'out') => void
  editorOpen: boolean
  ready: boolean
  stage: Stage
  origin: LocationId | null
  destination: LocationId | null
  hovered: LocationId | null
  lighting: Lighting
  reducedMotion: boolean
  isMobile: boolean
  emblemReady: boolean
  emblemSeed: number
  emblemGeneration: number
  backgroundId: string
  backgroundStatus: 'ready' | 'loading' | 'error'
  setBackground: (id: string) => void
  setBackgroundStatus: (status: 'ready' | 'loading' | 'error') => void
  garmentIndex: number
  worldSection: WorldSection
  completeEmblem: () => void
  selectGarment: (index: number) => void
  setWorldSection: (section: WorldSection) => void
  setReady: () => void
  setStage: (stage: Stage) => void
  selectLocation: (id: LocationId) => void
  setHovered: (id: LocationId | null) => void
  setLighting: (lighting: Lighting) => void
  setEnvironment: (env: { reducedMotion: boolean; isMobile: boolean }) => void
  restart: () => void
}

export const useJourney = create<JourneyState>((set, get) => ({
  mockupId: 'original-tank',
  mockupColor: 'original',
  setMockup: (mockupId) => set({mockupId}),
  setMockupColor: (mockupColor) => set({mockupColor}),
  journeyStep: 'origin',
  editJourney: (kind) => set(s => ({ journeyStep: kind === 'destination' && s.origin ? 'destination' : 'origin', stage: kind === 'destination' && s.origin ? 'q2' : 'q1', hovered: null })),
  mapView: 'flat',
  setMapView: (mapView) => set({ mapView, hovered: null }),
  zoomCommand: { action: 'in', sequence: 0 },
  zoomMap: (action) => set(s => ({ zoomCommand: { action, sequence: s.zoomCommand.sequence + 1 } })),
  editorOpen: false,
  ready: false,
  stage: 'intro',
  origin: null,
  destination: null,
  hovered: null,
  lighting: 'night',
  reducedMotion: false,
  isMobile: false,
  emblemReady: false,
  emblemSeed: 0,
  emblemGeneration: 0,
  backgroundId: GALAXY_BACKGROUNDS[0].id,
  backgroundStatus: 'ready',
  setBackground: (id) => {
    if (id !== get().backgroundId && GALAXY_BACKGROUNDS.some(background => background.id === id)) set({ backgroundId: id, backgroundStatus: 'loading' })
  },
  setBackgroundStatus: (backgroundStatus) => set({ backgroundStatus }),
  garmentIndex: 0,
  worldSection: 'Collection',
  completeEmblem: () => { if (get().stage === 'reveal') set({ emblemReady: true }) },
  selectGarment: (index) => set({ garmentIndex: wrapGarment(index) }),
  setWorldSection: (worldSection) => set({ worldSection }),
  setReady: () => set({ ready: true }),
  setStage: (stage) => {
    if (stage === 'reveal' && get().journeyStep !== 'connected') return
    if ((stage === 'reveal' || stage === 'garment' || stage === 'world') && (!get().origin || !get().destination)) return
    const current = get()
    const creating = stage === 'reveal' && current.stage !== 'reveal'
    const freshSeed = creating ? hashString(`${current.origin}|${current.destination}|${current.emblemGeneration+1}|${globalThis.crypto.getRandomValues(new Uint32Array(1))[0]}`) : current.emblemSeed
    // Cycle the design family while varying details within it on each creation.
    const emblemSeed = creating ? ((freshSeed & 0xfffffffc) | ((current.emblemSeed + 1) & 3)) >>> 0 : current.emblemSeed
    set({ stage, hovered: null, ...(creating ? { emblemSeed, emblemGeneration:current.emblemGeneration+1, emblemReady: false, garmentIndex: 0, worldSection: 'Collection' as const } : {}) })
  },
  selectLocation: (id) => {
    const s = get()
    if (s.stage === 'reveal' || s.stage === 'garment' || s.stage === 'world') return
    const selection = journeySelection(s.journeyStep, id, s.origin)
    if (selection) set({ ...selection, hovered: null })
  },
  setHovered: (hovered) => set({ hovered }),
  setLighting: (lighting) => set({ lighting }),
  setEnvironment: (env) => set(env),
  restart: () => set({ editorOpen: false, journeyStep: 'origin', stage: 'q1', origin: null, destination: null, hovered: null, lighting: 'night', emblemReady: false, garmentIndex: 0, worldSection: 'Collection' }),
}))
