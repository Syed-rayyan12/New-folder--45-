export type ClientCoordinates={lat:number;lng:number;accuracy:number}
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
