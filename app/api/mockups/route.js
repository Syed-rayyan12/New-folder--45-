import { DEFAULT_MOCKUPS } from '@/lib/mockups'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** The studio presents only the three selected original garment images. */
export async function GET() {
  return Response.json({mockups:DEFAULT_MOCKUPS},{headers:{'Cache-Control':'no-store'}})
}
