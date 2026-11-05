'use client'

import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react'
import { useJourney } from '@/lib/store'
import { getClientLocation } from '@/lib/client-location'
import { clientProfileSchema,wishlistLocationValue, type ClientProfile } from '@/lib/client-profile'

// Keep dialog icons local so the popup never depends on an optimized icon export.
function DialogIcon({ name, size = 17 }: { name: 'close' | 'location' | 'arrow'; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === 'close' ? <path d="m18 6-12 12M6 6l12 12" /> : name === 'arrow' ? <path d="M7 17 17 7M7 7h10v10" /> : <><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="3" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3" /></>}
  </svg>
}

function useDialog(ref:RefObject<HTMLDialogElement|null>,open:boolean){
  useEffect(()=>{const dialog=ref.current;if(!dialog)return;if(open&&!dialog.open)dialog.showModal();else if(!open&&dialog.open)dialog.close()},[open,ref])
}

export function ClientDialogs({enabled}:{enabled:boolean}){
  const locationDialog=useRef<HTMLDialogElement>(null),profileDialog=useRef<HTMLDialogElement>(null)
  const [locationAsked,setLocationAsked]=useState(false),[locating,setLocating]=useState(false),[locationError,setLocationError]=useState('')
  const locationRequest=useRef(0)
  const [locationStatus,setLocationStatus]=useState('Finding your location...')
  const [errors,setErrors]=useState<Partial<Record<keyof ClientProfile,string>>>({})
  const {profileOpen,closeProfile,saveClientProfile,clientProfile,profileLocationSource,clientLocation,setClientLocation}=useJourney()
  const locationOpen=enabled&&!locationAsked
  useDialog(locationDialog,locationOpen)
  useDialog(profileDialog,enabled&&profileOpen&&!locationOpen)
  const dismissLocation=()=>{locationRequest.current++;setLocating(false);setLocationAsked(true)}
  useEffect(()=>()=>{locationRequest.current++},[])
  const requestLocation=async()=>{
    const request=++locationRequest.current
    setLocating(true);setLocationError('');setLocationStatus('Finding your location...')
    try{const coordinates=await getClientLocation(navigator.geolocation,window.isSecureContext,()=>{if(request===locationRequest.current)setLocationStatus('Trying again...')});if(request!==locationRequest.current)return;setClientLocation(coordinates);setLocationAsked(true)}catch(error){if(request===locationRequest.current)setLocationError(error instanceof Error?error.message:'Location detection failed. Please try again.')}finally{if(request===locationRequest.current)setLocating(false)}
  }
  const submit=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();const result=clientProfileSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)))
    if(!result.success){const next:typeof errors={};for(const issue of result.error.issues){const field=issue.path[0] as keyof ClientProfile;if(!next[field])next[field]=issue.message}setErrors(next);const first=event.currentTarget.elements.namedItem(String(result.error.issues[0]?.path[0]));if(first instanceof HTMLInputElement)first.focus();return}
    const source=clientLocation&&result.data.location===wishlistLocationValue(clientLocation)?'geolocation':'manual'
    setErrors({});saveClientProfile(result.data,source)
  }
  const location=wishlistLocationValue(clientLocation,profileLocationSource==='manual'?clientProfile?.location||'':'')
  const field=(name:keyof ClientProfile,label:string,type='text',autoComplete?:string,placeholder?:string)=><label className="client-form-field">{label}<input name={name} type={type} autoComplete={autoComplete} placeholder={placeholder} defaultValue={name==='location'?location:clientProfile?.[name]||''} required maxLength={name==='email'?254:name==='phone'?30:name==='location'?180:100} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name]?`client-error-${name}`:undefined}/>{errors[name]&&<span id={`client-error-${name}`} className="client-field-error" role="alert">{errors[name]}</span>}</label>
  return <>
    <dialog ref={locationDialog} className="client-dialog client-simple location-consent-dialog" aria-labelledby="location-consent-title" aria-busy={locating} onCancel={dismissLocation}>
      <button type="button" className="client-dialog-close" aria-label="Skip current location" onClick={dismissLocation}><DialogIcon name="close"/></button>
      <span className="client-simple-icon" aria-hidden="true"><DialogIcon name="location" size={21}/></span>
      <h2 id="location-consent-title">Use your current location?</h2>
      <p>Find your place on the map, or enter it yourself.</p>
      <button type="button" className="client-primary" disabled={locating} onClick={requestLocation}><DialogIcon name="location" size={15}/><span>{locating?locationStatus:locationError?'Try location again':'Use my location'}</span></button>
      <button type="button" className="client-secondary" onClick={dismissLocation}>Enter manually</button>
      {locationError&&<p className="client-field-error" role="alert">{locationError}</p>}
      <small>Your browser will ask for permission.</small>
    </dialog>
    <dialog ref={profileDialog} className="client-dialog client-simple client-profile-dialog" aria-labelledby="client-profile-title" onCancel={closeProfile}>
      <button type="button" className="client-dialog-close" aria-label="Close wishlist details" onClick={closeProfile}><DialogIcon name="close"/></button>
      <span className="client-simple-kicker">PRVLG / WISHLIST</span>
      <h2 id="client-profile-title">Make it yours.</h2><p>Add your details before we create your emblem.</p>
      {profileOpen&&<form onSubmit={submit} noValidate>
        <div className="client-name-row">{field('fullName','Full name','text','name','Your full name')}{field('lastName','Last name','text','family-name','Your last name')}</div>
        {field('email','Email address','email','email','you@example.com')}
        {field('phone','Phone number','tel','tel','+ Country code and number')}
        {field('location','Your current location','text','address-level2','City, country or coordinates')}
        <button type="submit" className="client-primary"><span>Continue to my emblem</span><DialogIcon name="arrow"/></button>
      </form>}
    </dialog>
  </>
}

export default ClientDialogs
