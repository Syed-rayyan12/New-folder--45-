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
  { id:'original-tshirt', name:'Your T-Shirt', src:'/images/Green%20Crew-Neck%20T-Shirt%20Mockup.png', tintGain:2 },
  { id:'original-hoodie', name:'Your Hoodie', src:'/images/hoodie.png', tintGain:2 },
  { id:'original-long-sleeve', name:'Long Sleeve', src:'/images/Bright%20Green%20Long-Sleeve%20Crewneck%20Shirt.png', tintGain:2 },
]

export const GARMENT_COLORS = [
  { name:'Original', value:'original' }, { name:'Onyx', value:'#171b19' },
  { name:'Chalk', value:'#eeeae1' }, { name:'Stone', value:'#9a9b92' },
  { name:'Forest', value:'#355644' }, { name:'Heritage Green', value:'#67F163' },
  { name:'Midnight', value:'#22344a' }, { name:'Burgundy', value:'#612e39' },
  { name:'Clay', value:'#9a6c52' }, { name:'Sand', value:'#c1ad89' },
] as const
