import { DEFAULT_MOCKUPS } from '@/lib/mockups'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** The studio presents only the three selected original garment images. */
export async function GET() {
  const mockups=DEFAULT_MOCKUPS.map(asset=>({...asset,src:'/api/mockups/image?file='+encodeURIComponent(decodeURIComponent(asset.src.slice(1)))}))
  return Response.json({mockups},{headers:{'Cache-Control':'no-store'}})
}
