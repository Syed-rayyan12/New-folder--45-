export type ClientCoordinates={lat:number;lng:number;accuracy:number;name?:string}

/** Resolve only the visitor's live, consented GPS position, directly in their browser. */
export async function getClientLocationName(coordinates:ClientCoordinates,request:typeof fetch=fetch):Promise<string>{
  const query=new URLSearchParams({latitude:String(coordinates.lat),longitude:String(coordinates.lng),localityLanguage:'en'})
  const response=await request(`https://api.bigdatacloud.net/data/reverse-geocode-client?${query}`,{signal:AbortSignal.timeout(8000),credentials:'omit'})
  if(!response.ok)throw new Error('Your position was found, but its place name could not be loaded. Try again or enter your city manually.')
  const data=await response.json()
  const clean=(value:unknown)=>typeof value==='string'?value.trim():''
  const city=clean(data.city)||clean(data.locality)||clean(data.principalSubdivision)
  const country=clean(data.countryName)
  if(!city||!country)throw new Error('Your position was found, but no city name was available. Enter your city manually.')
  return [...new Set([city,country])].join(', ')
}
type LocationAPI=Pick<Geolocation,'getCurrentPosition'>

export async function getClientLocation(geolocation:LocationAPI|undefined,secure:boolean,onRetry?:()=>void):Promise<ClientCoordinates>{
  if(!secure)throw new Error('Open this site with HTTPS or localhost to use your location.')
  if(!geolocation)throw new Error('Location detection is unavailable in this browser. Try an updated browser.')
  const attempt=(timeout:number)=>new Promise<GeolocationPosition>((resolve,reject)=>{
    // Do not require a GPS-quality fix on desktop devices.
    geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:false,timeout,maximumAge:60000})
  })
  try{
    let position:GeolocationPosition
    try{position=await attempt(15000)}catch(error){
      if((error as GeolocationPositionError).code===1)throw error
      onRetry?.();position=await attempt(20000)
    }
    const {latitude:lat,longitude:lng,accuracy}=position.coords
    if(!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180)throw new Error('The device returned invalid coordinates. Please try again.')
    return {lat,lng,accuracy}
  }catch(error){
    const code=(error as GeolocationPositionError).code
    if(code===1)throw new Error("Location is blocked. Allow Location in this site's browser settings and enable Location services on your device, then try again.")
    if(code===2)throw new Error("Your device could not provide a location. Turn on Wi-Fi or device Location services, then try again.")
    if(code===3)throw new Error('Location detection timed out. Check your connection, then try again.')
    throw error instanceof Error?error:new Error('Location detection failed. Please try again.')
  }
}
