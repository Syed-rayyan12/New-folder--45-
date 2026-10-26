import type { Location } from './locations'

// English counterparts of the locations in GhostCat's original demo.
export const TECH_EARTH_LOCATIONS: readonly Location[] = [
  ['Hangzhou','China',30.246026,120.210792],['Beijing','China',39.89491,116.322056],
  ['Bangkok','Thailand',13.7563,100.5018],['Sydney','Australia',-33.8688,151.2093],
  ['Urumqi','China',43.8256,87.6168],['Tehran','Iran',35.6892,51.389],
  ['Los Angeles','United States',34.0522,-118.2437],['Brasilia','Brazil',-15.7975,-47.8919],
  ['Lhasa','China',29.652,91.1721],['Nanning','China',22.817,108.3669],
  ['Nanchang','China',28.6829,115.8582],['Guiyang','China',26.647,106.6302],
].map(([name,country,lat,lng])=>({
  id:`custom:${lat}:${lng}:${encodeURIComponent(String(name))}` as const,name:String(name),country:String(country),
  code:String(name).slice(0,3).toUpperCase(),lat:Number(lat),lng:Number(lng),statement:'A place in your story.',
}))

export const TECH_FLIGHT_PAIRS = [[0,2],[0,3],[0,5],[0,6],[0,7],[1,8],[1,9],[1,10],[1,11]] as const
