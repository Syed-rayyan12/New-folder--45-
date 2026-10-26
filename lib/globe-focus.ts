import { Matrix4, Quaternion, Vector3 } from 'three'
import { latLngToVector3 } from './geo'

type Coordinate = { lat: number; lng: number }

/** Keep the chosen journey facing the viewer with geographic north upright. */
export function journeyOrientation(origin: Coordinate, destination: Coordinate | null, cameraPosition: Vector3) {
  const center = latLngToVector3(origin.lat, origin.lng, 1)
  if (destination) {
    const end = latLngToVector3(destination.lat, destination.lng, 1)
    const midpoint = center.clone().add(end)
    if (midpoint.lengthSq() > 0.000001) center.copy(midpoint.normalize())
  }
  const north = new Vector3(0, 1, 0)
  const right = new Vector3().crossVectors(north, center)
  if (right.lengthSq() < 0.000001) right.set(1, 0, 0)
  right.normalize()
  const up = new Vector3().crossVectors(center, right).normalize()
  const facing = cameraPosition.clone().normalize()
  const screenRight = new Vector3().crossVectors(north, facing)
  if (screenRight.lengthSq() < 0.000001) screenRight.set(1, 0, 0)
  screenRight.normalize()
  const screenUp = new Vector3().crossVectors(facing, screenRight).normalize()
  const source = new Matrix4().makeBasis(right, up, center).transpose()
  const target = new Matrix4().makeBasis(screenRight, screenUp, facing)
  return new Quaternion().setFromRotationMatrix(target.multiply(source))
}
