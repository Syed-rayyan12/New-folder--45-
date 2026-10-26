'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, type FormEvent } from 'react'
import { ArrowRight, ArrowUpRight, Globe2, MapPin, Plus, RotateCcw, Sparkles } from 'lucide-react'
import { getLocation, LOCATIONS, type LocationId } from '@/lib/locations'
import { greatCircleKm } from '@/lib/geo'
import { useJourney } from '@/lib/store'
import { useEnvironment } from '@/lib/use-environment'
import { Statements } from './ui-layer/statements'
import { BrandIntro } from './ui-layer/brand-intro'
import { GarmentWorld } from './ui-layer/garment-world'
import { GalaxyPicker } from './ui-layer/galaxy-picker'
import { GalaxyBackdrop } from './ui-layer/galaxy-backdrop'

const SceneCanvas = dynamic(() => import('./canvas/scene-canvas'), { ssr: false })

function LocationField({ kind, title }: { kind: 'origin' | 'destination'; title: string }) {
  const value = useJourney((s) => s[kind])
  const other = useJourney((s) => kind === 'origin' ? s.destination : s.origin)
  const [custom, setCustom] = useState(false)
  const choose = (id: LocationId) => {
    useJourney.setState({ [kind]: id, stage: kind === 'origin' ? 'q1' : 'q2', hovered: null, ...(other === id ? { [kind === 'origin' ? 'destination' : 'origin']: null } : {}) })
  }
  const add = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const lat = Number(data.get('lat')), lng = Number(data.get('lng'))
    const name = String(data.get('name')).trim()
    if (!name || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return
    choose(`custom:${lat}:${lng}:${encodeURIComponent(name)}`)
    setCustom(false)
  }
  const location = value ? getLocation(value) : null
  return <div className="location-field">
    <label htmlFor={kind} className="field-label"><MapPin size={13} />{title}</label>
    <select id={kind} value={value ?? ''} onChange={(e) => e.target.value === 'custom' ? setCustom(true) : choose(e.target.value as LocationId)}>
      <option value="" disabled>Select a location</option>
      {LOCATIONS.map((place) => <option key={place.id} value={place.id}>{place.name}, {place.country}</option>)}
      {value?.startsWith('custom:') && <option value={value}>{location?.name}</option>}
      <option value="custom">+ Add any location with coordinates</option>
    </select>
    {location && <p className="coordinate-line">{Math.abs(location.lat).toFixed(4)}° {location.lat >= 0 ? 'N' : 'S'} / {Math.abs(location.lng).toFixed(4)}° {location.lng >= 0 ? 'E' : 'W'}</p>}
    <button className="custom-toggle" onClick={() => setCustom(!custom)} type="button"><Plus size={12} /> Add your own coordinates</button>
    {custom && <form onSubmit={add} className="coordinate-form">
      <input aria-label="Location name" name="name" placeholder="Location name" required maxLength={70} />
      <div className="coordinate-inputs"><input aria-label="Latitude" name="lat" type="number" step="any" min="-90" max="90" placeholder="Latitude" required /><input aria-label="Longitude" name="lng" type="number" step="any" min="-180" max="180" placeholder="Longitude" required /></div>
      <button className="small-action" type="submit">Use this location <ArrowUpRight size={14} /></button>
    </form>}
  </div>
}

export function Experience() {
  const [introComplete, setIntroComplete] = useState(false)
  const webgl = useEnvironment()
  const { stage, origin, destination, ready, setReady, setStage, restart } = useJourney()
  const emblemReady = useJourney(s => s.emblemReady)
  const reducedMotion = useJourney(s => s.reducedMotion)
  useEffect(() => { useJourney.getState().setLighting('night') }, [])
  const inWorld = stage === 'world'
  const transferring = stage === 'garment'
  const complete = Boolean(origin && destination)
  const revealed = stage === 'reveal' || stage === 'garment' || stage === 'world'
  const from = origin ? getLocation(origin) : null
  const to = destination ? getLocation(destination) : null
  useEffect(() => { if (webgl === false) setReady() }, [webgl, setReady])
  useEffect(() => {
    if (stage !== 'reveal' || !emblemReady) return
    const timer=window.setTimeout(()=>setStage('garment'),reducedMotion?300:1400)
    return ()=>window.clearTimeout(timer)
  }, [stage,emblemReady,reducedMotion,setStage])
  useEffect(() => {
    if(stage!=='garment')return
    const timer=window.setTimeout(()=>setStage('world'),reducedMotion?300:2200)
    return ()=>window.clearTimeout(timer)
  }, [stage,reducedMotion,setStage])
  return <main className="cosmic-experience" data-lighting="night">
    <BrandIntro ready={ready} onComplete={() => setIntroComplete(true)} />
    <div className={`experience-content${introComplete ? ' is-entered' : ''}${inWorld||transferring?' is-garment-world':''}`} inert={!introComplete} aria-hidden={!introComplete}>
    {webgl !== null && <GalaxyBackdrop />}
    <div className="cosmic-canvas">{webgl && <SceneCanvas />}</div>
    <div className="space-vignette" />
    {!inWorld && !transferring && <GalaxyPicker />}
    {!inWorld && !transferring && <>
    <div className="scene-heading"><Statements /></div>
    <div className="globe-caption"><Globe2 size={15} /><span>DRAG TO EXPLORE 360°</span><span className="caption-line" /><span>SCROLL TO ZOOM</span></div>
    <aside className="journey-panel">
      <div className="panel-top"><span className="eyebrow">A WORLD WITHIN YOU</span><Sparkles size={18} /></div>
      <div className="panel-emblem" aria-hidden="true">✳</div>
      <p className="panel-kicker">YOUR PERSONAL CONSTELLATION</p>
      <h2>{revealed ? 'Written in the stars.' : 'Every story starts somewhere.'}</h2>
      <p className="panel-description">Trace the places that shaped you. We’ll turn the connection into your own celestial emblem.</p>
      <div className="journey-fields"><span className="journey-track" /><LocationField kind="origin" title="Where do you come from?" /><LocationField kind="destination" title="Where are you currently?" /></div>
      {from && to && <div className="distance-readout"><span>{from.code} <ArrowRight size={12} /> {to.code}</span><span>{Math.round(greatCircleKm(from, to)).toLocaleString()} KM CONNECTED</span></div>}
      <button className="create-emblem" disabled={!complete || webgl === false} onClick={() => setStage(revealed ? 'q2' : 'reveal')}>{revealed ? 'Back to your world' : 'Reveal my emblem'}<ArrowUpRight size={19} /></button>
      {revealed && <button className="restart-journey" onClick={restart}><RotateCcw size={12} /> Begin another journey</button>}
      <p className="panel-footnote">UNIQUE TO YOUR COORDINATES. INFINITELY YOURS.</p>
    </aside>
    </>}
    {transferring && <div className="world-transition" role="status"><span>YOUR SIGNATURE. YOUR SILHOUETTE.</span><p>Entering the world of PRVLG</p></div>}
    {inWorld && <GarmentWorld />}
    {!ready && webgl !== false && <div className="scene-loading" role="status">Gathering your universe<span>•••</span></div>}
    {webgl === false && <p className="webgl-notice">3D preview is unavailable on this device. You can still choose your journey coordinates.</p>}
    {!inWorld && <footer className="cosmic-footer"><span>VISIBLE BY DAY. REVEALED BY NIGHT.</span><span>ORIGIN IS EVERYTHING. <ArrowUpRight size={12} /></span></footer>}
    </div>
  </main>
}
