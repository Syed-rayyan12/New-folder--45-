'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Mail } from 'lucide-react'
import { useJourney } from '@/lib/store'

export function WaitlistCard({onBack}:{onBack:()=>void}) {
  const profile=useJourney(s=>s.clientProfile)
  const [email,setEmail]=useState(profile?.email || '')
  const [submitted,setSubmitted]=useState(false)
  const heading=useRef<HTMLHeadingElement>(null)
  useEffect(()=>{heading.current?.focus()},[])
  return <section className="waitlist-screen" aria-label="PRVLG waitlist">
    <div className="waitlist-card">
      <span className="waitlist-icon" aria-hidden="true">{submitted?<Check size={28}/>:<Mail size={28}/>}</span>
      <p className="waitlist-eyebrow">PRVLG / THE NEXT CHAPTER</p>
      <h1 ref={heading} tabIndex={-1}>{submitted?'Thank you for joining the waitlist.':'Your story is just beginning.'}</h1>
      <p>{submitted?'Your emblem. Your connection. Your next chapter. We look forward to sharing what comes next.':'Keep your connection close. Leave your email to hear when the collection arrives.'}</p>
      {!submitted?<form onSubmit={event=>{event.preventDefault();setSubmitted(true)}}>
        <label htmlFor="waitlist-email">Email address</label>
        <input id="waitlist-email" type="email" autoComplete="email" required value={email} placeholder="you@example.com" onChange={event=>setEmail(event.target.value)}/>
        <button type="submit" className="journey-next">Join the waitlist <ArrowRight size={16}/></button>
        <small>Preview only — your email will not be saved or sent yet.</small>
      </form>:<div className="waitlist-confirmation" role="status"><Check size={16}/> Waitlist preview complete. Email delivery is coming soon.</div>}
      <button type="button" className="journey-text-action" onClick={onBack}><ArrowLeft size={14}/>Back to your mockup</button>
    </div>
  </section>
}
