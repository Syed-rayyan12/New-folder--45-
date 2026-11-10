'use client'

import { useEffect, useRef, useState } from 'react'

export function MusicToggle() {
  const audio = useRef<HTMLAudioElement | null>(null)
  const mounted = useRef(true)
  const [playing, setPlaying] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; if(audio.current){audio.current.pause();audio.current.removeAttribute('src');audio.current.load();audio.current=null} } }, [])
  const toggle = async () => {
    if (pending) return
    setPending(true); setError('')
    try {
      if (!audio.current) {
        const track=new Audio('/images/bt.mpeg')
        track.loop=true;track.preload='none';track.volume=.45
        track.onerror=()=>{if(mounted.current){setPlaying(false);setPending(false);setError('Music could not load. Click to try again.')}}
        audio.current=track
      }
      if (playing) audio.current.pause()
      else await audio.current.play()
      if (mounted.current) setPlaying(!playing)
    } catch {
      audio.current?.pause(); audio.current = null
      if (mounted.current) { setPlaying(false); setError('Sound could not start. Click to try again.') }
    } finally { if (mounted.current) setPending(false) }
  }
  return <div className="music-control">
    <button type="button" className={`music-toggle${playing ? ' is-playing' : ''}`} onClick={toggle} disabled={pending} aria-label={playing ? 'Mute music' : 'Play music'} aria-pressed={playing} title={playing ? 'Mute music' : 'Play music'}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m11 5-6 4H2v6h3l6 4V5Z"/>{playing ? <><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></> : <path d="m16 9 5 6m0-6-5 6"/>}</svg>
      <span>MUSIC {playing ? 'ON' : 'OFF'}</span>
    </button>
    {error && <span className="music-error" role="status">{error}</span>}
  </div>
}
