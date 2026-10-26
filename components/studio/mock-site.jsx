import { ArrowUpRight, ArrowRight, ChevronDown, MoveUpRight, Play, Plus } from 'lucide-react'

export const projects = [
  { id: 'aether', name: 'Aether Architecture', category: 'Website Design', type: 'Architecture & interiors', theme: 'architecture', title: 'Space to live.\nRoom to feel.', brand: 'aether', caption: 'Considered spaces. Lasting impressions.' },
  { id: 'botanica', name: 'Botanica Essentials', category: 'E-commerce Websites', type: 'Lifestyle & e-commerce', theme: 'botanica', title: 'A little closer\nto nature.', brand: 'botanica.', caption: 'Everyday rituals, naturally better.' },
  { id: 'nexus', name: 'Nexus Workspace', category: 'Pro Systems', type: 'Digital workspace concept', theme: 'dashboard', title: 'Make space\nfor great work.', brand: 'nexus', caption: 'A clearer view of your business.' },
  { id: 'form', name: 'Form & Field', category: 'Branding', type: 'Brand identity & digital', theme: 'form', title: 'Different\nby nature.', brand: 'FORM & FIELD', caption: 'An independent way of seeing.' },
  { id: 'veloce', name: 'Veloce Automotive', category: 'Website Design', type: 'Automotive & experiences', theme: 'veloce', title: 'Beyond\nthe ordinary.', brand: 'VELOCE', caption: 'Precision in every detail.' },
  { id: 'objects', name: 'Objects of Tomorrow', category: 'E-commerce Websites', type: 'Furniture & objects', theme: 'objects', title: 'Objects with\na point of view.', brand: 'OBJECTS', caption: 'Less, but more considered.' },
]

export function MockSite({ project = projects[0], className = '', compact = false }) {
  const dashboard = project.theme === 'dashboard'
  return <div className={`mock-browser ${className}`} aria-label={`${project.name} concept website preview`}>
    <div className="browser-chrome"><span /><span /><span /><div>{project.brand.toLowerCase().replace(/[^a-z]/g,'')}.studio</div><Plus size={8} /></div>
    <div className={`mock-page mock-${project.theme}`}>
      <div className="mock-nav"><b>{project.brand}</b><div>Discover <span>About</span> <span>Contact</span></div><ArrowUpRight size={12} /></div>
      {dashboard ? <div className="mock-dashboard"><aside><i /><i /><i /><i /><i /></aside><div><small>YOUR WORKSPACE, CONNECTED</small><h4>Good morning, Alex <span>↗</span></h4><div className="dash-stats"><p>24<small>Active projects</small></p><p>86%<small>On track</small></p><p>12<small>Your team</small></p></div><div className="dash-chart">{[32,58,43,70,54,87,66,93,77,98,80,94].map((n,i)=><i key={i} style={{height:`${n}%`}} />)}</div><div className="dash-rows"><i /><i /><i /></div></div></div> : <>
        <div className="mock-copy"><small>{project.caption}</small><h4>{project.title.split('\n').map((line,i)=><span key={i}>{line}<br /></span>)}</h4><div className="mock-site-cta">Explore the collection <ArrowUpRight size={10} /></div></div>
        <div className="mock-art" aria-hidden="true">{project.theme==='architecture' ? <><div className="arch-sun"/><div className="arch-building arch-back"/><div className="arch-building arch-front"/><div className="arch-tree"/></> : project.theme==='botanica' ? <><div className="bottle bottle-one"><span>botanica.<small>DAILY ESSENTIALS</small></span></div><div className="bottle bottle-two"><span>botanica.</span></div><div className="botanica-leaf"/></> : project.theme==='form' ? <><div className="form-orbit"/><div className="form-orbit second"/><div className="form-orbit third"/></> : project.theme==='veloce' ? <><div className="car-body"/><div className="car-wheel first"/><div className="car-wheel second"/><div className="car-light"/></> : <><div className="object-chair"/><div className="object-leg first"/><div className="object-leg second"/><div className="object-ball"/></>}</div>
      </>}
      {!compact && <div className="mock-bottom"><span>DESIGNED WITH INTENTION</span><span>SCROLL TO DISCOVER <ChevronDown size={8}/></span></div>}
    </div>
  </div>
}

export function HeroMockups() {
  return <div className="hero-mockups" aria-label="A selection of illustrative website concepts"><MockSite project={projects[1]} className="hero-mockup mockup-left" compact /><MockSite project={projects[0]} className="hero-mockup mockup-center" compact /><MockSite project={projects[4]} className="hero-mockup mockup-right" compact /><div className="mockup-caption"><span /> ORIGINAL DESIGN. REAL POSSIBILITIES.</div></div>
}
