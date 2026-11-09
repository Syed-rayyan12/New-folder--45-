export type MockupAsset = {
  id: string
  name: string
  src: string
  width?: number
  height?: number
  bounds?: [number, number, number, number]
  frontPrint?: {left:number;top:number;width:number}
  backSrc?: string
  tintGain?: number
  modelSrc?: string
  materialSrc?: string
}

export const DEFAULT_MOCKUPS: MockupAsset[] = [
  { id:'original-tshirt', name:'Your T-Shirt', src:'/images/Green%20Crew-Neck%20T-Shirt%20Mockup.png', modelSrc:'/images/t-shirt-obj/t-shirt.obj', materialSrc:'/images/t-shirt-obj/t-shirt.mtl', tintGain:2 },
  { id:'original-hoodie', name:'Your Hoodie', src:'/images/hoodie.png', modelSrc:'/images/hoodie-obj/hoodie.obj', materialSrc:'/images/hoodie-obj/hoodie.mtl', frontPrint:{left:50,top:52,width:12}, tintGain:2 },
  { id:'original-long-sleeve', name:'Your Sweater', src:'/images/Bright%20Green%20Long-Sleeve%20Crewneck%20Shirt.png', modelSrc:'/images/sweater-obj/sweater.obj', materialSrc:'/images/sweater-obj/sweater.mtl', tintGain:2 },
]

export const GARMENT_COLORS = [
  { name:'Original', value:'original' }, { name:'Onyx', value:'#171b19' },
  { name:'Chalk', value:'#eeeae1' }, { name:'Stone', value:'#9a9b92' },
  { name:'Forest', value:'#355644' }, { name:'Heritage Green', value:'#67F163' },
  { name:'Midnight', value:'#22344a' }, { name:'Burgundy', value:'#612e39' },
  { name:'Clay', value:'#9a6c52' }, { name:'Sand', value:'#c1ad89' },
] as const
