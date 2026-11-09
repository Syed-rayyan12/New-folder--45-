'use client'
import { api } from './backend-api'
import { usesLocalBackend } from './backend-mode'
import { useJourney } from './store'
import { getLocation } from './locations'
import type { ClientProfile, ClientLocationSource } from './client-profile'

let starting:Promise<unknown>|null=null
let queue:Promise<unknown>=Promise.resolve()
const place=(id:Parameters<typeof getLocation>[0])=>{
  const p=getLocation(id)
  return {id:p.id,name:p.name,country:p.country,code:p.code,lat:p.lat,lng:p.lng}
}
export function startJourney() {
  if(!usesLocalBackend())return Promise.resolve(null)
  if(!starting){
    const params=new URLSearchParams(window.location.search)
    const referrer=document.referrer?new URL(document.referrer).hostname:''
    const source=params.get('utm_source') || (/instagram/i.test(referrer)?'Instagram':/tiktok/i.test(referrer)?'TikTok':/google/i.test(referrer)?'Google Search':referrer&&referrer!==window.location.hostname?'Referral':'Direct')
    starting=api('/journeys',{method:'POST',body:JSON.stringify({source:source.slice(0,100),campaign:(params.get('utm_campaign') || '').slice(0,150),landingPath:window.location.pathname.slice(0,500),device:/ipad|tablet/i.test(navigator.userAgent)?'Tablet':/mobile/i.test(navigator.userAgent)?'Mobile':'Desktop'})}).catch(error=>{starting=null;throw error})
  }
  return starting
}
export function syncJourney() {
  if(!usesLocalBackend())return Promise.resolve(null)
  const s=useJourney.getState()
  const snapshot={origin:s.origin?place(s.origin):null,destination:s.destination?place(s.destination):null,stage:s.stage,mockupId:s.mockupId,mockupColor:s.mockupColor,...(s.emblemGeneration&&s.clientProfile&&s.origin&&s.destination?{mark:{seed:s.emblemSeed,generation:s.emblemGeneration}}:{})}
  queue=queue.catch(()=>{}).then(async()=>{await startJourney();return api('/journeys/current',{method:'PUT',body:JSON.stringify(snapshot)})})
  return queue
}
export async function submitJourneyProfile(profile:ClientProfile,locationSource:ClientLocationSource,consent:boolean) {
  if(!usesLocalBackend())return {preview:true}
  await syncJourney()
  return api('/journeys/current/profile',{method:'POST',body:JSON.stringify({...profile,locationSource,consent})})
}
