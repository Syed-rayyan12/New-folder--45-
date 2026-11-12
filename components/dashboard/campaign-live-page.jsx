'use client'
import { useState } from 'react'
import styles from './workspace-pages.module.css'
const EMPTY={total:0,signups:0,completion:0,sources:[],devices:[],campaigns:[],landings:[],daily:[],recent:[],locations:[]}
function Card({title,children,className=''}) {return <section className={`${styles.card} ${className}`}><header className={styles.cardHead}><h2>{title}</h2></header>{children}</section>}
export function CampaignPage({dashboardSearch=''}) {
  const data=EMPTY, error=''
  const [period,setPeriod]=useState('7 Days')
  const today=new Date().toISOString().slice(0,10)
  const [range,setRange]=useState({from:today,to:today})
  const search=dashboardSearch.toLowerCase(),visible=rows=>rows.filter(row=>!search||row.join(' ').toLowerCase().includes(search))
  const max=Math.max(1,...data.daily.map(([,n])=>n))
  const points=data.daily.map(([,n],i)=>`${38+i/Math.max(1,data.daily.length-1)*752},${240-n/max*200}`).join(' ')
  return <div className={styles.page}>
    <header className={styles.pageHead}><div><h1>CAMPAIGN</h1><p>Journey traffic, attribution and wishlist conversions.</p></div><span>Frontend preview</span></header>
    {error&&<p role="alert">{error}</p>}
    <section className={styles.metrics} aria-label="Campaign summary"><div><h2>JOURNEYS STARTED</h2><i/><strong>{data.total.toLocaleString()}</strong><p>Selected date range</p></div><div><h2>WISHLIST SIGNUPS</h2><strong>{data.signups.toLocaleString()}</strong><p>Saved profiles</p></div><div><h2>COMPLETION RATE</h2><strong>{data.completion.toFixed(1)}%</strong><p>Reached the emblem</p></div><div><h2>SIGNUP RATE</h2><strong>{data.total?(data.signups/data.total*100).toFixed(1):'0.0'}%</strong><p>Profiles per journey</p></div></section>
    <div className={styles.campaignGrid}>
      <Card className={styles.trafficCard} title="JOURNEY TRAFFIC">
        <div className={styles.segmented} role="group" aria-label="Traffic date range">{['Last 24 Hours','7 Days','30 Days','Custom Range'].map(value=><button key={value} aria-pressed={period===value} onClick={()=>setPeriod(value)}>{value}</button>)}</div>
        {period==='Custom Range'&&<div className={styles.dateRange}><label>From<input type="date" value={range.from} max={range.to} onChange={e=>setRange({...range,from:e.target.value||today})}/></label><label>To<input type="date" value={range.to} min={range.from} onChange={e=>setRange({...range,to:e.target.value||today})}/></label></div>}
        <svg className={styles.trafficChart} viewBox="0 0 820 280" role="img" aria-label="Daily journeys started"><title>Daily journeys started</title>{[0,1,2,3,4].map(i=><g key={i}><line x1="38" x2="790" y1={240-i*50} y2={240-i*50}/><text x="5" y={244-i*50}>{Math.round(max*i/4)}</text></g>)}<polyline points={points} className={styles.visitorLine}/>{data.daily.map(([date,count],i)=><g key={date}><circle cx={38+i/Math.max(1,data.daily.length-1)*752} cy={240-count/max*200} r="3" className={styles.visitorDot}><title>{date}: {count} journeys</title></circle>{(i===0||i===data.daily.length-1)&&<text x={i===0?38:720} y="265">{date.slice(5)}</text>}</g>)}</svg>
      </Card>
      {[['TRAFFIC SOURCES',data.sources],['DEVICES',data.devices],['CAMPAIGNS',data.campaigns],['LANDING PAGES',data.landings],['DESTINATION CITIES',data.locations]].map(([title,rows])=><Card key={title} title={title}><table><thead><tr><th>NAME</th><th>JOURNEYS</th><th>SHARE</th></tr></thead><tbody>{visible(rows).map(([name,count])=><tr key={name}><td>{name||'Unattributed'}</td><td>{count}</td><td>{data.total?(count/data.total*100).toFixed(1):0}%</td></tr>)}</tbody></table>{!rows.length&&<p className={styles.noEvents}>No recorded activity yet.</p>}</Card>)}
      <Card className={styles.wideCard} title="RECENT JOURNEYS"><table><thead><tr><th>JOURNEY</th><th>SOURCE</th><th>STAGE</th><th>STARTED</th></tr></thead><tbody>{data.recent.filter(row=>!search||`${row.id} ${row.source} ${row.stage}`.toLowerCase().includes(search)).map(row=><tr key={row.id}><td>{row.id.slice(0,8)}</td><td>{row.source}</td><td>{row.stage}</td><td>{new Date(row.time).toLocaleString()}</td></tr>)}</tbody></table>{!data.recent.length&&<p className={styles.noEvents}>No journey activity is collected in this frontend preview.</p>}</Card>
    </div>
  </div>
}
