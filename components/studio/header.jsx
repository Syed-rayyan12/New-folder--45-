'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Menu, X } from 'lucide-react'

const links = [['Home', '#home'], ['About', '#about'], ['Services', '#services'], ['Projects', '#projects'], ['Testimonials', '#testimonials'], ['Packages', '#packages']]

export function StudioLogo() {
  return <a className="studio-logo" href="#home" aria-label="Natural Web Studio home"><svg width="29" height="32" viewBox="0 0 29 32" fill="none" aria-hidden="true"><path d="M3 26V6L24 26V6M3 16L14 6M14 26L25 16" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg><span>NATURAL<span>WEB STUDIO</span></span></a>
}

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const button = useRef(null)
  const menu = useRef(null)
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24)
    update(); window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 851px)')
    const close = () => { if (desktop.matches) setOpen(false) }
    desktop.addEventListener('change', close)
    return () => desktop.removeEventListener('change', close)
  }, [])
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    menu.current?.querySelector('a')?.focus()
    const key = event => {
      if (event.key === 'Escape') { setOpen(false); button.current?.focus() }
      if (event.key === 'Tab') {
        const nodes = [button.current, ...menu.current.querySelectorAll('a')]
        const first = nodes[0], last = nodes[nodes.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', key)
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', key) }
  }, [open])
  return <header className={`studio-header ${scrolled ? 'is-scrolled' : ''}`}>
    <div className="nav-shell"><StudioLogo /><nav aria-label="Main navigation" className="desktop-nav">{links.map(([name, href]) => <a href={href} key={name}>{name}<span /></a>)}</nav><a className="button button-primary nav-contact" href="#contact">Contact Us <ArrowUpRight size={15} /></a><button ref={button} className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'}>{open ? <X /> : <Menu />}</button></div>
    <AnimatePresence>{open && <motion.nav ref={menu} id="mobile-navigation" aria-label="Mobile navigation" className="mobile-nav" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>{links.map(([name, href], i) => <a href={href} key={name} onClick={() => { setOpen(false); button.current?.focus() }}><span>0{i+1}</span>{name}<ArrowUpRight size={17} /></a>)}<a href="#contact" className="mobile-contact" onClick={() => setOpen(false)}>Let’s talk <ArrowUpRight size={18} /></a></motion.nav>}</AnimatePresence>
  </header>
}
