'use client'

import { useEffect, useState } from 'react'
import { CheckCheck, Hexagon, Route, TriangleAlert, Users } from 'lucide-react'
import styles from './workspace-pages.module.css'

const EVENTS=[
  {id:'waitlist',category:'Audience',label:'Audience',title:'New Waitlist Signup',description:'A new audience member has joined the waitlist.',time:'2 min ago',unread:true},
  {id:'mark',category:'Generated Marks',label:'Generated Mark',title:'PRVLG Mark Generated',description:'A unique geometric mark has been generated for a new heritage journey.',time:'14 min ago',unread:true},
  {id:'corridor',category:'Corridors',label:'Corridors',title:'Corridor Activity Increased',description:'Audience activity on a tracked origin-to-destination corridor has increased.',time:'32 min ago',unread:false},
  {id:'journey',category:'Audience',label:'Audience Journey',title:'Journey Incomplete',description:'A visitor left the entry experience after the mark was generated.',time:'1 hour ago',unread:false},
  {id:'milestone',category:'Audience',label:'Audience Milestone',title:'Waitlist Milestone Reached',description:'The waitlist has reached a configured audience milestone.',time:'2 hour ago',unread:false},
  {id:'system',category:'System Alerts',label:'System Alert',title:'Data Capture Requires Review',description:'A data capture event could not be recorded. Review the system logs to identify the cause.',time:'2 hours ago',unread:true},
]
const STORAGE='prvlg-reference-journal-v1'
export function JournalPage({dashboardSearch=''}) {
  const [events,setEvents]=useState(EVENTS),[hiddenUnread,setHiddenUnread]=useState(9),[loaded,setLoaded]=useState(false)
  const [category,setCategory]=useState('All Activity'),[status,setStatus]=useState('All')
  useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');if(saved&&Array.isArray(saved.readIds)){setEvents(EVENTS.map(row=>({...row,unread:!saved.readIds.includes(row.id)})));setHiddenUnread(typeof saved.hiddenUnread==='number'?saved.hiddenUnread:9)}}catch{}setLoaded(true)},[])
  useEffect(()=>{if(loaded){try{localStorage.setItem(STORAGE,JSON.stringify({readIds:events.filter(row=>!row.unread).map(row=>row.id),hiddenUnread}))}catch{}}},[events,hiddenUnread,loaded])
  const filtered=events.filter(row=>(category==='All Activity'||row.category===category)&&(status==='All'||(status==='Unread'?row.unread:!row.unread))&&(!dashboardSearch||`${row.label} ${row.title} ${row.description}`.toLowerCase().includes(dashboardSearch.toLowerCase())))
  const unread=hiddenUnread+events.filter(row=>row.unread).length
  const markAll=()=>{setEvents(rows=>rows.map(row=>({...row,unread:false})));setHiddenUnread(0)}
  return <div className={styles.page}><header className={styles.pageHead}><div><h1>JOURNAL ACTIVITY & NOTIFICATIONS</h1><p>A Live Record Of Audience Activity, Heritage Journeys And Platform Events.</p></div><button type="button" className={styles.markAll} onClick={markAll} disabled={unread===0}><CheckCheck size={14}/>{unread===0?'All Read':'Mark All as Read'}</button></header>
    <section className={styles.metrics} aria-label="Journal summary"><div><h2>TOTAL EVENTS</h2><i/><strong>248</strong><p className={styles.mono}>All recorded activity</p></div><div><h2>UNREAD</h2><strong aria-live="polite">{unread}</strong><p>Require Attention</p></div><div><h2>AUDIENCE EVENTS</h2><strong>186</strong><p>Journey And Waitlist Activity</p></div><div><h2>SYSTEM ALERTS</h2><strong>03</strong><p>Platform Events Requiring Review</p></div></section>
    <section className={styles.journalFilters} aria-label="Journal filters"><div><h2>CATEGORY</h2><div className={styles.categoryTabs} role="group" aria-label="Event category">{['All Activity','Audience','Corridors','Generated Marks','System Alerts'].map(value=><button type="button" key={value} aria-pressed={category===value} onClick={()=>setCategory(value)}>{value}</button>)}</div></div><div className={styles.statusFilter}><span>Status</span><div className={styles.segmented} role="group" aria-label="Read status">{['All','Unread','Read'].map(value=><button type="button" key={value} aria-pressed={status===value} onClick={()=>setStatus(value)}>{value}</button>)}</div></div></section>
    <section className={styles.journalTimeline}><header><h2>NOTIFICATION TIMELINE</h2><span>{filtered.length} events</span></header><ul>{filtered.map(row=>{const Icon=row.category==='System Alerts'?TriangleAlert:row.category==='Generated Marks'?Hexagon:row.category==='Corridors'?Route:Users;return <li key={row.id}><div className={styles.eventCopy}><span className={`${styles.eventCategory} ${row.category==='System Alerts'?styles.warning:''}`}><Icon size={12}/>{row.label}</span><h3 className={row.unread?styles.unreadTitle:''}>{row.unread&&<i/>}{row.title}</h3><p>{row.description}</p></div><div className={styles.eventStatus}><button type="button" className={row.unread?styles.unreadBadge:styles.readBadge} onClick={()=>setEvents(rows=>rows.map(event=>event.id===row.id?{...event,unread:!event.unread}:event))} aria-label={`Mark ${row.title} as ${row.unread?'read':'unread'}`}>{row.unread?'Unread':'Read'}</button><time>{row.time}</time></div></li>})}</ul>{filtered.length===0&&<p className={styles.noEvents}>No events match the selected filters.</p>}</section>
  </div>
}
