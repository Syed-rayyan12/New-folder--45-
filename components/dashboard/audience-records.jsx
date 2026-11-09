'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Eye, Pencil, Search, Trash2, X } from 'lucide-react'
import { filterAudience } from './reference-data'
import { useDashboard } from './dashboard-data'
import styles from './records.module.css'

const unique = (rows, field) => [...new Set(rows.map(row => row[field]))].sort()

function ProfileDialog({ action, onClose, onSave, onDelete }) {
  const dialog = useRef(null)
  const { record, mode } = action
  useEffect(() => { dialog.current?.showModal() }, [])
  const save = event => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    onSave({ ...record, origin:String(data.get('origin')).trim(), region:String(data.get('region')).trim(), city:String(data.get('city')).trim(), country:String(data.get('country')).trim(), stage:String(data.get('stage')), source:String(data.get('source')), consent:data.get('consent') === 'on' })
  }
  return <dialog ref={dialog} className={styles.dialog} onClose={onClose} onClick={e => { if (e.target === dialog.current) onClose() }}>
    <header><h2>{mode === 'edit' ? 'EDIT PROFILE' : mode === 'delete' ? 'REMOVE PROFILE' : 'HERITAGE PROFILE'} <span>{record.id}</span></h2><button type="button" onClick={onClose} aria-label="Close profile"><X size={17} /></button></header>
    {mode === 'edit' ? <form onSubmit={save} className={styles.editForm}>
      {['origin','region','city','country'].map(field => <label key={field}>{field === 'city' ? 'Destination city' : field}<input name={field} defaultValue={record[field]} required /></label>)}
      <label>Stage<select name="stage" defaultValue={record.stage}>{['Waitlist','Left after mark','Left after destination'].map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Source<select name="source" defaultValue={record.source}>{['Instagram','TikTok','Direct','Referral','Newsletter'].map(value => <option key={value}>{value}</option>)}</select></label>
      <label className={styles.consent}><input type="checkbox" name="consent" defaultChecked={record.consent} />Contact consent</label>
      <p className={styles.localNote}>Changes are saved to your audience database.</p><button className={styles.outlineButton} type="submit">SAVE PROFILE</button>
    </form> : mode === 'delete' ? <><p className={styles.dialogCopy}>Remove {record.id} from the audience database? You can undo this after removing it.</p><button className={`${styles.outlineButton} ${styles.danger}`} type="button" onClick={() => onDelete(record)}>REMOVE PROFILE</button></> : <dl className={styles.profileDetails}>{[['Name',`${record.fullName} ${record.lastName}`],['Email',record.email],['Phone',record.phone],['Current location',record.location],['Origin',`${record.origin} · ${record.region}`],['Destination',`${record.city} · ${record.country}`],['Stage',record.stage],['Source',record.source],['Mark',record.mark],['Joined',record.joined],['Contact consent',record.consent ? 'Granted' : 'Not granted']].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
  </dialog>
}

export function AudienceRecords({ dashboardSearch = '' }) {
  const {audience:records,mutate}=useDashboard()
  const [search, setSearch] = useState('')
  const [origin, setOrigin] = useState('')
  const [city, setCity] = useState('')
  const [corridor, setCorridor] = useState('')
  const [source, setSource] = useState('')
  const [action, setAction] = useState(null)
  const [removed, setRemoved] = useState(null)
  const filtered = useMemo(() => filterAudience(records, { search:[dashboardSearch,search].filter(Boolean).join(' '), origin,city,corridor,source }), [records,dashboardSearch,search,origin,city,corridor,source])
  const corridorOptions = [...new Set(records.map(row => `${row.origin} → ${row.city}`))].sort()
  const filters = [ ['ORIGIN',origin,setOrigin,unique(records,'origin'),'All origins'], ['DESTINATION CITY',city,setCity,unique(records,'city'),'All cities'], ['CORRIDOR',corridor,setCorridor,corridorOptions,'All corridors'], ['SOURCE',source,setSource,unique(records,'source'),'All sources'] ]
  return <div className={styles.audiencePage}>
    <header className={styles.pageHead}><div><h1>AUDIENCE RECORDS</h1><p>Search And Explore Individual Heritage Profiles.</p></div><span>{records.length} Profiles | {records.filter(row=>row.consent).length} With Contact Consent</span></header>
    <section className={`${styles.filters} ${styles.audienceFilters}`} aria-label="Audience filters">
      <label className={styles.searchFilter}>SEARCH<div><Search size={13} /><input aria-label="Search audience records" placeholder="ID, Place, Mark Source" value={search} onChange={e => setSearch(e.target.value)} /></div></label>
      {filters.map(([label,value,setValue,options,placeholder]) => <label key={label}>{label}<select aria-label={label} value={value} onChange={e => setValue(e.target.value)}><option value="">{placeholder}</option>{options.map(option => <option key={option}>{option}</option>)}</select></label>)}
    </section>
    <div className={styles.tableScroll}><table className={styles.audienceTable}><thead><tr>{['PROFILE','ORIGIN','DESTINATION','STAGE','SOURCE','MARK','JOINED','ACTIONS'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{filtered.map(record => <tr key={record.id}>
      <td className={styles.recordId}><button type="button" onClick={() => setAction({mode:'view',record})}>{record.id}</button></td>
      <td>{record.origin}<small>{record.region}</small></td><td>{record.city}<small>{record.country}</small></td>
      <td><span className={`${styles.stage} ${record.stage === 'Waitlist' ? styles.waitlist : ''}`}><i />{record.stage}</span></td><td>{record.source}</td><td className={styles.mark}>{record.mark}</td><td className={styles.joined}>{record.joined}</td>
      <td><div className={styles.rowActions}><button type="button" title="View profile" aria-label={`View ${record.id}`} onClick={() => setAction({mode:'view',record})}><Eye size={15} /></button><button type="button" className={styles.editAction} title="Edit profile" aria-label={`Edit ${record.id}`} onClick={() => setAction({mode:'edit',record})}><Pencil size={14} /></button><button type="button" className={styles.deleteAction} title="Remove profile" aria-label={`Remove ${record.id}`} onClick={() => setAction({mode:'delete',record})}><Trash2 size={14} /></button></div></td>
    </tr>)}</tbody></table>{filtered.length === 0 && <div className={styles.noResults}>No profiles match these filters.<button type="button" onClick={() => { setSearch('');setOrigin('');setCity('');setCorridor('');setSource('') }}>Reset audience filters</button></div>}</div>
    <footer className={styles.tableFooter}><span>Showing {filtered.length} of {records.length}</span>{removed && <span role="status">{removed.id} removed <button type="button" onClick={async() => {if(await mutate(`/dashboard/audience/${removed.id}/restore`,'POST'))setRemoved(null)}}>Undo</button></span>}</footer>
    {action && <ProfileDialog key={`${action.mode}-${action.record.id}`} action={action} onClose={() => setAction(null)} onSave={async record => {if(await mutate(`/dashboard/audience/${record.id}`,'PATCH',record)){setAction(null)}}} onDelete={async record => {if(await mutate(`/dashboard/audience/${record.id}`,'DELETE')){setRemoved(record);setAction(null)}}} />}
  </div>
}
