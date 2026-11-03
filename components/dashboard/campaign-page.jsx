'use client'

import { useState } from 'react'
import { Monitor, Smartphone, Tablet } from 'lucide-react'
import styles from './workspace-pages.module.css'

const SOURCES=[['Instagram',4820,37.5],['Direct',3210,25],['Google Search',2440,19],['Referral',1540,12],['Other',830,6.5]]
const ACTIVITY=[['Journey started','VS-8F21A','Instagram','2 min ago'],['Origin selected','VS-3C07D','Direct','5 min ago'],['Mark generated','VS-91B4E','Google','8 min ago'],['Waitlist joined','VS-5DA62','Instagram','12 min ago'],['Journey abandoned','VS-E7709','Referral','16 min ago']]
const LOCATIONS=[['Dubai','United Arab Emirates',2940],['Karachi','Pakistan',2180],['London','United Kingdom',1860],['New York','United States',1420],['Riyadh','Saudi Arabia',1150]]
const CAMPAIGNS=[['Founding Members','Instagram',3980,214,'5.4%'],['Origin Story Teaser','Instagram',840,38,'4.5%'],['Private Invite','Referral',1540,126,'8.2%'],['Brand Search','Google',2440,108,'4.4%']]
const LANDINGS=[['Home','/',6120,7480],['Entry experience','/enter',3340,4120],['Choose your origin','/origin',1620,1940],['Your mark','/mark',1060,1290],['Waitlist','/waitlist',700,790]]
const number=value=>value.toLocaleString('en-US')

function Card({ title, subtitle, children, className='', extra }) {
  return <section className={`${styles.card} ${className}`}><header className={styles.cardHead}><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>{extra}</header>{children}</section>
}

