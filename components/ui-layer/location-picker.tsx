'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, ChevronRight, ArrowLeft, Search, MapPin, Crosshair } from 'lucide-react'
import { type Location, type LocationId } from '@/lib/locations'

type Country = { name: string; iso2: string; code: string; lat: number; lng: number; cities: number }
type City = [name: string, lat: number, lng: number, region: string]
const cityCache = new Map<string, City[]>()
const placeId = (name: string, country: Country, lat: number, lng: number): LocationId => `place:${lat}:${lng}:${encodeURIComponent(name)}:${encodeURIComponent(country.name)}:${country.code}`

export function LocationPicker({ excludeId, onChoose }: { excludeId: LocationId | null; onChoose: (id: LocationId | 'custom') => void }) {
  const [open, setOpen] = useState(false), [query, setQuery] = useState(''), [active, setActive] = useState(0)
  const [position, setPosition] = useState({ left: 12, top: 12, width: 300, height: 360 })
  const trigger = useRef<HTMLButtonElement>(null), panel = useRef<HTMLDivElement>(null), input = useRef<HTMLInputElement>(null)
  const reduced = useReducedMotion()
  const [countries, setCountries] = useState<Country[]>([])
  const [countryCode, setCountryCode] = useState('')
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [retry, setRetry] = useState(0)
  const [limit, setLimit] = useState(150)
  useEffect(() => { setLimit(150) }, [query, countryCode])
  const country = countries.find(c => c.iso2 === countryCode)
  useEffect(() => {
    if (!open || countries.length) return
    const controller = new AbortController()
    setLoading(true); setLoadError('')
    fetch('/locations/countries.json', { signal: controller.signal }).then(r => { if (!r.ok) throw new Error(); return r.json() }).then(setCountries).catch(() => { if (!controller.signal.aborted) setLoadError('Countries could not load. Please retry.') }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [open, countries.length, retry])
  useEffect(() => {
    if (!countryCode || !open) return
    if (cityCache.has(countryCode)) { setCities(cityCache.get(countryCode)!); setLoading(false); setLoadError(''); return }
    const controller = new AbortController()
    setCities([]); setLoading(true); setLoadError('')
    fetch(`/locations/cities/${countryCode}.json`, { signal: controller.signal }).then(r => { if (!r.ok) throw new Error(); return r.json() }).then((rows: City[]) => { cityCache.set(countryCode, rows); setCities(rows) }).catch(() => { if (!controller.signal.aborted) setLoadError('Cities could not load. Please retry.') }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [countryCode, open, retry])
  const allPlaces: Location[] = country ? [
    ...cities.map(([name,lat,lng,region]) => ({ id: placeId(name, country, lat, lng), name, country: [region,country.name].filter(Boolean).join(', '), code: country.code, lat, lng, statement: 'A place in your story.' })),
  ] : countries.length ? countries.map(c => ({ id: placeId(c.name,c,c.lat,c.lng), name:c.name, country:'Choose a country to explore its cities', code:c.code, lat:c.lat, lng:c.lng, statement:'A place in your story.' })) : []
  const matches = allPlaces.filter(place => (!country || place.id !== excludeId) && `${place.name} ${place.country} ${place.code}`.toLowerCase().includes(query.toLowerCase()))
  const options = matches.slice(0, limit)
  const close = () => { setOpen(false); trigger.current?.focus({ preventScroll: true }) }
  const choose = (id: LocationId | 'custom') => { close(); onChoose(id) }
  const selectOption = (index: number) => {
    if (!options[index]) return
    if (!country && countries.length && options[index]) {
      const selected = countries.find(c => c.code === options[index].code)
      if (selected) { setCities([]); setCountryCode(selected.iso2); setQuery(''); setActive(0); input.current?.focus({ preventScroll: true }) }
    } else choose(options[index].id)
  }
  useLayoutEffect(() => {
    if (!open) return
    const align = () => {
      const rect = trigger.current?.getBoundingClientRect(); if (!rect) return
      const width = Math.min(Math.max(rect.width, 360), window.innerWidth - 24)
      const viewport = window.visualViewport
      const visibleTop = viewport?.offsetTop ?? 0
      const visibleHeight = viewport?.height ?? window.innerHeight
      const visibleBottom = visibleTop + visibleHeight
      const below = visibleBottom - rect.bottom - 20, above = rect.top - visibleTop - 20
      const upwards = below < 290 && above > below
      const available = upwards ? above : below
      const height = Math.min(520, available < 380 ? visibleHeight - 24 : available)
      setPosition({ left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)), top: available < 380 ? Math.max(visibleTop + 12, visibleTop + (visibleHeight - height) / 2) : upwards ? rect.top - height - 8 : rect.bottom + 8, width, height })
    }
    align(); input.current?.focus({ preventScroll: true })
    window.addEventListener('resize', align); window.addEventListener('scroll', align, true); window.visualViewport?.addEventListener('resize', align); window.visualViewport?.addEventListener('scroll', align)
    return () => { window.removeEventListener('resize', align); window.removeEventListener('scroll', align, true); window.visualViewport?.removeEventListener('resize', align); window.visualViewport?.removeEventListener('scroll', align) }
  }, [open])
  useEffect(() => {
    if (!open) return
    const outside = (event: Event) => { if (!panel.current?.contains(event.target as Node) && !trigger.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown', outside); document.addEventListener('focusin', outside)
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('focusin', outside) }
  }, [open])
  useEffect(() => { panel.current?.querySelector(`[data-option="${active}"]`)?.scrollIntoView({ block: 'nearest' }) }, [active])
  return <><button ref={trigger} id="journey-place" type="button" className="journey-place-input location-picker-trigger" aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? 'journey-place-list' : undefined} onClick={() => { setQuery(''); setActive(0); setCountryCode(''); setCities([]); setLoadError(''); setOpen(!open) }}><span><MapPin size={15} />Choose a place</span><ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : undefined }} /></button>
    {typeof document !== 'undefined' && createPortal(<AnimatePresence>{open && <motion.div ref={panel} className="location-picker-panel" style={{ left: position.left, top: position.top, width: position.width, height: position.height }} initial={{ opacity: 0, y: 8, scale: .97, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, y: 5, scale: .98, filter: 'blur(3px)' }} transition={{ duration: reduced ? 0 : .25, ease: [.16, 1, .3, 1] }} onKeyDown={event => {
      if (event.key !== 'Escape' && event.target !== input.current) return
      if (event.key === 'Escape') { event.preventDefault(); close() }
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) { event.preventDefault(); setActive(index => event.key === 'Home' ? 0 : event.key === 'End' ? Math.max(0, options.length - 1) : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % Math.max(1, options.length)) }
      if (event.key === 'Enter' && event.target === input.current) { event.preventDefault(); selectOption(active) }
    }}>
      <div className="place-picker-heading">{country ? <button type="button" className="place-picker-back" onClick={() => { setCountryCode(''); setCities([]); setQuery(''); setActive(0); input.current?.focus() }}><ArrowLeft size={15}/>All countries</button> : <span>CHOOSE YOUR LOCATION</span>}<small>{country ? '02 / CITY OR COUNTRY' : '01 / COUNTRY'}</small></div>
      {country && <div className="place-country-card"><div><strong>{country.name}</strong><small>Use the country point, or choose a city below.</small></div><button type="button" disabled={placeId(country.name, country, country.lat, country.lng) === excludeId} onClick={() => choose(placeId(country.name, country, country.lat, country.lng))}><MapPin size={14}/>Use this country</button></div>}
      <label className="location-picker-search"><Search size={15} /><input ref={input} role="combobox" aria-label="Search locations" aria-expanded="true" aria-autocomplete="list" aria-controls="journey-place-list" aria-activedescendant={`journey-option-${active}`} placeholder={country ? 'Search cities in ' + country.name : 'Search countries'} value={query} onChange={event => { setQuery(event.target.value); setActive(0) }} /></label><div className="place-picker-section-label">{country ? 'CITIES' : 'COUNTRIES'}<span>{matches.length.toLocaleString()} results</span></div><div className="location-picker-list" onScroll={event => { const el = event.currentTarget; if (el.scrollHeight - el.scrollTop - el.clientHeight < 120) setLimit(n => n + 150) }} id="journey-place-list" role="listbox" aria-label="Locations">
      {options.map((place, index) => country ? <button type="button" role="option" tabIndex={-1} id={`journey-option-${index}`} data-option={index} aria-selected={active === index} key={place.id + index} onPointerMove={() => setActive(index)} onMouseDown={event => event.preventDefault()} onClick={() => selectOption(index)}><MapPin size={14}/><span><strong>{place.name}</strong><small>{place.country}</small></span><em>SELECT</em></button> : <div className="place-country-row" key={place.id}>
        <button type="button" role="option" tabIndex={-1} id={`journey-option-${index}`} data-option={index} aria-selected={active === index} onPointerMove={() => setActive(index)} onMouseDown={event => event.preventDefault()} onClick={() => selectOption(index)}><span className="place-country-code">{place.code}</span><span><strong>{place.name}</strong><small>Explore cities</small></span><ChevronRight size={15}/></button>
        <button type="button" className="place-country-pin" disabled={place.id === excludeId} aria-label={'Use ' + place.name + ' as a country point'} title="Use country point" onClick={() => choose(place.id)}><MapPin size={14}/><span>Use country</span></button>
      </div>)}
      {loading && <p className="location-picker-empty" role="status">Loading locations...</p>}
      {loadError && <p className="location-picker-empty" role="alert">{loadError} <button type="button" onClick={() => setRetry(n => n + 1)}>Retry</button></p>}
      {!loading && !loadError && !options.length && <p className="location-picker-empty">{country && !cities.length ? 'No cities listed. Use the country point above or enter coordinates.' : 'No matching locations. Try another spelling.'}</p>}
    </div><button type="button" className="place-custom-action" onClick={() => choose('custom')}><Crosshair size={14}/>Enter exact coordinates<ChevronRight size={14}/></button>
    <div className="location-picker-footer"><span>{country ? cities.length.toLocaleString() + ' CITIES / ' + country.name.toUpperCase() : (countries.length || 250) + ' COUNTRIES & TERRITORIES'}</span><a href="/locations/README.md" target="_blank" rel="noreferrer" aria-label="Location data source and license">DATA / ODbL</a></div></motion.div>}</AnimatePresence>, document.body)}
  </>
}
