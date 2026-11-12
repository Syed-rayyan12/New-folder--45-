'use client'

import { useEffect, useRef, useState } from 'react'

export function MusicToggle({ enabled = false }: { enabled?: boolean }) {
  const audio = useRef<HTMLAudioElement | null>(null)
  const stopped = useRef(false)
  const [off, setOff] = useState(false)
  useEffect(() => {
    if (!enabled) return
    stopped.current = false
    const track = new Audio('/images/bt.mpeg')
    track.loop = true
    track.preload = 'auto'
    track.volume = .45
    audio.current = track
    // Retry on a gesture when the browser blocks audible autoplay.
    const start = () => {
      if (stopped.current || !track.paused) return
      void track.play().catch(() => {})
    }
    start()
    document.addEventListener('pointerdown', start)
    document.addEventListener('keydown', start)
    return () => {
      document.removeEventListener('pointerdown', start)
      document.removeEventListener('keydown', start)
      track.pause()
      track.removeAttribute('src')
      track.load()
      audio.current = null
    }
  }, [enabled])
  const turnOff = () => {
    stopped.current = true
    audio.current?.pause()
    setOff(true)
  }
  if (!enabled) return null
  return <div className="music-control"><button type="button" className={`music-toggle${off ? '' : ' is-playing'}`} onClick={turnOff} disabled={off} aria-label={off ? 'Sound off' : 'Turn off sound'} title={off ? 'Sound off' : 'Turn off sound'}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m11 5-6 4H2v6h3l6 4V5Z"/>{off ? <path d="m16 9 5 6m0-6-5 6"/> : <><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></>}</svg>
    <span>{off ? 'SOUND OFF' : 'TURN OFF SOUND'}</span>
  </button></div>
}
