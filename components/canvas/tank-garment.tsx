'use client'

import { useEffect, useMemo } from 'react'
import { BufferGeometry, CatmullRomCurve3, DataTexture, DoubleSide, Float32BufferAttribute, RepeatWrapping, RGBAFormat, Shape, ShapeGeometry, TubeGeometry, Vector3 } from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

function surface(rows:number,cols:number,fn:(u:number,v:number)=>number[]){
  const p:number[]=[],uv:number[]=[],idx:number[]=[]
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){p.push(...fn(i/cols,j/rows));uv.push(i/cols,j/rows);if(j<rows&&i<cols){const a=j*(cols+1)+i,b=a+cols+1;idx.push(a,b,a+1,b,b+1,a+1)}}
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(p,3));g.setAttribute('uv',new Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g
}
const depth=(x:number,y:number)=>{const w=.81+.30*Math.max(0,(y-.6)/.7);return .28*Math.sqrt(Math.max(.03,1-(x/w)**2))}
function upperPanel(back:boolean){
  const shape=new Shape();shape.moveTo(-.78,.6);shape.lineTo(-.88,.84);shape.quadraticCurveTo(-.96,.98,-1.04,1.02);shape.lineTo(-.72,1.22);shape.quadraticCurveTo(-.5,1.30,-.32,1.30)
  shape.quadraticCurveTo(-.26,back?1.19:1.05,0,back?1.18:1.03);shape.quadraticCurveTo(.26,back?1.19:1.05,.32,1.30);shape.quadraticCurveTo(.5,1.30,.72,1.22);shape.lineTo(1.04,1.02);shape.quadraticCurveTo(.96,.98,.88,.84);shape.lineTo(.78,.6);shape.closePath()
  const base=new ShapeGeometry(shape,24),pos=base.getAttribute('position'),index=base.index!,p:number[]=[],uv:number[]=[]
  const emit=(a:number[],b:number[],c:number[],level:number)=>{if(level){const mid=(x:number[],y:number[])=>[(x[0]+y[0])/2,(x[1]+y[1])/2],ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);emit(a,ab,ca,level-1);emit(ab,b,bc,level-1);emit(ca,bc,c,level-1);emit(ab,bc,ca,level-1)}else for(const [x,y]of back?[c,b,a]:[a,b,c]){const fold=.008*Math.sin(x*24+y*11)*Math.sin((y-.6)/.75*Math.PI);p.push(x,y,(back?-1:1)*(depth(x,y)+fold));uv.push((x+1.1)/2.2,(y+1.2)/2.55)}}
  for(let i=0;i<index.count;i+=3){const point=(n:number)=>[pos.getX(index.getX(n)),pos.getY(index.getX(n))];emit(point(i),point(i+1),point(i+2),2)}base.dispose()
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(p,3));g.setAttribute('uv',new Float32BufferAttribute(uv,2));const smooth=mergeVertices(g,0.00001);g.dispose();smooth.computeVertexNormals();return smooth
}

export function createTankGeometries(){
    const body=surface(56,88,(u,v)=>{const a=u*Math.PI*2,y=-1.12+v*1.77,w=.74+.07*v-.045*Math.sin(v*Math.PI),d=.22+.06*Math.sin(v*Math.PI/2),fold=(.012*Math.sin(a*12+v*8)+.005*Math.sin(a*23-v*14))*Math.sin(v*Math.PI);return[Math.cos(a)*(w+fold),y+.008*Math.sin(a*5)*(1-v),Math.sin(a)*(d+fold)]})
    const shoulders=[-1,1].map(side=>surface(16,38,(u,v)=>{const x=side*(.32+.72*u),y=1.30-.28*u**1.4;return[x,y+.025*Math.sin(v*Math.PI),depth(x,y)*(1-2*v)]}))
    const collar=[[-.32,1.30,depth(-.32,1.30)],[0,1.03,.28],[.32,1.30,depth(.32,1.30)],[.32,1.33,0],[.32,1.30,-depth(.32,1.30)],[0,1.18,-.28],[-.32,1.30,-depth(-.32,1.30)],[-.32,1.33,0]].map(p=>new Vector3(...p as [number,number,number]))
    const seams=[new TubeGeometry(new CatmullRomCurve3(collar,true,'centripetal'),120,.017,7,true)]
    for(const side of [-1,1]){const outline=[[side*.78,.6,depth(.78,.6)],[side*.88,.84,depth(.88,.84)],[side*1.04,1.02,.05],[side*1.06,1.04,0],[side*1.04,1.02,-.05],[side*.88,.84,-depth(.88,.84)],[side*.78,.6,-depth(.78,.6)],[side*.81,.65,0]].map(p=>new Vector3(...p as [number,number,number]));seams.push(new TubeGeometry(new CatmullRomCurve3(outline,true,'centripetal'),100,.014,6,true))}
    const hem=Array.from({length:81},(_,i)=>new Vector3(Math.cos(i/80*Math.PI*2)*.74,-1.10,Math.sin(i/80*Math.PI*2)*.22));seams.push(new TubeGeometry(new CatmullRomCurve3(hem,false,'centripetal'),100,.018,6,false))
    return{body,front:upperPanel(false),back:upperPanel(true),shoulders,seams}

}

/** Volumetric cloth with open neck and armholes, shoulder seams and a plain back. */
export function TankGarment({color}:{color:string}){
  const geometry=useMemo(createTankGeometries,[])
  const fabric=useMemo(()=>{const data=new Uint8Array(128*128*4);for(let y=0;y<128;y++)for(let x=0;x<128;x++){const i=(y*128+x)*4,n=118+((x+y)%2?17:-17)+Math.sin(x*12.7+y*77.3)*8;data[i]=data[i+1]=data[i+2]=n;data[i+3]=255}const t=new DataTexture(data,128,128,RGBAFormat);t.wrapS=t.wrapT=RepeatWrapping;t.repeat.set(12,16);t.needsUpdate=true;return t},[])
  useEffect(()=>()=>{geometry.body.dispose();geometry.front.dispose();geometry.back.dispose();geometry.shoulders.forEach(g=>g.dispose());geometry.seams.forEach(g=>g.dispose());fabric.dispose()},[geometry,fabric])
  return <group>{[geometry.body,geometry.front,geometry.back,...geometry.shoulders,...geometry.seams].map((g,i)=><mesh key={i} geometry={g} castShadow receiveShadow><meshStandardMaterial color={color} roughness={.89} metalness={0} bumpMap={fabric} bumpScale={i<5?.007:.003} side={DoubleSide}/></mesh>)}</group>
}
