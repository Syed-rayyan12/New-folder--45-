'use client'

import { Canvas, useLoader, useThree } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { Component, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { FileLoader, PerspectiveCamera } from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { ObjGarment } from '../canvas/obj-garment'
import type { MockupAsset } from '@/lib/mockups'

class ModelBoundary extends Component<{children:ReactNode;retry:()=>void},{failed:boolean}> {
  state={failed:false}
  static getDerivedStateFromError(){return {failed:true}}
  render(){return this.state.failed?<div className="mockup-model-error" role="alert"><p>This 3D model could not load.</p><button type="button" onClick={this.props.retry}>Try again</button></div>:this.props.children}
}

function FitCamera({reset,bounds,onFit}:{reset:number;bounds:[number,number,number];onFit:(distance:number)=>void}) {
  const {camera,size,invalidate}=useThree()
  useEffect(()=>{
    if(!(camera instanceof PerspectiveCamera))return
    const tangent=Math.tan(camera.fov*Math.PI/360)
    const aspect=Math.max(.2,size.width/Math.max(1,size.height))
    const distance=Math.max(bounds[1]/(2*tangent),bounds[0]/(2*tangent*aspect))*1.08+bounds[2]/2
    camera.position.set(0,0,distance);camera.lookAt(0,0,0);camera.updateProjectionMatrix();onFit(distance);invalidate()
  },[camera,size.width,size.height,reset,bounds,onFit,invalidate])
  return null
}

export default function Mockup3DViewer({asset,color,seed,replay,active=true}:{asset:MockupAsset;color:string;seed:number;replay:number;active?:boolean}) {
  const host=useRef<HTMLDivElement>(null)
  const [attempt,setAttempt]=useState(0),[reset,setReset]=useState(0),[distance,setDistance]=useState(6)
  const [bounds,setBounds]=useState<[number,number,number]>([2.8,2.8,1.2])
  const [loaded,setLoaded]=useState(false)
  const modelReady=useCallback((size:[number,number,number])=>{setBounds(size);setLoaded(true)},[])
  useEffect(()=>{
    const node=host.current;if(!node)return
    // OrbitControls owns wheel/pinch zoom; don't also zoom the CSS carousel.
    const stop=(event:WheelEvent)=>event.stopPropagation()
    node.addEventListener('wheel',stop,{passive:true})
    return()=>node.removeEventListener('wheel',stop)
  },[])
  const retry=()=>{setLoaded(false);useLoader.clear(OBJLoader,asset.modelSrc!);useLoader.clear(FileLoader,asset.materialSrc!);setAttempt(value=>value+1)}
  return <div ref={host} className="mockup-3d-viewer" data-model-src={asset.modelSrc} data-model-state={loaded?'ready':'loading'} aria-busy={!loaded} onKeyDown={event=>{if(active)event.stopPropagation()}} onPointerDown={event=>{if(active)event.stopPropagation()}} onDoubleClick={event=>{event.stopPropagation();setReset(value=>value+1)}}>
    <ModelBoundary key={`${asset.id}-${attempt}`} retry={retry}>
      <Canvas frameloop="demand" dpr={active?[1,1.5]:1} resize={{offsetSize:true}} camera={{position:[0,0,6],fov:35}} gl={{alpha:true,antialias:true}} onCreated={({gl})=>{gl.localClippingEnabled=true}}>
        <ambientLight intensity={.7}/><hemisphereLight args={['#e3efe0','#273328',1.5]}/>
        <directionalLight position={[3,4,5]} intensity={2.4}/><directionalLight position={[-4,2,1]} intensity={1.1}/><directionalLight position={[1,3,-4]} intensity={2}/>
        <Suspense fallback={<Html center><span className="mockup-model-loading" role="status">Loading 3D garment...</span></Html>}>
          <ObjGarment asset={asset} color={color} seed={seed} replay={replay} active={active} onBounds={modelReady}/>
        </Suspense>
        <FitCamera reset={reset} bounds={bounds} onFit={setDistance}/>
        <OrbitControls makeDefault enabled={active} enablePan={false} enableZoom minDistance={distance*.55} maxDistance={distance*1.8} minPolarAngle={.15} maxPolarAngle={Math.PI-.15} enableDamping dampingFactor={.08} rotateSpeed={.65} zoomSpeed={.7}/>
      </Canvas>
    </ModelBoundary>
    {active&&<div className="mockup-3d-hint"><span>DRAG TO ROTATE / SCROLL TO ZOOM</span><button type="button" onClick={()=>setReset(value=>value+1)}>Reset view</button></div>}
  </div>
}
