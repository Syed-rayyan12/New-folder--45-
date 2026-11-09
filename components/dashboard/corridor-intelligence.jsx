'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, Download } from 'lucide-react'
import { filterCorridors, routeLabel } from './reference-data'
import { useDashboard } from './dashboard-data'
import styles from './records.module.css'

function Emblem({ index }) {
  return <svg width="29" height="29" viewBox="0 0 30 30" aria-hidden="true" fill="#67F163">{index % 5 === 0 ? <><path d="M2 26L10 8V26ZM12 3L17 13V26H12ZM19 10L28 26H19Z" /></> : index % 5 === 1 ? <><path d="M1 21L15 5L29 21Z" /><path d="M4 23H26L20 28H10Z" /></> : index % 5 === 2 ? <><rect x="6" y="3" width="21" height="21" rx="3" /><path d="M3 8V26H21L11 22Z" /></> : index % 5 === 3 ? <><path d="M15 2L27 15L15 28L3 15Z" /><path d="M3 15H27M15 2L10 15L15 28L20 15Z" stroke="#070907" strokeWidth="1" /></> : <path d="M7 3H15C29 3 29 20 15 20H12V27H7ZM12 7V15H15C22 15 22 7 15 7ZM18 19L26 27H19L14 20Z" />}</svg>
}

