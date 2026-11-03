'use client'

import { useEffect, useRef, useState } from 'react'
import { Save, ShieldCheck, Trash2, X } from 'lucide-react'
import styles from './settings-page.module.css'

const STORAGE_KEY = 'prvlg-dashboard-profile-v1'
const EMPTY_PROFILE = { accountEmail:'', email:'', phone:'', language:'' }

function AccountNotice({ kind, onClose }) {
  const dialog = useRef(null)
  useEffect(() => { dialog.current?.showModal() }, [])
  return <dialog ref={dialog} className={styles.notice} onClose={onClose} aria-labelledby="settings-notice-title">
    <header><h2 id="settings-notice-title">{kind === 'two-factor' ? 'Two-Factor Authentication' : 'Delete Account'}</h2><button type="button" onClick={onClose} aria-label="Close account notice"><X size={17}/></button></header>
    <p>{kind === 'two-factor' ? 'Two-factor authentication is unavailable in this preview. No account security settings have been changed.' : 'Account deletion is unavailable in this preview. No account or saved data has been deleted.'}</p>
    <button type="button" className={styles.secondaryButton} onClick={onClose}>Close</button>
  </dialog>
}

export function SettingsPage() {
  const [profile,setProfile] = useState(EMPTY_PROFILE)
  const [saved,setSaved] = useState(false)
  const [feedback,setFeedback] = useState('')
  const [passwordFeedback,setPasswordFeedback] = useState('')
  const [notice,setNotice] = useState(null)
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
      if (stored && typeof stored === 'object') setProfile(Object.fromEntries(Object.keys(EMPTY_PROFILE).map(key => [key,typeof stored[key] === 'string' ? stored[key] : ''])))
    } catch { /* Empty fields remain available when browser storage is blocked. */ }
  }, [])
  const change = event => { setProfile(current => ({...current,[event.target.name]:event.target.value}));setSaved(false);setFeedback('') }
  const save = event => {
    event.preventDefault()
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify(profile));setSaved(true);setFeedback('Changes saved on this device.') }
    catch { setSaved(false);setFeedback('Changes could not be saved on this device. Please try again.') }
  }
  const password = event => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const next = String(data.get('newPassword') || '')
    if (next.length < 10 || !/\d/.test(next) || !/[^A-Za-z0-9\s]/.test(next)) { setPasswordFeedback('Use at least 10 characters with a number and symbol.');return }
    if (next !== data.get('confirmPassword')) { setPasswordFeedback('The new passwords do not match.');return }
    // Credentials are never persisted, logged, or sent without an account service.
    form.reset()
    setPasswordFeedback('Password changes are unavailable in this preview. No password has been changed or saved.')
  }
  return <div className={styles.page}>
    <header className={styles.pageHead}><div><h1>ACCOUNT SETTINGS</h1><p>Account, Security And Privacy Controls For Your Platform.</p></div><button type="submit" form="settings-profile" className={styles.saveButton}><Save size={13}/>{saved ? 'Changes Saved' : 'Save Changes'}</button></header>
    <div className={styles.body}>
      <div className={styles.formGrid}>
        <section className={styles.card} aria-labelledby="account-settings-heading"><header><h2 id="account-settings-heading">ACCOUNT SETTINGS</h2></header><form id="settings-profile" onSubmit={save} className={styles.form}>
          <label>ACCOUNT EMAIL<input aria-label="Account email" type="email" name="accountEmail" autoComplete="username" value={profile.accountEmail} onChange={change}/></label>
          <label>EMAIL ADDRESS<input aria-label="Email address" type="email" name="email" autoComplete="email" value={profile.email} onChange={change}/></label>
          <label>PHONE NUMBER<input aria-label="Phone number" type="tel" name="phone" autoComplete="tel" value={profile.phone} onChange={change}/></label>
          <label>LISTING LANGUAGE<input aria-label="Listing language" name="language" list="settings-languages" value={profile.language} onChange={change}/><datalist id="settings-languages">{['English','Spanish','French','Portuguese','Arabic','Urdu'].map(language => <option key={language} value={language}/>)}</datalist></label>
          {feedback && <p role="status" className={saved ? styles.success : styles.feedback}>{feedback}</p>}
        </form></section>
        <section className={styles.card} aria-labelledby="change-password-heading"><header><h2 id="change-password-heading">CHANGE PASSWORD</h2></header><form onSubmit={password} className={styles.form}>
          <label>CURRENT PASSWORD<input aria-label="Current password" type="password" name="currentPassword" autoComplete="current-password" placeholder="••••••••••" required onChange={() => setPasswordFeedback('')}/></label>
          <label>NEW PASSWORD<input aria-label="New password" type="password" name="newPassword" autoComplete="new-password" placeholder="••••••••••" minLength={10} required onChange={() => setPasswordFeedback('')}/><span className={styles.passwordHint}>At least 10 characters with a number and symbol.</span></label>
          <label>CONFIRM NEW PASSWORD<input aria-label="Confirm new password" type="password" name="confirmPassword" autoComplete="new-password" placeholder="••••••••••" minLength={10} required onChange={() => setPasswordFeedback('')}/></label>
          <button type="submit" className={styles.secondaryButton}>Update Password</button>
          {passwordFeedback && <p role="status" className={styles.feedback}>{passwordFeedback}</p>}
        </form></section>
      </div>
      <section className={styles.securityRow} aria-labelledby="two-factor-heading"><ShieldCheck size={16} className={styles.green}/><div><h2 id="two-factor-heading">Two-Factor Authentication</h2><p>Currently off. Recommended for accounts holding client records.</p></div><button type="button" className={styles.enableButton} onClick={() => setNotice('two-factor')}>Enable</button></section>
      <section className={styles.securityRow} aria-labelledby="delete-account-heading"><Trash2 size={16} className={styles.red}/><div><h2 id="delete-account-heading">Delete Account</h2><p>Once you delete your account, there is no going back. Please be certain.</p></div><button type="button" className={styles.deleteButton} onClick={() => setNotice('delete')}>Delete My Account</button></section>
    </div>
    {notice && <AccountNotice key={notice} kind={notice} onClose={() => setNotice(null)}/>}
  </div>
}
