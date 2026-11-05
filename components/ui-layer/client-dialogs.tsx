'use client'

import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react'
import { ArrowUpRight, ArrowRight, LocateFixed, MapPin, X } from 'lucide-react'
import { useJourney } from '@/lib/store'
import { getLocation } from '@/lib/locations'
import { getClientLocation } from '@/lib/client-location'
import { clientProfileSchema, type ClientProfile } from '@/lib/client-profile'

function useDialog(ref:RefObject<HTMLDialogElement|null>,open:boolean){
  useEffect(()=>{const dialog=ref.current;if(!dialog)return;if(open&&!dialog.open)dialog.showModal();else if(!open&&dialog.open)dialog.close()},[open,ref])
}

export function ClientDialogs({enabled}:{enabled:boolean}){
  const locationDialog=useRef<HTMLDialogElement>(null),profileDialog=useRef<HTMLDialogElement>(null)
  const [locationAsked,setLocationAsked]=useState(false),[locating,setLocating]=useState(false),[locationError,setLocationError]=useState('')
  const locationRequest=useRef(0)
  const [locationStatus,setLocationStatus]=useState('Finding your location...')
  const [errors,setErrors]=useState<Partial<Record<keyof ClientProfile,string>>>({})
  const {profileOpen,closeProfile,saveClientProfile,clientProfile,clientLocation,setClientLocation,origin,destination}=useJourney()
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
    setErrors({});saveClientProfile(result.data)
  }
  const location=clientProfile?.location||(destination?getLocation(destination).name:'')||(clientLocation?`${clientLocation.lat.toFixed(5)}, ${clientLocation.lng.toFixed(5)}`:'')
  const field=(name:keyof ClientProfile,label:string,type='text',autoComplete?:string,placeholder?:string)=><label className="client-form-field">{label}<input name={name} type={type} autoComplete={autoComplete} placeholder={placeholder} defaultValue={name==='location'?location:clientProfile?.[name]||''} required maxLength={name==='email'?254:name==='phone'?30:name==='location'?180:100} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name]?`client-error-${name}`:undefined}/>{errors[name]&&<span id={`client-error-${name}`} className="client-field-error" role="alert">{errors[name]}</span>}</label>
  return <>
    <dialog ref={locationDialog} className="client-dialog client-simple location-consent-dialog" aria-labelledby="location-consent-title" onCancel={dismissLocation}>
      <button type="button" className="client-dialog-close" aria-label="Skip current location" onClick={dismissLocation}><X size={17}/></button>
      <span className="client-simple-icon" aria-hidden="true"><MapPin size={21}/></span>
      <h2 id="location-consent-title">Use your current location?</h2>
      <p>Find your place on the map, or enter it yourself.</p>
      <button type="button" className="client-primary" disabled={locating} onClick={requestLocation}><LocateFixed size={15}/><span>{locating?locationStatus:locationError?'Try location again':'Use my location'}</span></button>
      <button type="button" className="client-secondary" onClick={dismissLocation}>Enter manually</button>
      {locationError&&<p className="client-field-error" role="alert">{locationError}</p>}
      <small>Your browser will ask for permission.</small>
    </dialog>
    <dialog ref={profileDialog} className="client-dialog client-simple client-profile-dialog" aria-labelledby="client-profile-title" onCancel={closeProfile}>
      <button type="button" className="client-dialog-close" aria-label="Close wishlist details" onClick={closeProfile}><X size={17}/></button>
      <span className="client-simple-kicker">PRVLG / WISHLIST</span>
      <h2 id="client-profile-title">Make it yours.</h2><p>Add your details before we create your emblem.</p>
      {origin&&destination&&<div className="client-simple-journey"><i/><span>{getLocation(origin).name}</span><ArrowRight size={12}/><span>{getLocation(destination).name}</span></div>}
      {profileOpen&&<form key={`${destination}-${profileOpen}`} onSubmit={submit} noValidate>
        <div className="client-name-row">{field('fullName','Full name','text','name','Your full name')}{field('lastName','Last name','text','family-name','Your last name')}</div>
        {field('email','Email address','email','email','you@example.com')}
        {field('phone','Phone number','tel','tel','+ Country code and number')}
        {field('location','Location','text','address-level2','City, country or coordinates')}
        <button type="submit" className="client-primary"><span>Continue to my emblem</span><ArrowUpRight size={17}/></button>
      </form>}
    </dialog>
  </>
}
