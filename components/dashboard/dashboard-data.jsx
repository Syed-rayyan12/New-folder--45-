'use client'
import { createContext, useContext } from 'react'
const Context=createContext(null)
export const useDashboard=()=>useContext(Context)
const EMPTY={overview:{metrics:{waitlist:0,marks:0,journeys:0,completion:0,corridors:0},origins:[],corridors:[],signals:[]},audience:[],corridors:[],events:[]}
/** Frontend preview: no authentication, network calls, or visitor records. */
export function DashboardData({children}) {
  return <Context.Provider value={{...EMPTY,refresh:async()=>{},mutate:async()=>false}}>{children}</Context.Provider>
}
