'use client'

import { useEffect, useState } from 'react'
import { CheckCheck, Hexagon, Route, TriangleAlert, Users } from 'lucide-react'
import { useDashboard } from './dashboard-data'
import styles from './workspace-pages.module.css'

export function JournalPage({dashboardSearch=''}) {
  const {events,mutate}=useDashboard()
  const [category,setCategory]=useState('All Activity'),[status,setStatus]=useState('All')
  const filtered=events.filter(row=>(category==='All Activity'||row.category===category)&&(status==='All'||(status==='Unread'?row.unread:!row.unread))&&(!dashboardSearch||`${row.label} ${row.title} ${row.description}`.toLowerCase().includes(dashboardSearch.toLowerCase())))
  const unread=events.filter(row=>row.unread).length
  const markAll=()=>mutate('/dashboard/journal/read-all','POST')
  return <div className={styles.page}><header className={styles.pageHead}><div><h1>JOURNAL ACTIVITY & NOTIFICATIONS</h1><p>A Live Record Of Audience Activity, Heritage Journeys And Platform Events.</p></div><button type="button" className={styles.markAll} onClick={markAll} disabled={unread===0}><CheckCheck size={14}/>{unread===0?'All Read':'Mark All as Read'}</button></header>
    <section className={styles.metrics} aria-label="Journal summary"><div><h2>TOTAL EVENTS</h2><i/><strong>{events.length}</strong><p className={styles.mono}>All recorded activity</p></div><div><h2>UNREAD</h2><strong aria-live="polite">{unread}</strong><p>Require Attention</p></div><div><h2>AUDIENCE EVENTS</h2><strong>{events.filter(row=>row.category==='Audience').length}</strong><p>Journey And Waitlist Activity</p></div><div><h2>SYSTEM ALERTS</h2><strong>{events.filter(row=>row.category==='System Alerts').length}</strong><p>Platform Events Requiring Review</p></div></section>
    <section className={styles.journalFilters} aria-label="Journal filters"><div><h2>CATEGORY</h2><div className={styles.categoryTabs} role="group" aria-label="Event category">{['All Activity','Audience','Corridors','Generated Marks','System Alerts'].map(value=><button type="button" key={value} aria-pressed={category===value} onClick={()=>setCategory(value)}>{value}</button>)}</div></div><div className={styles.statusFilter}><span>Status</span><div className={styles.segmented} role="group" aria-label="Read status">{['All','Unread','Read'].map(value=><button type="button" key={value} aria-pressed={status===value} onClick={()=>setStatus(value)}>{value}</button>)}</div></div></section>
    <section className={styles.journalTimeline}><header><h2>NOTIFICATION TIMELINE</h2><span>{filtered.length} events</span></header><ul>{filtered.map(row=>{const Icon=row.category==='System Alerts'?TriangleAlert:row.category==='Generated Marks'?Hexagon:row.category==='Corridors'?Route:Users;return <li key={row.id}><div className={styles.eventCopy}><span className={`${styles.eventCategory} ${row.category==='System Alerts'?styles.warning:''}`}><Icon size={12}/>{row.label}</span><h3 className={row.unread?styles.unreadTitle:''}>{row.unread&&<i/>}{row.title}</h3><p>{row.description}</p></div><div className={styles.eventStatus}><button type="button" className={row.unread?styles.unreadBadge:styles.readBadge} onClick={()=>mutate(`/dashboard/journal/${row.id}`,'PATCH',{unread:!row.unread})} aria-label={`Mark ${row.title} as ${row.unread?'read':'unread'}`}>{row.unread?'Unread':'Read'}</button><time>{row.time}</time></div></li>})}</ul>{filtered.length===0&&<p className={styles.noEvents}>No events match the selected filters.</p>}</section>
  </div>
}
