import { ArrowUpRight, ArrowRight, ArrowDown, Code2, MousePointer2, Search, Gauge, Check, Plus, ShieldCheck, Compass, Fingerprint, Layers3, Sparkles, MessagesSquare } from 'lucide-react'
import { Header, StudioLogo } from '@/components/studio/header'
import { HeroVisual } from '@/components/studio/hero-visual'
import { HeroMockups, MockSite, projects } from '@/components/studio/mock-site'
import { Reveal } from '@/components/studio/reveal'
import { Portfolio } from '@/components/studio/portfolio'
import { ContactForm } from '@/components/studio/contact-form'

const services = [
  [Code2, 'Custom Website Development', 'Built around your business. Original design, thoughtful engineering, no off-the-shelf limitations.'],
  [MousePointer2, 'Conversion-Focused Design', 'Clear journeys, compelling content, and purposeful interactions that make taking action feel natural.'],
  [Search, 'SEO-Ready Structure', 'A solid technical foundation, semantic content, and thoughtful structure to support discoverability.'],
  [Gauge, 'Performance & Scalability', 'Fast, responsive experiences built to work beautifully today and evolve with your business.'],
]
const capabilities = ['Website Design & Development', 'Strategy-First Websites', 'Conversion-Focused Design', 'Custom-Built Experiences', 'Built for Business Growth']
const packages = [
  { name:'Essential', description:'A confident first impression.', label:'FOR SMALL BUSINESSES', features:['Bespoke responsive website','Core pages & enquiry form','Technical SEO foundations','Launch support & handover'], cta:'Let’s get you online' },
  { name:'Growth', description:'Built to move your business forward.', label:'FOR AMBITIOUS BRANDS', featured:true, features:['Strategy & conversion planning','Custom design & development','Flexible content management','Integrations for your workflow','Performance & accessibility review','Launch support & handover'], cta:'Build for what’s next' },
  { name:'Bespoke', description:'Your vision. No compromises.', label:'FOR SOMETHING DIFFERENT', features:['Advanced functionality','E-commerce or custom systems','Brand-led digital experiences','Tailored integrations','A roadmap built around your goals'], cta:'Talk about your vision' },
]
const faqs = [
  ['What kind of businesses do you work with?', 'We design and develop for service businesses, independent brands, and growing companies. The starting point is always your goals, your customers, and what your website needs to achieve.'],
  ['How much does a website cost?', 'Every project is scoped individually. Your investment depends on the number of pages, the depth of design, content requirements, and any integrations or custom features. Send us a brief and we’ll outline a clear proposal before work begins.'],
  ['How long will my project take?', 'Timing depends on scope and how quickly content and feedback are available. We agree on milestones at the start, so you know what’s happening and when. Your proposal will include a project-specific timeline.'],
  ['Can you redesign my existing website?', 'Yes. We can review your existing site, identify what’s working and what’s holding it back, and recommend a redesign that improves the experience while protecting important content and existing URLs.'],
  ['Will I be able to update my website?', 'We can include a content management system suited to the parts of your website you need to manage. We’ll show you how it works and provide a clear handover.'],
  ['What happens after launch?', 'We check the launch, provide your agreed handover, and discuss ongoing support if you need it. Hosting, maintenance, and future improvements are scoped clearly rather than assumed.'],
]

function SectionLabel({children,number}) { return <div className="section-label"><span className="label-dot"/>{children}<span className="section-number">/{number}</span></div> }

