import { DEFAULT_MOCKUPS } from '@/lib/mockups'

export const runtime='nodejs'
export const dynamic='force-dynamic'

/** Keep old image links working without bundling public images into the function. */
export async function GET(request){
  const file=new URL(request.url).searchParams.get('file')||''
  const asset=DEFAULT_MOCKUPS.find(item=>decodeURIComponent(item.src.slice(1))===file)
  if(!asset)return new Response('Not found',{status:404})
  return Response.redirect(new URL(asset.src,request.url),307)
}
