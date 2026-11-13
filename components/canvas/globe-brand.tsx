'use client'

import { useFrame,useThree } from '@react-three/fiber'
import { useEffect,useMemo,useRef } from 'react'
import { AdditiveBlending,CanvasTexture,Color,Euler,MathUtils,Mesh,MeshBasicMaterial,Quaternion,ShaderMaterial,SphereGeometry,SRGBColorSpace } from 'three'
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js'
import { BRAND_LOGO_PATHS } from '@/lib/brand-logo'
import { createGlobeBrandSurface } from '@/lib/globe-brand-pose'

export type GlobeBrandTarget={x:number;y:number;width:number}

// Median bright lettering sampled from public/images/match.jpeg.
// The reference uses a lighter lime ink over the green globe, not white.
const GLOBE_LOGO_COLOR = '#A1FD83'
const GLOBE_LOGO_OPACITY = 0.85
const brandVertex=`
  varying vec2 vUv; varying vec3 vNormal; varying vec3 vView;
  void main(){vUv=uv;vNormal=normalize(normalMatrix*normal);vec4 view=modelViewMatrix*vec4(position,1.);vView=normalize(-view.xyz);gl_Position=projectionMatrix*view;}
`
const brandFragment=`
  uniform sampler2D artwork;uniform vec3 inkColor;uniform float inkOpacity;
  varying vec2 vUv;varying vec3 vNormal;varying vec3 vView;
  void main(){
    float mask=texture2D(artwork,vUv).a;
    vec2 spread=vec2(.004,.007);
    float halo=(texture2D(artwork,vUv+vec2(spread.x,0.)).a+texture2D(artwork,vUv-vec2(spread.x,0.)).a+texture2D(artwork,vUv+vec2(0.,spread.y)).a+texture2D(artwork,vUv-vec2(0.,spread.y)).a)*.25;
    if(max(mask,halo)<.01)discard;
    float rim=pow(1.-abs(dot(normalize(vNormal),normalize(vView))),2.);
    // Translucent reference-colored light preserves the ocean beneath the mark.
    gl_FragColor=vec4(inkColor,clamp((mask*(.65+.25*rim)+halo*.16)*inkOpacity,0.,.82));
  }
`

/** Curved artwork on the globe surface; its parent keeps it stable as locations rotate. */
export function GlobeBrand({orientation,canvas,visible=true,onTarget}:{orientation:Quaternion;canvas?:HTMLCanvasElement|null;visible?:boolean;onTarget?:(target:GlobeBrandTarget)=>void}){
  const camera=useThree(state=>state.camera),gl=useThree(state=>state.gl)
  const material=useRef<ShaderMaterial>(null)
  const mesh=useRef<Mesh>(null),lastTarget=useRef<GlobeBrandTarget|null>(null)
  const pose=useMemo(()=>createGlobeBrandSurface(camera.position,camera.quaternion,orientation),[camera,orientation])
  const geometry=useMemo(()=>{
    const sphere=new Mesh(new SphereGeometry(2,128,64),new MeshBasicMaterial())
    sphere.updateMatrixWorld(true)
    const geometry=new DecalGeometry(sphere,pose.position,new Euler().setFromQuaternion(pose.rotation),pose.size)
    sphere.geometry.dispose();sphere.material.dispose()
    return geometry
  },[pose])
  const texture=useMemo(()=>{
    // The intro retains its particles; the globe uses the complete, clean artwork.
    const surface=document.createElement('canvas')
    surface.width=990;surface.height=582
    const context=surface.getContext('2d')
    if(!context)return null
    context.scale(3,3)
    context.fillStyle='#ffffff'
    for(const path of BRAND_LOGO_PATHS)context.fill(new Path2D(path),'evenodd')
    const texture=new CanvasTexture(surface)
    texture.colorSpace=SRGBColorSpace;texture.needsUpdate=true
    return texture
  },[])
  // This custom shader writes display color directly, like the Earth's shader.
  const uniforms=useMemo(()=>({artwork:{value:texture},inkColor:{value:new Color(GLOBE_LOGO_COLOR).convertLinearToSRGB()},inkOpacity:{value:0}}),[texture])
  useEffect(()=>()=>geometry.dispose(),[geometry])
  useEffect(()=>()=>texture?.dispose(),[texture])
  useFrame((_,delta)=>{
    if(material.current){const opacity=material.current.uniforms.inkOpacity;opacity.value=MathUtils.damp(opacity.value,(visible&&texture) ? GLOBE_LOGO_OPACITY : 0,4,Math.min(delta,.1))}
    if(!onTarget||!mesh.current)return
    mesh.current.updateWorldMatrix(true,false)
    const rect=gl.domElement.getBoundingClientRect()
    let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity
    for(const local of pose.samples){const point=local.clone().applyMatrix4(mesh.current.matrixWorld).project(camera),x=rect.left+(point.x+1)*rect.width/2,y=rect.top+(1-point.y)*rect.height/2;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y)}
    const target={x:(minX+maxX)/2,y:(minY+maxY)/2,width:maxX-minX},last=lastTarget.current
    if(target.width>0&&(!last||Math.abs(target.x-last.x)>.5||Math.abs(target.y-last.y)>.5||Math.abs(target.width-last.width)>.5)){lastTarget.current=target;onTarget(target)}
  })
  return <mesh ref={mesh} geometry={geometry} renderOrder={4} raycast={()=>{}}><shaderMaterial ref={material} uniforms={uniforms} vertexShader={brandVertex} fragmentShader={brandFragment} blending={AdditiveBlending} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-4} polygonOffsetUnits={-4} toneMapped={false}/></mesh>
}
