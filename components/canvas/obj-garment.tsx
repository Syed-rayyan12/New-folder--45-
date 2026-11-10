'use client'

import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { AdditiveBlending, Box3, CanvasTexture, Color, DoubleSide, Euler, FileLoader, LinearFilter, LinearMipmapLinearFilter, MathUtils, Matrix4, Mesh, MeshBasicMaterial, MeshStandardMaterial, Plane, Raycaster, SRGBColorSpace, Vector3 } from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js'
import { BRAND_LOGO_PATHS } from '@/lib/brand-logo'
import { buildSacredEmblem } from '@/lib/sacred-emblem'
import { GLOBE_COLOR } from '@/lib/palette'
import { useJourney } from '@/lib/store'
import type { MockupAsset } from '@/lib/mockups'

function printTexture(seed:number,ink:string,back=false,glow=false,resolution=4096,anisotropy=1) {
  const canvas=document.createElement('canvas')
  canvas.width=resolution;canvas.height=back?Math.round(resolution*194/330):resolution
  const context=canvas.getContext('2d')!
  if(back){
    context.scale(canvas.width/330,canvas.height/194);context.fillStyle=ink
    for(const path of BRAND_LOGO_PATHS)context.fill(new Path2D(path),'evenodd')
  }else{
    const emblem=buildSacredEmblem(seed)
    const radius=Math.max(...emblem.strokes.flatMap(stroke=>stroke.points.map(p=>Math.hypot(p.x,p.y))))
    context.translate(resolution/2,resolution/2);context.scale(resolution*.43/(radius+.04),-resolution*.43/(radius+.04))
    context.strokeStyle=ink;context.lineCap='round';context.lineJoin='round'
    if(glow)context.filter=`blur(${resolution/28}px)`
    for(const stroke of emblem.strokes){
      const lineWidth=Math.max(stroke.thickness*1.7,.022)
      context.beginPath();context.lineWidth=glow?lineWidth*5:lineWidth
      stroke.points.forEach((point,i)=>i?context.lineTo(point.x,point.y):context.moveTo(point.x,point.y))
      if(!glow){
        // A narrow dark stitch edge keeps luminous ink readable on light fabric.
        context.strokeStyle='#123c1a';context.lineWidth=lineWidth*1.4;context.stroke()
        context.strokeStyle=ink;context.lineWidth=lineWidth
      }
      context.stroke()
    }
  }
  const texture=new CanvasTexture(canvas)
  texture.colorSpace=SRGBColorSpace
  texture.anisotropy=anisotropy
  texture.minFilter=LinearMipmapLinearFilter;texture.magFilter=LinearFilter
  return texture
}

function surfacePrint(meshes:Mesh[],back=false) {
  const ray=new Raycaster(new Vector3(back?0:.28,back?.38:.42,back?-3:3),new Vector3(0,0,back?1:-1))
  const hit=ray.intersectObjects(meshes,false)[0]
  if(!hit?.face)return null
  const normal=hit.face.normal.clone().transformDirection(hit.object.matrixWorld)
  // Preserve the garment's vertical direction, including on the back where a
  // shortest-arc quaternion can introduce an arbitrary roll into the artwork.
  const right=new Vector3().crossVectors(new Vector3(0,1,0),normal).normalize()
  const up=new Vector3().crossVectors(normal,right).normalize()
  const rotation=new Euler().setFromRotationMatrix(new Matrix4().makeBasis(right,up,normal))
  return new DecalGeometry(hit.object as Mesh,hit.point,rotation,new Vector3(back?1:.44,back?.588:.44,.18))
}

