'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react'
import { getLocation, LOCATIONS, type LocationId } from '@/lib/locations'
import { greatCircleKm } from '@/lib/geo'
import { useJourney } from '@/lib/store'

function JourneyPrompt({ canReveal, onHide }: { canReveal: boolean; onHide: () => void }) {
  const { journeyStep: step, origin, destination, selectLocation, editJourney, restart, requestEmblem, clientLocation, reducedMotion } = useJourney()
  const [custom, setCustom] = useState(false)
  const [error, setError] = useState('')
  const heading = useRef<HTMLHeadingElement>(null)
  const from = origin ? getLocation(origin) : null
  const to = destination ? getLocation(destination) : null
  const asking = step === 'origin' || step === 'destination'
  const first = step === 'origin'
  const connected = step === 'connected'
  const number = first ? '01' : connected ? '03' : '02'
  useEffect(() => { heading.current?.focus({ preventScroll: true }) }, [])
  const choose = (id: LocationId) => {
    if (step === 'destination' && id === origin) { setError('Choose a different place to continue your journey.'); return }
    selectLocation(id)
  }
  const add = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const lat = Number(data.get('lat')), lng = Number(data.get('lng'))
    if (!name || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) { setError('Enter a name and valid latitude and longitude.'); return }
    if (step === 'destination' && from && Math.abs(lat - from.lat) < 1e-8 && Math.abs(lng - from.lng) < 1e-8) { setError('Choose coordinates different from your first location.'); return }
    choose(`custom:${lat}:${lng}:${encodeURIComponent(name)}`)
  }
  const coordinate = (location: NonNullable<typeof from>) => `${Math.abs(location.lat).toFixed(4)}° ${location.lat >= 0 ? 'N' : 'S'} / ${Math.abs(location.lng).toFixed(4)}° ${location.lng >= 0 ? 'E' : 'W'}`
  return <motion.section className={`journey-prompt ${asking ? 'is-question' : 'is-statement'}${connected ? ' is-connected' : ''}`}
    aria-labelledby="journey-question" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: reducedMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}>
    <div className="journey-prompt-top"><span>{number} / 03 <i />{first ? 'YOUR BEGINNING' : connected ? 'YOUR CONNECTION' : 'YOUR NOW'}</span><button type="button" onClick={onHide} aria-label="Hide question and explore the map"><X size={15} /></button></div>
    {asking ? <>
      <h1 id="journey-question" ref={heading} tabIndex={-1}>{first ? 'Where does your story begin?' : 'Where are you now?'}</h1>
      <p className="journey-prompt-description">{first ? 'Choose the place you carry with you.' : `From ${from?.name ?? 'your beginning'}, to a new chapter.`}</p>
      {!first && from && <p className="journey-coordinate-readout journey-first-coordinate">{coordinate(from)}</p>}
      {!custom && <><label className="journey-input-label" htmlFor="journey-place">{first ? 'Your first location' : 'Your second location'}</label><select id="journey-place" className="journey-place-input" value="" onChange={e => e.target.value === 'custom' ? setCustom(true) : choose(e.target.value as LocationId)}>
        <option value="" disabled>Choose a place</option>{LOCATIONS.map(location => <option key={location.id} value={location.id} disabled={!first && location.id === origin}>{location.name}, {location.country}</option>)}<option value="custom">Add your own coordinates</option>
      </select><button type="button" className="journey-text-action" onClick={() => setCustom(true)}>Or enter exact coordinates <ArrowUpRight size={12} /></button></>}
      {custom && <form className="journey-coordinate-form" onSubmit={add}>
        <label>Location name<input name="name" placeholder="Name your place" required maxLength={70} autoFocus /></label>
        <div><label>Latitude<input name="lat" type="number" step="any" min="-90" max="90" placeholder="−90 to 90" required /></label><label>Longitude<input name="lng" type="number" step="any" min="-180" max="180" placeholder="−180 to 180" required /></label></div>
        <div className="journey-actions"><button type="submit" className="journey-next">Use this place <ArrowRight size={15} /></button><button type="button" className="journey-text-action" onClick={() => { setCustom(false); setError('') }}>Choose from the map</button></div>
      </form>}
      {!first&&clientLocation&&<button type="button" className="journey-text-action" onClick={()=>choose(`custom:${clientLocation.lat}:${clientLocation.lng}:Current%20location`)}>Use my current location <ArrowUpRight size={12}/></button>}
      <p className="journey-map-hint">You can also select a dot on the map.</p>
      {error && <p className="journey-error" role="alert">{error}</p>}
      {!first && <button type="button" className="journey-text-action" onClick={() => editJourney('origin')}><ArrowLeft size={12} /> Change your beginning</button>}
    </> : <>
      <h2 id="journey-question" ref={heading} tabIndex={-1} className="journey-statement-title">Your connected story.</h2>
      <div className="journey-place-statements">{[from,to].filter((place):place is NonNullable<typeof from>=>Boolean(place)).map((place,index)=><article key={place.id}><h3>{index===0?'FROM':'NOW IN'} / {place.name}</h3><p className="journey-coordinate-readout">{coordinate(place)}</p></article>)}</div>
      <p className="journey-map-hint">Hover over a coordinate point to read its story.</p>
      {connected && from && to && <p className="journey-distance">{Math.round(greatCircleKm(from,to)).toLocaleString()} KM CONNECTED</p>}
      <div className="journey-actions">
        <button type="button" className="journey-next" disabled={!canReveal} onClick={requestEmblem}>Reveal sacred emblem <ArrowUpRight size={16} /></button>
        <button type="button" className="journey-text-action" onClick={() => editJourney('origin')}>Edit first location</button>
        <button type="button" className="journey-text-action" onClick={() => editJourney('destination')}>Edit second location</button>
        <button type="button" className="journey-text-action" onClick={restart}>Start a new journey</button>
      </div>
    </>}
  </motion.section>
}

export function GuidedJourney({ canReveal }: { canReveal: boolean }) {
  const step = useJourney(s => s.journeyStep)
  const origin = useJourney(s => s.origin)
  const destination = useJourney(s => s.destination)
  const [hidden, setHidden] = useState(false)
  useEffect(() => { setHidden(false) }, [step, origin, destination])
  return <><AnimatePresence mode="wait">{!hidden && <JourneyPrompt key={`${step}-${origin}-${destination}`} canReveal={canReveal} onHide={() => setHidden(true)} />}</AnimatePresence>
    {hidden && <button type="button" className="journey-resume" onClick={() => setHidden(false)}>{step === 'connected' ? 'Your connected story' : 'Continue your story'} <ArrowRight size={14} /></button>}
  </>
}
