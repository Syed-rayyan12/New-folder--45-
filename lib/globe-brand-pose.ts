import { Matrix4,Quaternion,Vector3 } from 'three'

/** Capture one fixed print position in the Earth's local coordinate system. */
export function createGlobeBrandSurface(cameraPosition:Vector3,cameraRotation:Quaternion,globeRotation:Quaternion){
  const inverse=globeRotation.clone().invert()
  // OrbitControls may not have oriented the camera on the first render yet.
  // Derive the decal frame from the view ray so its center and baseline agree.
  const facing=cameraPosition.clone().normalize()
  const screenUp=new Vector3(0,1,0).applyQuaternion(cameraRotation)
  const right=new Vector3().crossVectors(screenUp,facing)
  if(right.lengthSq()<1e-8)right.crossVectors(new Vector3(0,0,1),facing)
  right.normalize()
  const up=new Vector3().crossVectors(facing,right).normalize()
  const worldRotation=new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(right,up,facing))
  const normal=facing.clone().applyQuaternion(inverse)
  const rotation=inverse.multiply(worldRotation)
  const size=new Vector3(1.8,1.8*194/330,.8)
  const samples:Vector3[]=[]
  for(const x of [-size.x/2,0,size.x/2])for(const y of [-size.y/2,0,size.y/2])samples.push(new Vector3(x,y,Math.sqrt(4-x*x-y*y)).applyQuaternion(rotation))
  return {position:normal.multiplyScalar(2.025),rotation,size,samples}
}