export function CorridorIntelligence({ dashboardSearch = '' }) {
  const {audience:AUDIENCE_RECORDS,corridors:CORRIDOR_RECORDS}=useDashboard()
  const [origin,setOrigin] = useState(''), [city,setCity] = useState(''), [source,setSource] = useState('')
  const [selectedId,setSelectedId] = useState('kingston-london')
  const [weeks,setWeeks] = useState(12)
  const [exported,setExported] = useState(false)
  const rows = useMemo(() => filterCorridors(CORRIDOR_RECORDS,{origin,city,source,search:dashboardSearch}),[CORRIDOR_RECORDS,origin,city,source,dashboardSearch])
  const selected = rows.find(row => row.id === selectedId) || rows[0]
  const summary = useMemo(() => {
    const totals = key => rows.reduce((result,row) => ({...result,[row[key]]:(result[row[key]] || 0)+row.audience}),{})
    const top = key => Object.entries(totals(key)).sort((a,b) => b[1]-a[1])[0]?.[0] || '—'
    return {origin:top('origin'),destination:top('to'),fastest:[...rows].sort((a,b) => b.growth-a.growth)[0]}
  },[rows])
  const sourceProfiles = selected ? AUDIENCE_RECORDS.filter(row => row.origin === selected.origin && row.city === selected.to && (!source || row.source === source)) : []
  const resetExport = setter => event => { setter(event.target.value);setExported(false) }
  const exportSegment = () => {
    if (!selected) return
    const escape = value => `"${String(value).replaceAll('"','""')}"`
    const csv = [['Profile','Origin','Destination','Stage','Source','Mark','Contact consent'],...sourceProfiles.map(row => [row.id,row.origin,row.city,row.stage,row.source,row.mark,row.consent ? 'Granted':'Not granted'])].map(row => row.map(escape).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}))
    const link = document.createElement('a');link.href=url;link.download=`prvlg-${selected.id}-segment.csv`;link.click();window.setTimeout(() => URL.revokeObjectURL(url),1000);setExported(true)
  }
  const weekly = selected ? Array.from({length:weeks},(_,i) => selected.weekly?.[weeks-1-i] || 0) : []
  const values = weekly.map((_,i)=>weekly.slice(0,i+1).reduce((sum,n)=>sum+n,0))
  const chartMax = selected ? Math.ceil(selected.audience/150)*150 : 600
  const chartPoints = values.map((value,i) => `${35+i/(weeks-1)*380},${235-value/chartMax*210}`).join(' ')
  return <div className={styles.corridorPage}>
    <header className={styles.pageHead}><div><h1>CORRIDOR INTELLIGENCE</h1><p>Explore Heritage Routes Across Your Audience.</p></div></header>
    <section className={styles.corridorMetrics} aria-label="Corridor metrics"><div><h2>ACTIVE CORRIDORS</h2><i /><strong>{rows.length}</strong><p className={styles.mono}>In Current Filter</p></div><div><h2>TOP ORIGIN</h2><strong>{summary.origin}</strong><p>By Audience</p></div><div><h2>TOP DESTINATION</h2><strong>{summary.destination}</strong><p>By Audience</p></div><div><h2>FASTEST GROWING</h2><strong>{summary.fastest ? routeLabel(summary.fastest) : '—'}</strong><p><em>+{summary.fastest?.growth.toFixed(1) || '0.0'}%</em> Vs Prior 4 Wks</p></div></section>
    <section className={styles.filters} aria-label="Corridor filters">{[['ORIGIN COUNTRY',origin,setOrigin,'origin','All origins'],['DESTINATION CITY',city,setCity,'to','All destinations'],['TRAFFIC SOURCE',source,setSource,'source','All sources']].map(([label,value,setter,field,placeholder]) => <label key={label}>{label}<select aria-label={label} value={value} onChange={resetExport(setter)}><option value="">{placeholder}</option>{[...new Set(CORRIDOR_RECORDS.map(row => row[field]))].sort().map(option => <option key={option}>{option}</option>)}</select></label>)}</section>
    <div className={styles.corridorMapRow}><section className={styles.routeMap} aria-label="Corridor map"><svg viewBox="0 0 920 440" role="group" aria-label="Select a heritage corridor"><image href="/images/dashboard-world-dots.svg" x="20" y="-68" width="900" height="530" preserveAspectRatio="none" />
      {rows.map(row => {const chosen=selected?.id===row.id;const [x,y]=row.point,[tx,ty]=row.target,[bx,by]=row.bend;return <g key={row.id} role="button" tabIndex={0} aria-label={routeLabel(row)} aria-pressed={chosen} className={chosen ? styles.chosenRoute : styles.otherRoute} onClick={() => {setSelectedId(row.id);setExported(false)}} onKeyDown={e => {if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelectedId(row.id);setExported(false)}}}>
        <path d={`M${x} ${y} Q${bx} ${by} ${tx} ${ty}`} className={styles.routeHit} /><path d={`M${x} ${y} Q${bx} ${by} ${tx} ${ty}`} className={styles.mapArc} /><circle cx={x} cy={y} r={chosen ? 5.3:3.6} /><circle cx={tx} cy={ty} r={chosen ? 4.2:3.4} />
        {chosen && <><text x={x+9} y={y+7} className={styles.cityLabel}>{row.from.toUpperCase()}</text><text x={tx+9} y={ty+7} className={styles.cityLabel}>{row.to.toUpperCase()}</text><g transform={`translate(${(x+tx)/2-75},${Math.min(y,ty)-10})`}><rect x="0" y="0" width="150" height="23" /><text x="8" y="15" className={styles.mapLabel}>{routeLabel(row)}</text></g></>}
      </g>})}
    </svg>{rows.length===0 && <p className={styles.mapNoResults}>No corridors match these filters.</p>}</section>
    <aside className={styles.selectedPanel}><h2>SELECTED CORRIDOR</h2>{selected ? <><div className={styles.routeNames}><div><span>{selected.fromCode}</span><strong>{selected.from}</strong><small>{selected.origin}</small></div><ArrowRight size={16} /><div><span>{selected.toCode}</span><strong>{selected.to}</strong><small>{selected.country}</small></div></div><dl><div><dt>AUDIENCE</dt><dd className={styles.audienceValue}>{selected.audience}</dd></div><div><dt>GROWTH · VS PRIOR 4 WKS</dt><dd className={styles.growth}>+{selected.growth.toFixed(1)}%</dd></div><div><dt>SHARE OF AUDIENCE</dt><dd>{selected.id==='kingston-london'?'18.8':selected.share.toFixed(1)}%</dd></div><div><dt>SOURCE</dt><dd>{source || 'All Sources'}</dd></div></dl><button type="button" className={styles.outlineButton} onClick={exportSegment}><Download size={13} />{exported ? 'SEGMENT EXPORTED' : 'EXPORT SEGMENT'}</button><p className={styles.exportNote}>{!origin&&!city&&!source&&selected.id==='kingston-london'?'4':sourceProfiles.length} profiles on record · contact fields for consented only</p><span className={styles.srOnly} role="status">{exported ? 'Reference segment CSV downloaded. No contact fields are included in these reference records.' : ''}</span></> : <p className={styles.exportNote}>Select a different filter to see a corridor.</p>}</aside></div>
    <div className={styles.corridorBottom}><section className={styles.ranking}><h2>TOP CORRIDORS</h2><div className={styles.rankingScroll}><table><thead><tr>{['#','ROUTE','EMBLEM','AUDIENCE','GROWTH','AUDIENCE SHARE'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{rows.map((row,i) => <tr key={row.id} className={selected?.id===row.id ? styles.selectedRow:''} onClick={() => {setSelectedId(row.id);setExported(false)}}><td>{String(i+1).padStart(2,'0')}</td><td><button type="button" onClick={() => {setSelectedId(row.id);setExported(false)}}>{routeLabel(row)}</button></td><td><Emblem index={CORRIDOR_RECORDS.indexOf(row)} /></td><td>{row.audience}</td><td className={styles.growth}>+{row.growth.toFixed(1)}%</td><td>{row.share.toFixed(1)}%</td></tr>)}</tbody></table></div></section>
    <section className={styles.growthChart}><div className={styles.growthHeading}><div><h2>CORRIDOR GROWTH</h2><p>Cumulative audience · {selected ? routeLabel(selected):'No corridor selected'}</p></div><div role="group" aria-label="Growth chart period">{[8,12].map(value => <button type="button" key={value} aria-pressed={weeks===value} onClick={() => setWeeks(value)}>{value}</button>)}</div></div><svg viewBox="0 0 440 265" role="img" aria-label={`${weeks} week cumulative audience chart for ${selected ? routeLabel(selected):'no selected corridor'}`}><title>{selected ? `${routeLabel(selected)}: ${selected.audience} audience over ${weeks} weeks`:'No chart data'}</title>{[0,1,2,3,4].map(i => <g key={i}><line x1="35" x2="415" y1={235-i*52.5} y2={235-i*52.5} /><text x="8" y={239-i*52.5}>{Math.round(chartMax*i/4)}</text></g>)}{selected && <polyline points={chartPoints} fill="none" className={styles.growthLine} />}{Array.from({length:6},(_,i)=>new Date(Date.now()-(weeks-1)*(1-i/5)*7*86400000).toLocaleDateString('en-GB',{day:'numeric',month:'short'})).map((label,i) => <text key={label} x={42+i*70} y="257">{label}</text>)}</svg></section></div>
  </div>
}