export default function Home() {
  return <>
    <Header/>
    <main id="main" tabIndex={-1}>
      <section className="studio-hero" id="home" aria-labelledby="hero-title">
        <HeroVisual/>
        <div className="hero-grid-lines" aria-hidden="true"/>
        <div className="hero-content container">
          <Reveal><div className="hero-eyebrow"><span/><span>INDEPENDENT THINKING. EXCEPTIONAL WEBSITES.</span></div></Reveal>
          <Reveal delay={0.08}><h1 id="hero-title">Websites Built To Win Trust,<br className="desktop-break"/> Generate Enquiries &amp;<br/>Grow <span>Your Business</span><span className="headline-period">.</span></h1></Reveal>
          <Reveal delay={0.16}><p className="hero-description">Strategy-led websites designed to build credibility, attract the right<br className="desktop-break"/> customers, and turn more visitors into enquiries.</p></Reveal>
          <Reveal delay={0.24}><div className="hero-actions"><a className="button button-primary" href="#contact">Get Your Website Built <ArrowUpRight size={17}/></a><a className="button button-secondary" href="#projects">Explore Our Work <ArrowUpRight size={17}/></a></div><div className="hero-assurance"><span><Check size={12}/> Designed with purpose</span><span><Check size={12}/> Built for your business</span></div></Reveal>
          <Reveal delay={0.3}><HeroMockups/></Reveal>
        </div>
        <div className="hero-side-note">STRATEGY / DESIGN / DEVELOPMENT</div>
        <a className="hero-scroll" href="#services" aria-label="Scroll to services"><span>SCROLL TO EXPLORE</span><ArrowDown size={14}/></a>
      </section>

      <div className="capability-marquee" aria-label={capabilities.join(', ')}><div className="marquee-track" aria-hidden="true">{[0,1].map(i=><div className="marquee-copy" key={i}>{capabilities.map(text=><span key={text}>{text}<span className="marquee-star">✳</span></span>)}</div>)}</div></div>

      <section className="section section-services container" id="services">
        <Reveal><div className="section-heading"><SectionLabel number="01">BUILT WITH INTENTION</SectionLabel><h2>Website Design &amp; Development<br/> That Drives <span>Real Business Results</span><span className="accent">.</span></h2><p>Your website shouldn’t just look the part.<br/>It should work hard for your business.</p></div></Reveal>
        <div className="services-feature"><Reveal className="service-showcase"><div className="showcase-grid"/><div className="service-desktop"><MockSite project={projects[0]}/><div className="monitor-neck"/><div className="monitor-foot"/></div><div className="service-mobile"><div className="phone-notch"/><MockSite project={projects[1]} compact/></div><span className="showcase-label"><span/> EVERY SCREEN. EVERY DETAIL.</span></Reveal>
          <Reveal className="service-information" delay={0.1}><span className="small-orange-icon"><Code2 size={23}/></span><h3>A better website.<br/>A stronger business.</h3><p>We bring strategy, design, and development together to create websites that feel right for your brand and make sense for your customers.</p><ul>{['Built around your goals, not a template','Seamless on mobile, tablet & desktop','Clear paths from first visit to enquiry','Easy to manage. Ready to grow.'].map(text=><li key={text}><Check size={15}/>{text}</li>)}</ul><a className="text-link" href="#contact">Let’s talk about your website <ArrowUpRight size={17}/></a></Reveal>
        </div>
        <div className="service-card-grid">{services.map(([Icon,title,copy],i)=><Reveal key={title} delay={i*0.06}><article className="service-card"><div className="service-card-top"><Icon size={24}/><span>0{i+1}</span></div><h3>{title}</h3><p>{copy}</p><ArrowUpRight className="service-card-arrow" size={17}/></article></Reveal>)}</div>
      </section>

      <section className="section section-work" id="projects"><div className="container"><Reveal><div className="section-heading split-heading"><div><SectionLabel number="02">SELECTED DIRECTIONS</SectionLabel><h2>Websites Built<br/>to Make an <span>Impact.</span></h2></div><p>Distinctive by design. Purposeful by nature.<br/>Explore a few directions your next website could take.<small>Illustrative concepts — not client commissions.</small></p></div></Reveal><Portfolio/><Reveal><div className="work-bottom"><p>Your business deserves a website that feels like <em>you.</em></p><a className="text-link" href="#contact">Let’s make it happen <ArrowUpRight size={17}/></a></div></Reveal></div></section>

      <section className="section section-about container" id="about"><Reveal className="about-visual"><div className="about-symbol" aria-hidden="true"><span/><span/><span/><span/></div><div className="about-caption"><span>NATURALLY DIFFERENT.</span><span>BUILT WITH PURPOSE. ↗</span></div></Reveal><Reveal className="about-copy"><SectionLabel number="03">A STUDIO WITH INTENTION</SectionLabel><h2>Good design is natural.<br/><span>Great results are built.</span></h2><p>Natural Web Studio brings clarity to the complicated. We’re an independent design and development studio focused on one thing: creating websites that help businesses move forward.</p><p>No unnecessary complexity. No one-size-fits-all thinking. Just a thoughtful process, honest communication, and attention to the details that make a difference.</p><div className="about-values"><span><Compass size={17}/> Strategy before screens</span><span><Fingerprint size={17}/> Original by design</span><span><Code2 size={17}/> Built with care</span></div><a className="button button-secondary" href="#contact">Meet your next creative partner <ArrowUpRight size={17}/></a></Reveal></section>

      <section className="section process-section"><div className="container"><Reveal><div className="section-heading"><SectionLabel number="04">FROM FIRST THOUGHT TO FINAL DETAIL</SectionLabel><h2>A clear process.<br/>An <span>exceptional outcome.</span></h2></div></Reveal><div className="process-grid">{[[Compass,'Discover','We get to know your business, your audience, and what success looks like.'],[Layers3,'Design','We turn the strategy into a distinct visual direction and a thoughtful user experience.'],[Code2,'Develop','We bring every detail to life with clean engineering and careful testing.'],[ArrowUpRight,'Launch & grow','We make the launch smooth, hand over with clarity, and plan what comes next.']].map(([Icon,title,copy],i)=><Reveal key={title} delay={i*0.08}><article className="process-step"><div><span>0{i+1}</span><Icon size={22}/></div><h3>{title}</h3><p>{copy}</p></article></Reveal>)}</div></div></section>

      <section className="section relationship-section container" id="testimonials"><Reveal><SectionLabel number="05">THE WAY WE WORK</SectionLabel><div className="relationship-grid"><div><MessagesSquare size={29}/><h2>Great websites start<br/>with a <span>good relationship.</span></h2><p>Clear communication. Thoughtful decisions. A shared ambition to create something worth putting your name on.</p><a className="text-link" href="#contact">Start a conversation <ArrowUpRight size={17}/></a></div><div className="relationship-card"><span className="large-quote">“</span><h3>Your story belongs here.</h3><p>Every project is a partnership. This space is reserved for client stories, shared with permission. We look forward to telling the story behind the next great website.</p><div><span className="label-dot"/> CLIENT STORIES COMING SOON</div></div></div></Reveal></section>

      <section className="section packages-section" id="packages"><div className="container"><Reveal><div className="section-heading"><SectionLabel number="06">THE RIGHT FIT FOR YOUR NEXT CHAPTER</SectionLabel><h2>A considered investment.<br/><span>A stronger digital presence.</span></h2><p>Different goals call for different approaches.<br/>We’ll shape the right scope around your business.</p></div></Reveal><div className="packages-grid">{packages.map((pack,i)=><Reveal key={pack.name} delay={i*0.08}><article className={`package-card ${pack.featured?'featured':''}`}>{pack.featured&&<div className="package-badge"><Sparkles size={12}/> A LITTLE MORE AMBITION</div>}<span className="package-label">{pack.label}</span><h3>{pack.name}</h3><p>{pack.description}</p><div className="package-price">Let’s talk scope<span>Tailored proposal. Clear deliverables.</span></div><a className={`button ${pack.featured?'button-primary':'button-secondary'}`} href="#contact">{pack.cta}<ArrowUpRight size={16}/></a><div className="package-includes">WHAT WE CAN INCLUDE</div><ul>{pack.features.map(feature=><li key={feature}><Check size={14}/>{feature}</li>)}</ul></article></Reveal>)}</div><p className="package-note">Every project is quoted individually. Final features, timescales, and pricing are agreed in your proposal.</p></div></section>

      <section className="section faq-section container"><Reveal className="faq-intro"><SectionLabel number="07">A LITTLE CLARITY</SectionLabel><h2>Good questions.<br/><span>Straight answers.</span></h2><p>Wondering how it all works?<br/>Here’s a good place to start.</p><a className="text-link" href="#contact">Have a different question? <ArrowUpRight size={16}/></a></Reveal><Reveal className="faq-list">{faqs.map(([question,answer],i)=><details key={question} className="faq-item" name="studio-faq"><summary><span className="faq-number">0{i+1}</span>{question}<Plus size={18}/></summary><p>{answer}</p></details>)}</Reveal></section>

      <section className="section contact-section" id="contact"><div className="container contact-grid"><Reveal className="contact-intro"><SectionLabel number="08">YOUR NEXT CHAPTER STARTS HERE</SectionLabel><h2>Let’s build<br/>something<br/><span>worth visiting.</span></h2><p>A new business. A bigger ambition. A website that’s ready for what’s next. Tell us what you have in mind.</p><div className="contact-promise"><ShieldCheck size={22}/><div>A conversation, not a commitment.<span>Tell us your goals. We’ll take it from there.</span></div></div><div className="contact-monogram" aria-hidden="true">N<span>↗</span></div></Reveal><Reveal className="contact-form-panel" delay={0.1}><h3>Tell us about your project.</h3><p>The more you share, the better we can help.</p><ContactForm/></Reveal></div></section>
    </main>
    <footer className="studio-footer"><div className="container"><div className="footer-top"><StudioLogo/><p>Thoughtfully designed.<br/>Naturally better.</p><a href="#home" className="back-top">BACK TO TOP <ArrowUpRight size={16}/></a></div><div className="footer-nav"><a href="#about">About</a><a href="#services">Services</a><a href="#projects">Projects</a><a href="#packages">Packages</a><a href="#contact">Let’s talk <ArrowUpRight size={13}/></a></div><div className="footer-bottom"><p>© {new Date().getFullYear()} Natural Web Studio. All rights reserved.</p><span>DESIGNED WITH INTENTION. BUILT TO MAKE AN IMPACT.</span></div><div className="footer-wordmark" aria-hidden="true">NATURAL<span>®</span></div></div></footer>
  </>
}
