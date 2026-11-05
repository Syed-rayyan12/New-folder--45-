'use client'
import type { Ref } from 'react'
import { BRAND_LOGO_PATHS } from '@/lib/brand-logo'
import { logoNoiseFrame } from '@/lib/logo-particles'

/** Reuse one grain bitmap so animation never regenerates the turbulence field. */
export function LogoNoiseArtwork({frame=logoNoiseFrame(0),maskId='brand-grain',artworkRef,texture}:{frame?:ReturnType<typeof logoNoiseFrame>;maskId?:string;artworkRef?:Ref<SVGSVGElement>;texture?:string}) {
  const filterId=`${maskId}-texture`
  const sheenId=`${maskId}-sheen`
  return <svg ref={artworkRef} viewBox="0 0 330 194" className="brand-logo-grain" aria-hidden="true">
    <defs>
      <filter id={filterId} x="0" y="0" width="330" height="194" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        {texture?<feImage href={texture} x="0" y="0" width="330" height="194" preserveAspectRatio="none"/>:<feTurbulence type="fractalNoise" baseFrequency="0.48 0.62" numOctaves="2" seed="12" stitchTiles="stitch"/>}
        <feColorMatrix type="saturate" values="0"/>
        <feOffset data-noise-drift="true" dx="0" dy="0"/>
        <feComponentTransfer>
          <feFuncR data-noise-channel="true" type="linear" slope="42" intercept={-frame.threshold*42}/>
          <feFuncG data-noise-channel="true" type="linear" slope="42" intercept={-frame.threshold*42}/>
          <feFuncB data-noise-channel="true" type="linear" slope="42" intercept={-frame.threshold*42}/>
          <feFuncA type="linear" slope="0" intercept="1"/>
        </feComponentTransfer>
      </filter>
      <mask id={maskId} x="0" y="0" width="330" height="194" maskUnits="userSpaceOnUse" style={{maskType:'luminance'}}><rect width="330" height="194" filter={`url(#${filterId})`}/></mask>
      <linearGradient id={sheenId} data-noise-sheen-gradient="true" x1="0" y1="-35" x2="0" y2="35" gradientUnits="userSpaceOnUse" gradientTransform="translate(0,-80)"><stop offset="0" stopColor="white" stopOpacity="0"/><stop offset="0.5" stopColor="white" stopOpacity="1"/><stop offset="1" stopColor="white" stopOpacity="0"/></linearGradient>
    </defs>
    <g fill="black" fillRule="evenodd">{BRAND_LOGO_PATHS.map((d,i)=><path key={i} d={d}/>)}</g>
    <g data-noise-fill="true" fill="white" fillRule="evenodd" mask={`url(#${maskId})`} opacity={frame.opacity}>{BRAND_LOGO_PATHS.map((d,i)=><path key={i} d={d}/>)}</g>
    <g data-noise-sheen="true" fill={`url(#${sheenId})`} fillRule="evenodd" mask={`url(#${maskId})`} opacity="0">{BRAND_LOGO_PATHS.map((d,i)=><path key={i} d={d}/>)}</g>
    <g data-noise-outline="true" fill="none" stroke="white" strokeWidth="0.08" opacity={frame.opacity*.08}>{BRAND_LOGO_PATHS.map((d,i)=><path key={i} d={d}/>)}</g>
  </svg>
}

