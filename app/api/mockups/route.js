import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { DEFAULT_MOCKUPS } from '@/lib/mockups'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const discovered=[]
  const scan=async(relative,depth=0)=>{
    if(depth>2||discovered.length>=60)return
    let entries
    try{entries=await readdir(path.join(process.cwd(),'public',relative),{withFileTypes:true})}catch{return}
    for(const entry of entries.sort((a,b)=>a.name.localeCompare(b.name))){
      if(entry.name.startsWith('.'))continue
      const file=path.posix.join(relative,entry.name)
      if(entry.isDirectory())await scan(file,depth+1)
      else if(entry.isFile()&&/\.(png|webp|jpe?g|avif)$/i.test(entry.name)){
        const src='/'+file.split('/').map(encodeURIComponent).join('/')
        const known=DEFAULT_MOCKUPS.find(item=>item.src===src)
        discovered.push(known||{id:file,name:entry.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),src})
      }
    }
  }
  await scan('mockups')
  await scan('images/mockups')
  const mockups=[DEFAULT_MOCKUPS[0],...discovered.filter(item=>item.src!==DEFAULT_MOCKUPS[0].src)]
  return Response.json({mockups},{headers:{'Cache-Control':'no-store'}})
}
