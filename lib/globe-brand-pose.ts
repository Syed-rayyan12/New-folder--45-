import { Matrix4,Quaternion,Vector3 } from 'three'
import { latLngToVector3 } from './geo'

export const GLOBE_BRAND_ANCHOR={lat:32,lng:20} as const

/** Capture one fixed print position in the Earth's local coordinate system. */
export function createGlobeBrandSurface(cameraPosition:Vector3,cameraRotation:Quaternion,globeRotation:Quaternion){
  // Open space inside the London / Lagos / Tehran triangle, over North Africa.
  // Camera orbiting never moves the artwork onto another place.
  const normal=latLngToVector3(GLOBE_BRAND_ANCHOR.lat,GLOBE_BRAND_ANCHOR.lng,1).normalize()
  const right=new Vector3().crossVectors(new Vector3(0,1,0),normal).normalize()
  const up=new Vector3().crossVectors(normal,right).normalize()
  const rotation=new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(right,up,normal))
  const size=new Vector3(1.22,1.22*194/330,.45)
  const samples:Vector3[]=[]
  for(const x of [-size.x/2,0,size.x/2])for(const y of [-size.y/2,0,size.y/2])samples.push(new Vector3(x,y,Math.sqrt(4-x*x-y*y)).applyQuaternion(rotation))
  return {position:normal.multiplyScalar(2.025),rotation,size,samples}
}
