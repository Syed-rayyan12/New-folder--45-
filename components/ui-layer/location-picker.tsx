'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Search, MapPin, Crosshair } from 'lucide-react'
import { LOCATIONS, type LocationId } from '@/lib/locations'

export function LocationPicker({ excludeId, onChoose }: { excludeId: LocationId | null; onChoose: (id: LocationId | 'custom') => void }) {
  const [open, setOpen] = useState(false), [query, setQuery] = useState(''), [active, setActive] = useState(0)
  const [position, setPosition] = useState({ left: 12, top: 12, width: 300, height: 360 })
  const trigger = useRef<HTMLButtonElement>(null), panel = useRef<HTMLDivElement>(null), input = useRef<HTMLInputElement>(null)
  const reduced = useReducedMotion()
  const options = LOCATIONS.filter(place => place.id !== excludeId && `${place.name} ${place.country} ${place.code}`.toLowerCase().includes(query.toLowerCase()))
  const close = () => { setOpen(false); trigger.current?.focus({ preventScroll: true }) }
  const choose = (id: LocationId | 'custom') => { close(); onChoose(id) }
  useLayoutEffect(() => {
    if (!open) return
    const align = () => {
      const rect = trigger.current?.getBoundingClientRect(); if (!rect) return
      const width = Math.min(Math.max(rect.width, 300), window.innerWidth - 24)
      const below = window.innerHeight - rect.bottom - 20, above = rect.top - 20
      const upwards = below < 290 && above > below
      const height = Math.min(360, Math.max(160, upwards ? above : below))
      setPosition({ left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)), top: upwards ? rect.top - height - 8 : rect.bottom + 8, width, height })
    }
    align(); input.current?.focus({ preventScroll: true })
    window.addEventListener('resize', align); window.addEventListener('scroll', align, true)
    return () => { window.removeEventListener('resize', align); window.removeEventListener('scroll', align, true) }
  }, [open])
  useEffect(() => {
    if (!open) return
    const outside = (event: Event) => { if (!panel.current?.contains(event.target as Node) && !trigger.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown', outside); document.addEventListener('focusin', outside)
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('focusin', outside) }
  }, [open])
  useEffect(() => { panel.current?.querySelector(`[data-option="${active}"]`)?.scrollIntoView({ block: 'nearest' }) }, [active])
  return <><button ref={trigger} id="journey-place" type="button" className="journey-place-input location-picker-trigger" aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? 'journey-place-list' : undefined} onClick={() => { setQuery(''); setActive(0); setOpen(!open) }}><span><MapPin size={15} />Choose a place</span><ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : undefined }} /></button>
    {typeof document !== 'undefined' && createPortal(<AnimatePresence>{open && <motion.div ref={panel} className="location-picker-panel" style={{ left: position.left, top: position.top, width: position.width, height: position.height }} initial={{ opacity: 0, y: 8, scale: .97, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, y: 5, scale: .98, filter: 'blur(3px)' }} transition={{ duration: reduced ? 0 : .25, ease: [.16, 1, .3, 1] }} onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); close() }
      if (event.key === 'Tab') close()
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) { event.preventDefault(); setActive(index => event.key === 'Home' ? 0 : event.key === 'End' ? options.length : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length + 1) % (options.length + 1)) }
      if (event.key === 'Enter') { event.preventDefault(); choose(options[active]?.id ?? 'custom') }
    }}><label className="location-picker-search"><Search size={15} /><input ref={input} role="combobox" aria-label="Search locations" aria-expanded="true" aria-autocomplete="list" aria-controls="journey-place-list" aria-activedescendant={`journey-option-${active}`} placeholder="Search city or country" value={query} onChange={event => { setQuery(event.target.value); setActive(0) }} /></label><div className="location-picker-list" id="journey-place-list" role="listbox" aria-label="Locations">
      {options.map((place, index) => <button type="button" role="option" tabIndex={-1} id={`journey-option-${index}`} data-option={index} aria-selected={active === index} key={place.id} onPointerMove={() => setActive(index)} onMouseDown={event => event.preventDefault()} onClick={() => choose(place.id)}><MapPin size={14} /><span><strong>{place.name}</strong><small>{place.country}</small></span><em>{place.code}</em></button>)}
      {!options.length && <p className="location-picker-empty">No matching city. Add its coordinates below.</p>}
      <button type="button" role="option" tabIndex={-1} id={`journey-option-${options.length}`} data-option={options.length} aria-selected={active === options.length} onPointerMove={() => setActive(options.length)} onMouseDown={event => event.preventDefault()} onClick={() => choose('custom')}><Crosshair size={15} /><span><strong>Your own coordinates</strong><small>Pin any place in the world</small></span></button>
    </div><div className="location-picker-footer">YOUR STORY STARTS SOMEWHERE</div></motion.div>}</AnimatePresence>, document.body)}
  </>
}
