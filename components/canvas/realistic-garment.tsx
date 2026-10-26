'use client'

import { useEffect, useMemo } from 'react'
import { BufferGeometry, CatmullRomCurve3, DataTexture, DoubleSide, Float32BufferAttribute, RepeatWrapping, RGBAFormat, TubeGeometry, Vector3 } from 'three'

type Kind = 'coat' | 'hoodie' | 'tee'

function surface(rows: number, columns: number, point: (u: number, v: number) => number[]) {
  const positions: number[] = [], uvs: number[] = [], indices: number[] = []
  for (let j=0;j<=rows;j++) for (let i=0;i<=columns;i++) {
    positions.push(...point(i/columns,j/rows)); uvs.push(i/columns,j/rows)
    if(j<rows && i<columns){const a=j*(columns+1)+i,b=a+columns+1;indices.push(a,b,a+1,b,b+1,a+1)}
  }
  const geometry=new BufferGeometry()
  geometry.setAttribute('position',new Float32BufferAttribute(positions,3))
  geometry.setAttribute('uv',new Float32BufferAttribute(uvs,2))
  geometry.setIndex(indices);geometry.computeVertexNormals()
  return geometry
}

function Seam({ points, color='#77776f', width=.006 }: { points: number[][]; color?: string; width?: number }) {
  const geometry=useMemo(()=>new TubeGeometry(new CatmullRomCurve3(points.map(p=>new Vector3(...p as [number,number,number]))),32,width,5,false),[points,width])
  useEffect(()=>()=>geometry.dispose(),[geometry])
  return <mesh geometry={geometry}><meshStandardMaterial color={color} roughness={.85}/></mesh>
}