/** The supplied OBJ geometry, normalized without changing the source asset. */
export function ObjGarment({asset,color,seed,replay,active,onBounds}:{asset:MockupAsset;color:string;seed:number;replay:number;active:boolean;onBounds?:(size:[number,number,number])=>void}) {
  const source=useLoader(OBJLoader,asset.modelSrc!)
  const materialText=useLoader(FileLoader,asset.materialSrc!)
  const reduced=useJourney(s=>s.reducedMotion)
  const monogramColor=useJourney(s=>s.monogramColor)
  const glowMaterial=useRef<MeshBasicMaterial>(null)
  const coreMaterial=useRef<MeshBasicMaterial>(null)
  const pulseTime=useRef(0)
  const luminousInk=useMemo(()=>{
    // Lift near-black ink into a visible tint and equalize brightness across hues.
    const ink=new Color(monogramColor).lerp(new Color('#ffffff'),.08)
    const luminance=ink.r*.2126+ink.g*.7152+ink.b*.0722
    return ink.multiplyScalar(1.4/luminance)
  },[monogramColor])
  const invalidate=useThree(s=>s.invalidate)
  const gl=useThree(s=>s.gl)
  const printResolution=Math.min(4096,gl.capabilities.maxTextureSize)
  const anisotropy=gl.capabilities.getMaxAnisotropy()
  const elapsed=useRef(0)
  const clip=useMemo(()=>new Plane(new Vector3(0,1,0),3),[])
  const prepared=useMemo(()=>{
    // The supplied MTLs reference absent texture files. Parse their metadata without
    // requesting nonexistent images, then use a matte physical fabric material.
    const metadata=new MTLLoader().parse(String(materialText),'').materialsInfo
    const first=Object.values(metadata)[0] as {ns?:number}|undefined
    const material=new MeshStandardMaterial({color:GLOBE_COLOR,roughness:first?.ns?Math.max(.65,Math.sqrt(2/(Number(first.ns)+2))):.9,metalness:0,side:DoubleSide,clippingPlanes:[clip]})
    const group=source.clone(true)
    const bounds=new Box3().setFromObject(group),center=bounds.getCenter(new Vector3()),size=bounds.getSize(new Vector3())
    const scale=2.8/size.y
    group.scale.setScalar(scale);group.position.copy(center).multiplyScalar(-scale)
    const meshes:Mesh[]=[]
    group.traverse(object=>{
      if(object instanceof Mesh){object.geometry=object.geometry.clone();object.material=material;object.castShadow=true;object.receiveShadow=true;meshes.push(object)}
    })
    group.updateMatrixWorld(true)
    return {group,meshes,material,size:size.multiplyScalar(scale),front:surfacePrint(meshes),back:surfacePrint(meshes,true)}
  },[source,materialText,clip])
  const shade=color==='original'?GLOBE_COLOR:color
  const ink=useMemo(()=>{const c=new Color(shade);return c.r*.2126+c.g*.7152+c.b*.0722>.4?'#142417':'#f2f0e8'},[shade])
  const front=useMemo(()=>printTexture(seed,'#ffffff',false,false,printResolution,anisotropy),[seed,printResolution,anisotropy])
  const glow=useMemo(()=>printTexture(seed,'#ffffff',false,true,Math.min(1024,printResolution),anisotropy),[seed,printResolution,anisotropy])
  const back=useMemo(()=>printTexture(seed,ink,true,false,Math.min(2048,printResolution),anisotropy),[seed,ink,printResolution,anisotropy])
  useEffect(()=>{onBounds?.([prepared.size.x,prepared.size.y,prepared.size.z])},[prepared,onBounds])
  useEffect(()=>{prepared.material.color.set(shade);invalidate()},[shade,prepared,invalidate])
  useEffect(()=>{elapsed.current=0;clip.constant=reduced||!active?3:-1.5;invalidate()},[asset.id,replay,active,reduced,clip,invalidate])
  useFrame((_,delta)=>{
    if(active&&!reduced){
      pulseTime.current+=Math.min(delta,.1)
      const pulse=(Math.sin(pulseTime.current*Math.PI/1.6)+1)/2
      if(glowMaterial.current)glowMaterial.current.opacity=.75+pulse*.25
      if(coreMaterial.current)coreMaterial.current.color.copy(luminousInk).multiplyScalar(.9+pulse*.3)
      invalidate()
    }
    if(!active||reduced||elapsed.current>=1.25)return
    elapsed.current+=Math.min(delta,.1)
    clip.constant=MathUtils.lerp(-1.5,1.5,MathUtils.smoothstep(elapsed.current,0,1.25))
    if(elapsed.current<1.25)invalidate()
  })
  useEffect(()=>{
    // Update immediately even when motion is reduced or the slide is inactive.
    glowMaterial.current?.color.copy(luminousInk)
    coreMaterial.current?.color.copy(luminousInk)
    invalidate()
  },[luminousInk,invalidate])
  useEffect(()=>{invalidate();return()=>{front.dispose();glow.dispose()}},[front,glow,invalidate])
  useEffect(()=>()=>back.dispose(),[back])
  useEffect(()=>()=>{prepared.meshes.forEach(mesh=>mesh.geometry.dispose());prepared.material.dispose();prepared.front?.dispose();prepared.back?.dispose()},[prepared])
  return <group>
    <primitive object={prepared.group} dispose={null}/>
    {prepared.front&&<>
      <mesh geometry={prepared.front} renderOrder={3} raycast={()=>{}}><meshBasicMaterial ref={glowMaterial} map={glow} color={luminousInk} transparent opacity={.95} blending={AdditiveBlending} depthWrite={false} polygonOffset polygonOffsetFactor={-3} polygonOffsetUnits={-3} toneMapped={false} clippingPlanes={[clip]}/></mesh>
      <mesh geometry={prepared.front} renderOrder={4} raycast={()=>{}}><meshBasicMaterial ref={coreMaterial} map={front} color={luminousInk} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-4} polygonOffsetUnits={-4} toneMapped={false} clippingPlanes={[clip]}/></mesh>
    </>}
    {prepared.back&&<mesh geometry={prepared.back} renderOrder={3} raycast={()=>{}}><meshBasicMaterial map={back} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-4} toneMapped={false} clippingPlanes={[clip]}/></mesh>}
  </group>
}
