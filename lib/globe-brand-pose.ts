import { Quaternion,Vector3 } from 'three'

/** Capture one fixed print position in the Earth's local coordinate system. */
export function createGlobeBrandSurface(cameraPosition:Vector3,cameraRotation:Quaternion,globeRotation:Quaternion){
  const inverse=globeRotation.clone().invert()
  const normal=cameraPosition.clone().normalize().applyQuaternion(inverse)
  const rotation=inverse.multiply(cameraRotation)
  const size=new Vector3(1.8,1.8*194/330,.8)
  const samples:Vector3[]=[]
  for(const x of [-size.x/2,0,size.x/2])for(const y of [-size.y/2,0,size.y/2])samples.push(new Vector3(x,y,Math.sqrt(4-x*x-y*y)).applyQuaternion(rotation))
  return {position:normal.multiplyScalar(2.025),rotation,size,samples}
}
