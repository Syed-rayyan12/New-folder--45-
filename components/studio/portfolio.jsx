'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, X } from 'lucide-react'
import { MockSite, projects } from './mock-site'

const categories = ['All', 'Website Design', 'E-commerce Websites', 'Pro Systems', 'Branding']

export function Portfolio() {
  const [category, setCategory] = useState('All')
  const [active, setActive] = useState(null)
  return <>
    <div className="project-filters" role="group" aria-label="Filter projects">{categories.map(item=><button key={item} aria-pressed={category===item} onClick={()=>setCategory(item)}>{item}</button>)}</div>
    <motion.div layout className="portfolio-grid"><AnimatePresence mode="popLayout">{projects.filter(p=>category==='All'||p.category===category).map(project=><motion.article layout key={project.id} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:0.96}} transition={{duration:0.3}} className="portfolio-card">
      <button className={`project-preview project-${project.theme}`} onClick={()=>setActive(project)} aria-label={`Preview ${project.name} concept`}><MockSite project={project}/><span className="project-open"><ArrowUpRight size={23}/></span><span className="concept-tag">CONCEPT</span></button><div className="project-meta"><div><h3>{project.name}</h3><p>{project.type}</p></div><ArrowUpRight size={19}/></div>
    </motion.article>)}</AnimatePresence></motion.div>
    {active && <ProjectDialog project={active} close={()=>setActive(null)} />}
  </>
}

function ProjectDialog({project,close}) {
  const dialog=useRef(null)
  useEffect(()=>{const el=dialog.current;el.showModal();const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous}},[])
  return <dialog className="project-dialog" ref={dialog} aria-labelledby="project-dialog-title" onCancel={close} onClick={e=>{if(e.target===dialog.current)close()}}><div className="dialog-head"><div><span className="eyebrow">ILLUSTRATIVE DESIGN CONCEPT</span><h3 id="project-dialog-title">{project.name}</h3></div><button onClick={close} aria-label="Close project preview"><X/></button></div><MockSite project={project}/><p>This is a purpose-created concept to illustrate our design direction, not a client project or a live website.</p><a className="button button-primary" href="#contact" onClick={close}>Create something like this <ArrowUpRight size={16}/></a></dialog>
}
