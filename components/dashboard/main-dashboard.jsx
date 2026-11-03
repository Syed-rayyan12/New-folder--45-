'use client'

import { cloneElement, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Search, X } from 'lucide-react'
import styles from './main-dashboard.module.css'

const ORIGINS = [
  ['JAMAICA', 778], ['GUYANA', 554], ['PAKISTAN', 514], ['GHANA', 430],
  ['BARBADOS', 254], ['NIGERIA', 244], ['TRINIDAD AND TOBAGO', 165],
]
const CORRIDORS = [
  { id: 'kingston-london', label: 'Kingston → London', countries: 'Jamaica → United Kingdom', audience: 778, growth: '+26.1%', path: 'M287 167 Q404 105 486 122', from: [287, 167], to: [486, 122], labelAt: [189, 188], width: 162 },
  { id: 'kingston-georgetown', label: 'Kingston → Georgetown', countries: 'Jamaica → Guyana', audience: 554, growth: '+18.4%', path: 'M220 207 Q184 235 166 269 L132 331 Q153 376 206 357', from: [220, 207], to: [206, 357], extra: [166, 269], labelAt: [179, 333], width: 190 },
  { id: 'lahore-birmingham', label: 'Lahore → Birmingham', countries: 'Pakistan → United Kingdom', audience: 385, growth: '+25.0%', path: 'M636 239 Q565 116 486 131', from: [636, 239], to: [486, 131], labelAt: null },
  { id: 'newyork-london', label: 'New York → London', countries: 'United States → United Kingdom', audience: 312, growth: '+21.6%', path: 'M283 457 Q330 195 486 131', from: [283, 457], to: [486, 131], labelAt: [463, 342], width: 164 },
  { id: 'georgetown-saopaulo', label: 'Georgetown → São Paulo', countries: 'Guyana → Brazil', audience: 268, growth: '+16.3%', path: 'M486 122 Q485 345 283 457 Q417 456 462 370', from: [283, 457], to: [462, 370], labelAt: [252, 484], width: 199 },
  { id: 'london-bangalore', label: 'London → Bangalore', countries: 'United Kingdom → India', audience: 246, growth: '+19.2%', path: 'M486 131 Q572 130 636 239', from: [486, 131], to: [636, 239], labelAt: [642, 261], width: 164 },
  { id: 'tokyo-bangalore', label: 'Tokyo → Bangalore', countries: 'Japan → India', audience: 218, growth: '+14.8%', path: 'M753 279 Q818 289 847 323', from: [753, 279], to: [847, 323], labelAt: [788, 348], width: 151 },
]
const SIGNALS = [
  ['Waitlist joined — Kingston to London', '2 Min'],
  ['Mark generated — Lahore to Birmingham', '8 Min'],
  ['Journey started — via Instagram', '14 Min'],
  ['Waitlist joined — Lahore to Birmingham', '2 Min'],
]
const NAV = ['Overview', 'Corridors', 'Audience', 'Campaign', 'Collection', 'Journal', 'Settings']

