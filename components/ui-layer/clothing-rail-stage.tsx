"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_MOCKUPS } from "@/lib/mockups";
import { ArrowRight } from "lucide-react";
import ClothingRailHero from "@/components/ui/product-rail-gallery";
import { RAIL_DEMO_ITEMS } from "@/components/ui/demo";
import { useJourney } from "@/lib/store";

/** The collection interlude: completed emblem → interactive rail → mockups. */
export function ClothingRailStage() {
  useEffect(()=>{let cancelled=false;void import('./mockup-3d-viewer').then(module=>{if(!cancelled)module.preloadMockups(DEFAULT_MOCKUPS)});return()=>{cancelled=true}},[]);
  const setStage=useJourney(s=>s.setStage);
  const reduced=useJourney(s=>s.reducedMotion);
  const host=useRef<HTMLDivElement>(null);
  const [leaving,setLeaving]=useState(false);
  const finish=useCallback(()=>setLeaving(true),[]);
  useEffect(()=>{host.current?.focus({preventScroll:true})},[]);
  useEffect(()=>{
    if(!leaving)return;
    const timer=window.setTimeout(()=>setStage('world'),reduced?0:450);
    return()=>window.clearTimeout(timer);
  },[leaving,reduced,setStage]);
  return <div ref={host} className={`clothing-rail-screen${leaving?' is-leaving':''}`} tabIndex={-1} aria-label="Explore the clothing rail" aria-busy={leaving} inert={leaving}>
    <ClothingRailHero
      items={RAIL_DEMO_ITEMS}
      hanger="none"
      eyebrow="YOUR EMBLEM IS READY · EXPLORE THE COLLECTION"
      heading="Find the piece that carries your story."
      caption="Brush along the rail, slide a hanger, lift a piece to see the back."
      autoplay={!reduced}
      onComplete={finish}
      action={<button type="button" className="journey-next rail-continue" onClick={finish}>Continue to your mockup <ArrowRight aria-hidden="true" size={16}/></button>}
    />
  </div>;
}