export function CampaignPage({ dashboardSearch='' }) {
  const [period,setPeriod]=useState('7 Days')
  const [range,setRange]=useState({from:'2026-10-10',to:'2026-10-16'})
  const [showSessions,setShowSessions]=useState(true)
  const [hover,setHover]=useState(null)
  const search=dashboardSearch.trim().toLowerCase()
  const visible=rows=>rows.filter(row=>!search||row.join(' ').toLowerCase().includes(search))
  const scale=period==='Last 24 Hours'?0.7:period==='30 Days'?1.8:period==='Custom Range'?Math.max(.3,Math.min(3,(Date.parse(range.to)-Date.parse(range.from))/86400000/7+1/7)):1
  const visitors=[24,15,9,20,50,85,118,130,142,177,200,107].map(value=>Math.round(value*scale))
  const sessions=[28,22,15,24,60,100,146,158,180,224,250,145].map(value=>Math.round(value*scale))
  const max=260*scale
  const point=(value,i)=>[38+i/11*752,240-value/max*200]
  const points=values=>values.map((value,i)=>point(value,i).join(',')).join(' ')
  return <div className={styles.page}>
    <header className={styles.pageHead}><div><h1>CAMPAIGN</h1><p>See Who Visited The Website, When They Came, How Long They Stayed And Where They Came From.</p></div><span>Updated just now · Oct 16, 2026</span></header>
    <section className={styles.metrics} aria-label="Campaign summary"><div><h2>TOTAL VISITORS</h2><i/><strong>12,840</strong><p><em>↑ 12.4%</em> <span className={styles.mono}>vs. previous 30 days</span></p></div><div><h2>LIVE VISITORS</h2><strong>24</strong><p>Currently Active</p></div><div><h2>AVG. SESSION</h2><strong>04:32</strong><p>Minutes Per Visit</p></div><div><h2>TOTAL SESSIONS</h2><strong>15,620</strong><p>Website Visits</p></div></section>
    <div className={styles.campaignGrid}>
      <Card className={styles.trafficCard} title="VISITOR TRAFFIC" subtitle={`${period==='7 Days'?'Last 7 days':period} · visitors over time`} extra={<div className={styles.segmented} role="group" aria-label="Traffic date range">{['Last 24 Hours','7 Days','30 Days','Custom Range'].map(value=><button type="button" key={value} aria-pressed={period===value} onClick={()=>{setPeriod(value);setHover(null)}}>{value}</button>)}</div>}>
        {period==='Custom Range'&&<div className={styles.dateRange}><label>From<input type="date" aria-label="Traffic start date" value={range.from} max={range.to} onChange={e=>setRange({...range,from:e.target.value||range.from})}/></label><label>To<input type="date" aria-label="Traffic end date" value={range.to} min={range.from} onChange={e=>setRange({...range,to:e.target.value||range.to})}/></label></div>}
        <div className={styles.trafficTotals}><div><span>VISITORS</span><strong>{number(Math.round(1033*scale))}</strong></div><div><span>SESSIONS</span><strong>{number(Math.round(1276*scale))}</strong></div><div className={styles.legend}><span><i/>Visitors</span><button type="button" aria-pressed={showSessions} onClick={()=>setShowSessions(!showSessions)}><i/>Sessions</button></div></div>
        <svg className={styles.trafficChart} viewBox="0 0 820 270" role="img" aria-label={`Illustrative visitor and session traffic for ${period}`}><title>{`Visitor traffic - ${period}`}</title>{[0,1,2,3,4].map(i=><g key={i}><line x1="38" x2="790" y1={240-i*50} y2={240-i*50}/><text x="16" y={244-i*50}>{Math.round(max*i/4)}</text></g>)}{showSessions&&<polyline points={points(sessions)} className={styles.sessionsLine}/>}<polyline points={points(visitors)} className={styles.visitorLine}/>{visitors.map((value,i)=>{const [x,y]=point(value,i);return <g key={i} onPointerEnter={()=>setHover(i)} onPointerLeave={()=>setHover(null)}><circle cx={x} cy={y} r="4" className={styles.visitorDot}/><circle cx={x} cy={y} r="13" fill="transparent"/><text x={x-8} y="258">{String(i*2).padStart(2,'0')}.00</text></g>})}{hover!==null&&<g transform={`translate(${Math.min(660,Math.max(40,point(visitors[hover],hover)[0]-50))},${Math.max(5,point(visitors[hover],hover)[1]-42)})`}><rect width="124" height="28" rx="3" fill="#172018" stroke="#67F16355"/><text x="9" y="18" className={styles.chartTooltip}>{visitors[hover]} visitors · {sessions[hover]} sessions</text></g>}</svg><footer className={styles.cardFoot}>Illustrative visitor traffic</footer>
      </Card>
      <Card className={styles.hourlyCard} title="HOURLY & DAILY VISITORS" subtitle="Rolling windows"><table><thead><tr><th>TIME PERIOD</th><th>VISITORS</th><th>SESSIONS</th></tr></thead><tbody>{[['Last 60 minutes',86,104],['Last 24 hours',1240,1560],['Today',1840,2210],['Last 7 days',8420,10680],['Last 30 days',12840,15620],['Last 3 Months',12840,4210]].map(([label,a,b],i)=><tr key={label}><td>{i===0&&<i className={styles.liveDot}/>} {label}</td><td>{number(a)}</td><td>{number(b)}</td></tr>)}</tbody></table></Card>
      <Card title="TRAFFIC SOURCES" subtitle="Where Visitors Came From · 30 Days"><table><thead><tr><th>SOURCE</th><th>VISITORS</th><th>SHARE</th></tr></thead><tbody>{visible(SOURCES).map(([label,count,share],i)=><tr key={label}><td>{label}<span className={styles.sourceTrack}><span style={{width:`${share/37.5*100}%`,background:i===0?'#67F163':'#626862'}}/></span></td><td>{number(count)}</td><td className={i===0?styles.green:''}>{share.toFixed(1)}</td></tr>)}</tbody></table></Card>
      <Card title="Visitor activity & engagement" subtitle="How deep visitors go" className={styles.engagementCard}><table><thead><tr><th>METRIC</th><th>VALUE</th></tr></thead><tbody>{[['Average time on website','04m 32s'],['Pages per session','3.8'],['Entry experience completion','61.2%'],['Journey drop-off rate','38.8%'],['Waitlist signups','486']].map(([label,value],i)=><tr key={label}><td>{label}</td><td className={i===2||i===4?styles.green:i===3?styles.red:''}>{value}</td></tr>)}</tbody></table><div className={styles.completion}><span>Completed journey</span><span>Dropped off</span><div><i/><i/></div></div></Card>
      <Card title="DEVICES" subtitle="Visitor Share By Device"><div className={styles.devices}><div className={styles.deviceTrack}><i/><i/><i/></div>{[[Smartphone,'Mobile',8218,64],[Monitor,'Desktop',3724,29],[Tablet,'Tablet',898,7]].map(([Icon,label,count,share],i)=><div className={styles.deviceRow} key={label}><i style={{background:['#67F163','#8A908C','#eee'][i]}}/><Icon size={14}/><span>{label}</span><small>{number(count)}</small><strong className={i===0?styles.green:''}>{share}%</strong></div>)}</div></Card>
      <Card className={styles.wideCard} title="RECENT VISITOR ACTIVITY" subtitle="Anonymous Sessions · Live Feed"><table><thead><tr><th>VISITOR / EVENT</th><th>SOURCE</th><th>TIME</th></tr></thead><tbody>{visible(ACTIVITY).map(([label,id,source,time],i)=><tr key={id}><td><i className={`${styles.activityDot} ${i===2||i===3?styles.greenDot:i===4?styles.redDot:''}`}/>{label}<small className={styles.sessionId}>{id}</small></td><td>{source}</td><td>{time}</td></tr>)}</tbody></table></Card>
      <Card title="TOP LOCATIONS" subtitle="By Visitors · 30 Days"><table><thead><tr><th>COUNTRY / CITY</th><th>VISITORS</th></tr></thead><tbody>{visible(LOCATIONS).map(([name,country,count])=><tr key={name}><td>{name}<small>{country}</small></td><td>{number(count)}</td></tr>)}</tbody></table></Card>
      <Card className={styles.wideCard} title="CAMPAIGN PERFORMANCE" subtitle="Signups Attributed Per Campaign" extra={<span className={styles.futureBadge}>Future phase</span>}><table><thead><tr>{['CAMPAIGN','SOURCE','VISITORS','SIGNUPS','CONV. RATE'].map(label=><th key={label}>{label}</th>)}</tr></thead><tbody>{visible(CAMPAIGNS).map(([name,source,count,signups,rate])=><tr key={name}><td>{name}</td><td>{source}</td><td>{number(count)}</td><td>{signups}</td><td className={styles.green}>{rate}</td></tr>)}</tbody></table></Card>
      <Card title="TOP LANDING PAGES" subtitle="First Page Of Each Session"><table><thead><tr><th>PAGE</th><th>VISITORS</th><th>SESSIONS</th></tr></thead><tbody>{visible(LANDINGS).map(([name,path,count,sessions])=><tr key={path}><td>{name}<small className={styles.mono}>{path}</small></td><td>{number(count)}</td><td>{number(sessions)}</td></tr>)}</tbody></table></Card>
    </div>
  </div>
}