export function MainDashboard({ children, activePage = 'Overview' }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(activePage)
  const [selected, setSelected] = useState('lahore-birmingham')
  const [menu, setMenu] = useState(false)
  const [drawer, setDrawer] = useState(null)
  const [country, setCountry] = useState(null)
  const search = query.trim().toLowerCase()
  const origins = useMemo(() => ORIGINS.filter(([name]) => name.toLowerCase().includes(search)), [search])
  const corridors = CORRIDORS.filter(route => (!search || `${route.label} ${route.countries}`.toLowerCase().includes(search)) && (!country || route.countries.toUpperCase().includes(country)))
  const route = corridors.find(item => item.id === selected)
  const signals = SIGNALS.filter(([text]) => text.toLowerCase().includes(search))
  const navigate = (name) => {
    const routes = { Overview:'/main-dashboard', Corridors:'/main-dashboard/corridors', Audience:'/main-dashboard/audience', Campaign:'/main-dashboard/campaign', Collection:'/main-dashboard/collection', Journal:'/main-dashboard/journal', Settings:'/main-dashboard/settings' }
    if (routes[name]) { setActive(name); setDrawer(null); router.push(routes[name]); return }
    setActive(name); setDrawer(name)
  }

  return <main className={styles.dashboard} aria-label="Main Dashboard">
    <header className={styles.header}>
      <a href="/" className={styles.brand} aria-label="PRVLG home">PRVLG</a>
      <div className={styles.headerMain}>
        <label className={styles.search}><Search size={14} aria-hidden="true" /><input aria-label="Search dashboard" placeholder="SEARCH" value={query} onChange={e => setQuery(e.target.value)} />{query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}><X size={13} /></button>}</label>
        <div className={styles.account}>
          <button type="button" aria-expanded={menu} onClick={() => setMenu(!menu)}>CURATOR <ChevronDown size={13} /></button>
          {menu && <div className={styles.accountMenu}><strong>Main Dashboard</strong><span>Reference dashboard data</span><a href="/">Open the origin experience ↗</a><button type="button" onClick={() => { router.push('/main-dashboard/settings'); setMenu(false) }}>Dashboard settings</button></div>}
        </div>
      </div>
    </header>
    <aside className={styles.sidebar}><nav aria-label="Dashboard navigation">{NAV.map(name => <button type="button" key={name} className={active === name ? styles.active : ''} aria-current={active === name ? 'page' : undefined} onClick={() => navigate(name)}>{name}</button>)}</nav></aside>
    <div className={children ? styles.subpageContent : styles.content}>
      {children ? cloneElement(children, { dashboardSearch: query }) : <>
      <section className={styles.metrics} aria-label="Overview metrics">
        <div className={styles.metric}><h2>WAITLIST</h2><i /><strong>4,182</strong><p><em>+26.1%</em><span className={styles.mono}> vs prior 4 wks</span></p></div>
        <div className={styles.metric}><h2>MARKS GENERATED</h2><strong>6,907</strong><p>All Time</p></div>
        <div className={styles.metric}><h2>COMPLETION RATE</h2><strong>61.2%</strong><p>Of 9,420 Journeys Started</p></div>
        <div className={styles.metric}><h2>CORRIDORS ACTIVE</h2><strong>74</strong><p>Origin → Destination Pairs</p></div>
      </section>
      <div className={styles.middle}>
        <section id="origin-ranking" tabIndex={-1} className={styles.origins} aria-label="Origin ranking">
          <h2>ORIGIN</h2><div className={styles.tableHead}><span>#</span><span>COUNTRY</span><span>Count</span></div>
          <ol>{origins.map(([name, count]) => <li key={name}><button type="button" aria-pressed={country === name} onClick={() => { setCountry(country === name ? null : name); setSelected('lahore-birmingham') }}><span className={styles.rank}>{String(ORIGINS.findIndex(([original]) => original === name) + 1).padStart(2, '0')}</span><span className={styles.country}>{name}<span className={styles.barTrack}><span style={{ width: `${count / 778 * 100}%` }} /></span></span><span className={styles.count}>{count}</span></button></li>)}</ol>
          {origins.length === 0 && <p className={styles.empty}>No matching origins.</p>}
          {country && <button className={styles.clearFilter} onClick={() => setCountry(null)}>Clear {country.toLowerCase()} filter ×</button>}
        </section>
        <section id="top-corridors" tabIndex={-1} className={styles.corridors} aria-label="Top corridors chart">
          <div className={styles.chartHeading}><h2>TOP CORRIDORS</h2><span><i />Origin → Destination- Global View</span></div>
          <svg className={styles.map} viewBox="0 0 980 530" role="img" aria-label="Dotted world map showing top origin to destination corridors">
            <image href="/images/dashboard-world-dots.svg" width="980" height="530" />
            {corridors.map(item => <g key={item.id} role="button" tabIndex={0} aria-label={`${item.label}, audience ${item.audience}, growth ${item.growth}`} className={`${styles.corridor} ${selected === item.id ? styles.selectedCorridor : ''}`} onPointerEnter={() => setSelected(item.id)} onFocus={() => setSelected(item.id)} onClick={() => setSelected(item.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(item.id) } }}>
              <path d={item.path} className={styles.hitPath} /><path d={item.path} className={styles.routePath} />
              {[item.from, item.to, ...(item.extra ? [item.extra] : [])].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.7" className={styles.routeDot} />)}
              {item.id === 'kingston-georgetown' && <circle cx="132" cy="331" r="3.7" className={styles.routeDot} />}
              {item.labelAt && <g transform={`translate(${item.labelAt[0]},${item.labelAt[1]})`}><rect x="-5" y="-13" width={item.width} height="24" /><text y="3">{item.label}</text></g>}
            </g>)}
            {route && <g className={styles.tooltip} transform="translate(494,64)"><rect width="174" height="103" /><text x="15" y="21" className={styles.tooltipTitle}>{route.label.toUpperCase()}</text><text x="15" y="36" className={styles.tooltipCountries}>{route.countries}</text><path d="M15 51H159" /><text x="15" y="73" className={styles.tooltipLabel}>AUDIENCE</text><text x="97" y="73" className={styles.tooltipLabel}>GROWTH</text><text x="15" y="91" className={styles.tooltipValue}>{route.audience}</text><text x="97" y="91" className={styles.tooltipValue}>{route.growth}</text></g>}
          </svg>
          {corridors.length === 0 && <p className={styles.mapEmpty}>No matching corridors. Try another search or origin.</p>}
        </section>
      </div>
      <section id="recent-signal" tabIndex={-1} className={styles.signals} aria-label="Recent signal">
        <h2>RECENT SIGNAL</h2><ul>{signals.map(([text, time], i) => <li key={i}><i /><span>{text}</span><time>{time}</time></li>)}</ul>
        {signals.length === 0 && <p className={styles.empty}>No matching signals.</p>}
      </section>
      </>}
    </div>
    {drawer && <div className={styles.drawerBackdrop} onClick={() => setDrawer(null)}><section className={styles.drawer} role="dialog" aria-modal="true" aria-label={drawer} onClick={e => e.stopPropagation()}><div><h2>{drawer.toUpperCase()}</h2><button type="button" aria-label="Close panel" onClick={() => setDrawer(null)}><X size={18} /></button></div>{drawer === 'Settings' ? <><h3>Main Dashboard</h3><p>Curator overview · Global view</p><p>This dashboard displays the reference figures. Live reporting is not connected.</p><a href="/">Return to the origin experience ↗</a></> : drawer === 'Campaign' ? <><h3>Origin is everything.</h3><p>Recent campaign signal</p><p>Journey started — via Instagram</p><span>14 Min</span></> : <><h3>Your personal constellation.</h3><p>6,907 marks generated across 74 active corridors.</p><a href="/">Explore the collection experience ↗</a></>}</section></div>}
  </main>
}
