import { readFile, realpath, stat } from 'node:fs/promises'
import path from 'node:path'

export const runtime='nodejs'
export const dynamic='force-dynamic'
const TYPES={'.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.avif':'image/avif'}
const inside=(file,root)=>{const normalize=value=>process.platform==='win32'?value.toLowerCase():value;return normalize(file).startsWith(normalize(root)+path.sep)}

/** Serve newly added mockups without relying on Next's startup public-file index. */
export async function GET(request){
  const file=new URL(request.url).searchParams.get('file')||''
  const extension=path.extname(file).toLowerCase()
  if(!TYPES[extension])return new Response('Unsupported image',{status:400})
  const publicRoot=path.resolve(process.cwd(),'public')
  const candidate=path.resolve(publicRoot,file)
  const roots=[path.join(publicRoot,'mockups'),path.join(publicRoot,'images','mockups'),path.join(publicRoot,'images')]
  const root=roots.find(value=>inside(candidate,value))
  if(!root)return new Response('Not found',{status:404})
  try{
    const [actual,actualRoot]=await Promise.all([realpath(candidate),realpath(root)])
    if(!inside(actual,actualRoot))return new Response('Not found',{status:404})
    const info=await stat(actual)
    if(!info.isFile())return new Response('Not found',{status:404})
    if(info.size>25*1024*1024)return new Response('Image is too large',{status:413})
    const bytes=await readFile(actual)
    return new Response(bytes,{headers:{'Content-Type':TYPES[extension],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})
  }catch{return new Response('Not found',{status:404})}
}
