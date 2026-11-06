'use client'

import { Line } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { useMemo } from 'react'
import { Color } from 'three'
import { LocalTextureLoader } from '@/lib/local-texture-loader'
import { arcPoints, latLngToVector3 } from '@/lib/geo'
import { techEarthVertex, atmosphereVertex, atmosphereFragment } from '@/lib/ghostcat-earth-shaders'

// Sample each dot's center so coastlines have complete circular dots.
const dottedSurface = `
  uniform sampler2D landMask;
  uniform vec3 color;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPositionNormal;
  void main() {
    float rows = 180.0;
    float row = floor(vUv.y * rows);
    float latitude = ((row + .5) / rows - .5) * 3.14159265;
    float columns = max(12.0, floor(360.0 * cos(latitude)));
    vec2 grid = vec2(columns, rows);
    vec2 cell = floor(vUv * grid);
    vec2 center = (cell + .5) / grid;
    float land = 1.0 - smoothstep(.15, .7, texture2D(landMask, center).r);
    float d = length(fract(vUv * grid) - .5);
    float dotInk = 1.0 - smoothstep(.20 - fwidth(d), .20 + fwidth(d), d);
    float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vPositionNormal))), 5.0);
    gl_FragColor = vec4(vec3(.001, .009, .003) + color * (dotInk * land * 1.4 + rim * .85), 1.0);
  }
`

const hubs = [[51.5,-.1],[40.7,-74],[-23.5,-46.6],[-26.2,28],[25.2,55.3],[1.3,103.8],[35.7,139.7],[37.8,-122.4]]
const links = [[0,1],[0,2],[0,3],[0,4],[4,5],[5,6],[1,7],[3,5]]

/** Geographic dotted surface and raised network arcs, sharing the existing globe's coordinates. */
export function NetworkEarth() {
  const mask = useLoader(LocalTextureLoader, '/textures/earth-specular.jpg')
  const uniforms = useMemo(() => ({landMask:{value:mask},color:{value:new Color('#67ff57')}}), [mask])
  const nodes = useMemo(() => hubs.map(([lat,lng]) => latLngToVector3(lat,lng,2.025)), [])
  const routes = useMemo(() => links.map(([a,b]) => arcPoints(nodes[a],nodes[b],100,.28)), [nodes])
  return <group>
    <mesh onPointerOver={e=>e.stopPropagation()} onPointerMove={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()}>
      <sphereGeometry args={[2,96,64]}/>
      <shaderMaterial uniforms={uniforms} vertexShader={techEarthVertex} fragmentShader={dottedSurface} toneMapped={false}/>
    </mesh>
    <mesh raycast={()=>{}}>
      <sphereGeometry args={[2.012,64,48]}/>
      <shaderMaterial vertexShader={atmosphereVertex} fragmentShader={atmosphereFragment} transparent depthWrite={false}/>
    </mesh>
    {routes.map((points,i)=><Line key={i} points={points} color="#76ff50" lineWidth={1.1} transparent opacity={.8} depthWrite={false} toneMapped={false} raycast={()=>{}}/>)}
    {nodes.map((position,i)=><group key={i} position={position}>
      <mesh raycast={()=>{}}><sphereGeometry args={[.027,12,12]}/><meshBasicMaterial color="#aaff75" toneMapped={false}/></mesh>
      <mesh raycast={()=>{}}><sphereGeometry args={[.06,12,12]}/><meshBasicMaterial color="#67ff57" transparent opacity={.16} depthWrite={false} toneMapped={false}/></mesh>
    </group>)}
  </group>
}
