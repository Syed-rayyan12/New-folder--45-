import { usesLocalBackend } from './backend-mode'

export async function api(path:string, options:RequestInit={}) {
  if(!usesLocalBackend())throw new Error('This action is available in the local dashboard only.')
  const response=await fetch(`/api/backend${path}`,{...options,credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json',...options.headers}})
  const data=await response.json().catch(()=>({error:'The server returned an invalid response.'}))
  if(!response.ok)throw Object.assign(new Error(data.error || 'Request failed.'),{status:response.status,fields:data.fields})
  return data
}
