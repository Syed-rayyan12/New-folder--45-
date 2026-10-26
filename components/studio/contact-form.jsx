'use client'

import { useRef, useState } from 'react'
import { ArrowUpRight, Check, LoaderCircle } from 'lucide-react'
import { contactSchema } from '@/lib/studio/contact-schema'

export function ContactForm() {
  const [errors,setErrors]=useState({})
  const [status,setStatus]=useState('idle')
  const [message,setMessage]=useState('')
  const pending=useRef(false)
  const formRef=useRef(null)
  async function submit(event) {
    event.preventDefault()
    if(pending.current)return
    const data=new FormData(event.currentTarget)
    const payload=Object.fromEntries(data.entries());payload.consent=data.get('consent')==='on'
    const parsed=contactSchema.safeParse(payload)
    if(!parsed.success){setErrors(parsed.error.flatten().fieldErrors);setMessage('Please check the highlighted fields.');setStatus('error');const key=parsed.error.issues[0]?.path[0];formRef.current?.elements.namedItem(key)?.focus();return}
    pending.current=true;setStatus('sending');setErrors({});setMessage('')
    try {
      const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(parsed.data)})
      const result=await response.json()
      if(!response.ok){setErrors(result.fields||{});throw new Error(result.error||'Something went wrong. Please try again.')}
      setStatus('success');setMessage('Your enquiry is on its way. We look forward to hearing more about your project.');formRef.current?.reset()
    } catch(error){setStatus('error');setMessage(error.message||'Could not connect. Please try again.')} finally{pending.current=false}
  }
  const fieldError=name=>errors[name]&&<span id={`${name}-error`} className="field-error">{errors[name][0]}</span>
  const props=name=>({'aria-invalid':!!errors[name],'aria-describedby':errors[name]?`${name}-error`:undefined})
  return <form className="contact-form" ref={formRef} onSubmit={submit} noValidate>
    <div className="form-row"><label>Your name <span>*</span><input name="name" autoComplete="name" placeholder="Alex Morgan" required maxLength={100} {...props('name')}/>{fieldError('name')}</label><label>Email address <span>*</span><input name="email" type="email" autoComplete="email" placeholder="alex@company.com" required maxLength={254} {...props('email')}/>{fieldError('email')}</label></div>
    <label>Company / business<input name="company" autoComplete="organization" placeholder="Your business name" maxLength={150}/></label>
    <div className="form-row"><label>What are you looking for?<select name="service" defaultValue="Website design & development">{['Website design & development','E-commerce website','Pro system','Branding','Not sure yet'].map(v=><option key={v}>{v}</option>)}</select></label><label>Estimated budget<select name="budget" defaultValue="Let’s discuss">{['Let’s discuss','Under £2,500','£2,500–£5,000','£5,000–£10,000','£10,000+'].map(v=><option key={v}>{v}</option>)}</select></label></div>
    <label>A little about your project <span>*</span><textarea name="message" placeholder="What do you have in mind? Tell us about your business, your goals, and what you’d like your website to do." rows={4} required minLength={20} maxLength={5000} {...props('message')}/>{fieldError('message')}</label>
    <div className="form-honeypot" aria-hidden="true"><label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
    <label className="consent"><input type="checkbox" name="consent" required {...props('consent')}/><span>I agree to Natural Web Studio using these details to respond to my enquiry. My details won’t be added to a mailing list.</span></label>{fieldError('consent')}
    <button className="button button-primary form-submit" type="submit" disabled={status==='sending'}>{status==='sending'?<>Sending your enquiry <LoaderCircle className="spin" size={17}/></>:status==='success'?<>Enquiry sent <Check size={17}/></>:<>Let’s build something great <ArrowUpRight size={17}/></>}</button>
    {message&&<p role={status==='error'?'alert':'status'} className={`form-message ${status}`}>{message}</p>}
  </form>
}