export function RealisticGarment({ kind, color }: { kind: Kind; color: string }) {
  const bottom=kind==='coat'?-1.2:-.95
  const geometries=useMemo(()=>{
    const body=surface(40,64,(u,v)=>{
      const a=u*Math.PI*2,y=bottom+v*(1.13-bottom)
      const shoulder=Math.max(0,(v-.88)/.12)
      const waist=1-.06*Math.exp(-Math.pow((v-.42)*4,2))
      const w=(.62*waist)*(1-shoulder)+.235*shoulder
      const depth=.29*(1-shoulder)+.16*shoulder
      const folds=(Math.sin(a*13+y*3)*.012+Math.sin(a*23-y*5)*.005)*Math.sin(v*Math.PI)
      const drape=Math.sin(a*6+1)*.013*(1-v)
      return [Math.cos(a)*(w+folds),y+drape,Math.sin(a)*(depth+folds)]
    })
    const sleeves=[-1,1].map(side=>surface(28,32,(u,v)=>{
      const a=u*Math.PI*2,short=kind==='tee'
      const x=side*(.53+v*(short?.43:.57)),y=.83-v*(short?.56:1.62)
      const radius=(short?.225:.24)*(1-v)+(short?.19:.115)*v
      const fold=Math.sin(v*28+a*3)*.012*Math.sin(v*Math.PI)
      return [x+Math.cos(a)*(radius+fold)*.94,y+Math.cos(a)*(radius+fold)*.32,Math.sin(a)*(radius+fold)]
    }))
    const hood=surface(24,36,(u,v)=>{
      const a=u*Math.PI,cap=Math.sqrt(Math.max(.001,1-v*v))
      return [Math.cos(a)*.36*cap,1.02+v*.66,.035-Math.sin(a)*.37*cap]
    })
    return {body,sleeves,hood}
  },[kind,bottom])
  const fabric=useMemo(()=>{
    const data=new Uint8Array(128*128*4)
    for(let y=0;y<128;y++)for(let x=0;x<128;x++){
      const n=128+Math.sin(x*Math.PI)*12+((x+y)%2?18:-18)+Math.sin(x*12.9+y*78.2)*10
      const i=(y*128+x)*4;data[i]=data[i+1]=data[i+2]=n;data[i+3]=255
    }
    const texture=new DataTexture(data,128,128,RGBAFormat)
    texture.wrapS=texture.wrapT=RepeatWrapping;texture.repeat.set(12,16);texture.needsUpdate=true
    return texture
  },[])
  useEffect(()=>()=>{geometries.body.dispose();geometries.sleeves.forEach(g=>g.dispose());geometries.hood.dispose();fabric.dispose()},[geometries,fabric])
  const cloth=<meshStandardMaterial color={color} roughness={kind==='coat'?.8:.96} metalness={0} bumpMap={fabric} bumpScale={.006} side={DoubleSide}/>
  const stitch=kind==='hoodie'?'#8e8a80':kind==='tee'?'#4c554f':'#43474c'
  return <group>
    <mesh geometry={geometries.body}>{cloth}</mesh>
    {geometries.sleeves.map((geometry,i)=><mesh key={i} geometry={geometry}>{cloth}</mesh>)}
    {/* Elliptical ribbed neckline, with an actual open neck cavity. */}
    <mesh position={[0,1.115,0]} rotation={[Math.PI/2,0,0]} scale={[1,.7,1]}>
      <torusGeometry args={[.233,kind==='tee'?.025:.035,8,48]}/>{cloth}
    </mesh>
    {[-1,1].map(side=><group key={side}>
      <Seam color={stitch} points={[[side*.24,1.1,.12],[side*.47,.99,.2],[side*.64,.83,.21],[side*.7,.58,.2]]}/>
      <Seam color={stitch} points={[[side*.59,.45,.12],[side*.6,-.1,.12],[side*.61,bottom+.06,.12]]}/>
      <mesh position={[side*(kind==='tee'?.96:1.1),kind==='tee'?.27:-.79,0]} rotation={[0,0,-side*.33]} scale={[1,1,kind==='tee'?1:.94]}>
        <cylinderGeometry args={[kind==='tee'?.192:.119,kind==='tee'?.19:.115,kind==='tee'?.035:.12,32,1,true]}/>{cloth}
      </mesh>
    </group>)}
    <mesh position={[0,bottom+.035,0]} scale={[1,1,.47]}>
      <cylinderGeometry args={[.618,.622,kind==='tee'?.035:.1,64,1,true]}/>{cloth}
    </mesh>
    {kind==='hoodie' && <>
      <mesh geometry={geometries.hood}>{cloth}</mesh>
      <Seam color={stitch} width={.009} points={[[-.36,1.02,.035],[-.3,1.4,.035],[0,1.68,.035],[.3,1.4,.035],[.36,1.02,.035]]}/>
      {[-1,1].map(side=><group key={side}>
        <Seam color="#d6d0bf" width={.012} points={[[side*.18,1.05,.19],[side*.17,.84,.31],[side*.2,.62,.32],[side*.19,.5,.33]]}/>
        <mesh position={[side*.19,.48,.33]}><cylinderGeometry args={[.016,.016,.055,8]}/><meshStandardMaterial color="#777b7c" metalness={.7} roughness={.35}/></mesh>
      </group>)}
      <mesh position={[0,-.44,.287]} scale={[.4,.19,.045]}>
        <sphereGeometry args={[1,32,16]}/><meshStandardMaterial color={color} bumpMap={fabric} bumpScale={.006} roughness={1}/>
      </mesh>
      <Seam color={stitch} points={[[-.4,-.58,.29],[-.36,-.37,.31],[-.27,-.26,.32],[.27,-.26,.32],[.36,-.37,.31],[.4,-.58,.29]]}/>
    </>}
    {kind==='coat' && <>
      <Seam color="#757b7f" width={.012} points={[[0,1.03,.17],[0,.73,.3],[0,-.2,.303],[0,bottom+.08,.29]]}/>
      {[-1,1].map(side=><group key={side}>
        <Seam color={stitch} width={.04} points={[[side*.23,1.1,.15],[side*.4,.9,.27],[side*.17,.48,.31],[side*.05,.78,.32]]}/>
        <Seam color="#4c5054" width={.018} points={[[side*.2,-.5,.3],[side*.43,-.65,.235]]}/>
      </group>)}
      <mesh position={[.025,.65,.325]}><boxGeometry args={[.035,.07,.025]}/><meshStandardMaterial color="#969c9f" metalness={.8} roughness={.3}/></mesh>
    </>}
  </group>
}
