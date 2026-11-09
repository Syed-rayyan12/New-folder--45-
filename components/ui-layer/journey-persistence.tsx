'use client'
import { useEffect } from 'react'
import { startJourney, syncJourney } from '@/lib/journey-api'
import { useJourney } from '@/lib/store'
import { usesLocalBackend } from '@/lib/backend-mode'

export function JourneyPersistence() {
  useEffect(()=>{
    if(!usesLocalBackend())return
    let timer:ReturnType<typeof setTimeout>
    void startJourney().catch(()=>{})
    const unsubscribe=useJourney.subscribe((s,previous)=>{
      if(s.origin===previous.origin&&s.destination===previous.destination&&s.stage===previous.stage&&s.mockupId===previous.mockupId&&s.mockupColor===previous.mockupColor&&s.emblemGeneration===previous.emblemGeneration)return
      clearTimeout(timer)
      timer=setTimeout(()=>{void syncJourney().catch(()=>{})},350)
    })
    return ()=>{unsubscribe();clearTimeout(timer)}
  },[])
  return null
}
