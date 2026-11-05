'use client'

import { useFrame,useThree } from '@react-three/fiber'
import { useEffect,useMemo,useRef } from 'react'
import { CanvasTexture,Euler,MathUtils,Mesh,MeshBasicMaterial,Quaternion,SphereGeometry,SRGBColorSpace } from 'three'
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js'
import { GLOBE_COLOR } from '@/lib/palette'
import { createGlobeBrandSurface } from '@/lib/globe-brand-pose'

export type GlobeBrandTarget={x:number;y:number;width:number}

/** A curved decal, parented to the Earth, with no camera-following transform. */
export function GlobeBrand({orientation,canvas,visible=true,onTarget}:{orientation:Quaternion;canvas?:HTMLCanvasElement|null;visible?:boolean;onTarget?:(target:GlobeBrandTarget)=>void}){
  const camera=useThree(state=>state.camera),gl=useThree(state=>state.gl)
  const material=useRef<MeshBasicMaterial>(null)
  const mesh=useRef<Mesh>(null),lastTarget=useRef<GlobeBrandTarget|null>(null)
  const pose=useMemo(()=>createGlobeBrandSurface(camera.position,camera.quaternion,orientation),[camera,orientation])
  const geometry=useMemo(()=>{
    const sphere=new Mesh(new SphereGeometry(2,128,64),new MeshBasicMaterial())
    sphere.updateMatrixWorld(true)
    const geometry=new DecalGeometry(sphere,pose.position,new Euler().setFromQuaternion(pose.rotation),pose.size)
    sphere.geometry.dispose();sphere.material.dispose()
    return geometry
  },[pose])
  const texture=useMemo(()=>{if(!canvas)return null;const transparent=document.createElement('canvas');transparent.width=canvas.width;transparent.height=canvas.height;const ctx=transparent.getContext('2d')!;ctx.drawImage(canvas,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);for(let i=0;i<pixels.data.length;i+=4){const brightness=Math.max(pixels.data[i],pixels.data[i+1],pixels.data[i+2])/255;pixels.data[i]=255;pixels.data[i+1]=255;pixels.data[i+2]=255;pixels.data[i+3]*=brightness}ctx.putImageData(pixels,0,0);const texture=new CanvasTexture(transparent);texture.colorSpace=SRGBColorSpace;texture.needsUpdate=true;return texture},[canvas])
  useEffect(()=>()=>geometry.dispose(),[geometry])
  useEffect(()=>()=>texture?.dispose(),[texture])
  useFrame((_,delta)=>{
    if(material.current)material.current.opacity=MathUtils.damp(material.current.opacity,(visible&&texture) ? .72 : 0,4,Math.min(delta,.1))
    if(!onTarget||!mesh.current)return
    mesh.current.updateWorldMatrix(true,false)
    const rect=gl.domElement.getBoundingClientRect()
    let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity
    for(const local of pose.samples){const point=local.clone().applyMatrix4(mesh.current.matrixWorld).project(camera),x=rect.left+(point.x+1)*rect.width/2,y=rect.top+(1-point.y)*rect.height/2;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y)}
    const target={x:(minX+maxX)/2,y:(minY+maxY)/2,width:maxX-minX},last=lastTarget.current
    if(target.width>0&&(!last||Math.abs(target.x-last.x)>.5||Math.abs(target.y-last.y)>.5||Math.abs(target.width-last.width)>.5)){lastTarget.current=target;onTarget(target)}
  })
  return <mesh ref={mesh} geometry={geometry} renderOrder={4} raycast={()=>{}}><meshBasicMaterial ref={material} color={GLOBE_COLOR} onUpdate={material=>{material.needsUpdate=true}} map={texture} transparent opacity={0} depthWrite={false} polygonOffset polygonOffsetFactor={-4} polygonOffsetUnits={-4} toneMapped={false}/></mesh>
}
