'use client'

import { cloneElement, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Search, X } from 'lucide-react'
import { DashboardData, useDashboard } from './dashboard-data'
import styles from './main-dashboard.module.css'

const NAV = ['Overview', 'Corridors', 'Audience', 'Campaign', 'Collection', 'Journal', 'Settings']

export function MainDashboard(props) { return <DashboardData><DashboardContent {...props}/></DashboardData> }

function DashboardContent({ children, activePage = 'Overview' }) {
  const {overview,logout}=useDashboard()
  const ORIGINS=overview.origins.map(([name,count])=>[name.toUpperCase(),count])
  const CORRIDORS=overview.corridors.map(row=>({id:row.id,label:`${row.from} → ${row.to}`,countries:`${row.origin} → ${row.country}`,audience:row.audience,growth:`${row.growth.toFixed(1)}%`,path:`M${row.point.join(' ')} Q${row.bend.join(' ')} ${row.target.join(' ')}`,from:row.point,to:row.target,labelAt:null}))
  const SIGNALS=overview.signals.map(row=>[`${row.title} — ${row.description}`,new Date(row.created_at).toLocaleString()])
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(activePage)
  const [selected, setSelected] = useState('lahore-birmingham')
  const [menu, setMenu] = useState(false)
  const [drawer, setDrawer] = useState(null)
  const [country, setCountry] = useState(null)
  const search = query.trim().toLowerCase()
  const origins = ORIGINS.filter(([name]) => name.toLowerCase().includes(search))
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
          {menu && <div className={styles.accountMenu}><strong>Main Dashboard</strong><span>Live PostgreSQL data</span><a href="/">Open the origin experience ↗</a><button type="button" onClick={() => { router.push('/main-dashboard/settings'); setMenu(false) }}>Dashboard settings</button><button type="button" onClick={logout}>Sign out</button></div>}
        </div>
      </div>
    </header>
    <aside className={styles.sidebar}><nav aria-label="Dashboard navigation">{NAV.map(name => <button type="button" key={name} className={active === name ? styles.active : ''} aria-current={active === name ? 'page' : undefined} onClick={() => navigate(name)}>{name}</button>)}</nav></aside>
    <div className={children ? styles.subpageContent : styles.content}>
      {children ? cloneElement(children, { dashboardSearch: query }) : <>
      <section className={styles.metrics} aria-label="Overview metrics">
        <div className={styles.metric}><h2>WAITLIST</h2><i /><strong>{overview.metrics.waitlist.toLocaleString()}</strong><p><span className={styles.mono}>Wishlist profiles</span></p></div>
        <div className={styles.metric}><h2>MARKS GENERATED</h2><strong>{overview.metrics.marks.toLocaleString()}</strong><p>All Time</p></div>
        <div className={styles.metric}><h2>COMPLETION RATE</h2><strong>{overview.metrics.completion}%</strong><p>Of {overview.metrics.journeys.toLocaleString()} journeys started</p></div>
        <div className={styles.metric}><h2>CORRIDORS ACTIVE</h2><strong>{overview.metrics.corridors}</strong><p>Origin → Destination Pairs</p></div>
      </section>
      <div className={styles.middle}>
        <section id="origin-ranking" tabIndex={-1} className={styles.origins} aria-label="Origin ranking">
          <h2>ORIGIN</h2><div className={styles.tableHead}><span>#</span><span>COUNTRY</span><span>Count</span></div>
          <ol>{origins.map(([name, count]) => <li key={name}><button type="button" aria-pressed={country === name} onClick={() => { setCountry(country === name ? null : name); setSelected('lahore-birmingham') }}><span className={styles.rank}>{String(ORIGINS.findIndex(([original]) => original === name) + 1).padStart(2, '0')}</span><span className={styles.country}>{name}<span className={styles.barTrack}><span style={{ width: `${count / Math.max(1,...ORIGINS.map(([,n])=>n)) * 100}%` }} /></span></span><span className={styles.count}>{count}</span></button></li>)}</ol>
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
    {drawer && <div className={styles.drawerBackdrop} onClick={() => setDrawer(null)}><section className={styles.drawer} role="dialog" aria-modal="true" aria-label={drawer} onClick={e => e.stopPropagation()}><div><h2>{drawer.toUpperCase()}</h2><button type="button" aria-label="Close panel" onClick={() => setDrawer(null)}><X size={18} /></button></div>{drawer === 'Settings' ? <><h3>Main Dashboard</h3><p>Curator overview · Global view</p><p>This dashboard displays saved journey and audience activity.</p><a href="/">Return to the origin experience ↗</a></> : drawer === 'Campaign' ? <><h3>Origin is everything.</h3><p>Recent campaign signal</p><p>Journey started — via Instagram</p><span>14 Min</span></> : <><h3>Your personal constellation.</h3><p>Saved marks and active corridors are shown in your overview.</p><a href="/">Explore the collection experience ↗</a></>}</section></div>}
  </main>
}
