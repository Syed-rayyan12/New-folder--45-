'use client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '@/lib/backend-api'

const Context=createContext(null)
export const useDashboard=()=>useContext(Context)
const EMPTY={overview:{metrics:{waitlist:0,marks:0,journeys:0,completion:0,corridors:0},origins:[],corridors:[],signals:[]},audience:[],corridors:[],events:[]}

export function DashboardData({children}) {
  const [authenticated,setAuthenticated]=useState(false),[checking,setChecking]=useState(true)
  const [data,setData]=useState(EMPTY),[error,setError]=useState(''),[pending,setPending]=useState(false)
  const refresh=useCallback(async()=>{
    try {
      const [overview,audience,corridors,journal]=await Promise.all([api('/dashboard/overview'),api('/dashboard/audience'),api('/dashboard/corridors'),api('/dashboard/journal')])
      setData({overview,audience:audience.records,corridors:corridors.records,events:journal.events});setError('')
    } catch(error){if(error.status===401)setAuthenticated(false);setError(error.message)}
  },[])
  useEffect(()=>{let active=true;api('/auth/me').then(()=>{if(active){setAuthenticated(true);void refresh()}}).catch(error=>{if(active&&error.status!==401)setError(error.message)}).finally(()=>{if(active)setChecking(false)});return()=>{active=false}},[refresh])
  useEffect(()=>{if(!authenticated)return;const timer=setInterval(()=>void refresh(),15000);return()=>clearInterval(timer)},[authenticated,refresh])
  const login=async event=>{
    event.preventDefault();setPending(true);setError('')
    const fields=new FormData(event.currentTarget)
    try {await api('/auth/login',{method:'POST',body:JSON.stringify(Object.fromEntries(fields))});setAuthenticated(true);await refresh()}
    catch(error){setError(error.message)}finally{setPending(false)}
  }
  const logout=async()=>{try{await api('/auth/logout',{method:'POST'});setAuthenticated(false);setData(EMPTY)}catch(error){setError(error.message)}}
  const mutate=async(path,method,body)=>{try{await api(path,{method,body:body?JSON.stringify(body):undefined});await refresh();return true}catch(error){setError(error.message);return false}}
  if(checking)return <main className="dashboard-login"><p role="status">Connecting to dashboard…</p></main>
  if(!authenticated)return <main className="dashboard-login"><form onSubmit={login}><a href="/">PRVLG</a><h1>Curator sign in</h1><p>Sign in to view your audience and journey activity.</p><label>Email<input type="email" name="email" autoComplete="username" required/></label><label>Password<input type="password" name="password" autoComplete="current-password" required/></label>{error&&<p role="alert">{error}</p>}<button disabled={pending}>{pending?'Signing in…':'Sign in'}</button></form></main>
  return <Context.Provider value={{...data,refresh,mutate,logout}}>{error&&<div className="dashboard-api-error" role="alert">{error}<button onClick={()=>void refresh()}>Retry</button></div>}{children}</Context.Provider>
}
