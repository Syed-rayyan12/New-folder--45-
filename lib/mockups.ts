export type MockupAsset = {
  id: string
  name: string
  src: string
  width?: number
  height?: number
  bounds?: [number, number, number, number]
  tintGain?: number
}

export const DEFAULT_MOCKUPS: MockupAsset[] = [
  { id:'original-tank', name:'Your Tank', src:'/images/tank.png', width:750, height:333, bounds:[289,66,171,221], tintGain:2 },
  { id:'studio-tank-front', name:'Studio Tank', src:'/mockups/studio-tank-front.png', tintGain:1.35 },
]

export const GARMENT_COLORS = [
  { name:'Original', value:'original' }, { name:'Onyx', value:'#171b19' },
  { name:'Chalk', value:'#eeeae1' }, { name:'Stone', value:'#9a9b92' },
  { name:'Forest', value:'#355644' }, { name:'Heritage Green', value:'#67F163' },
  { name:'Midnight', value:'#22344a' }, { name:'Burgundy', value:'#612e39' },
  { name:'Clay', value:'#9a6c52' }, { name:'Sand', value:'#c1ad89' },
] as const
