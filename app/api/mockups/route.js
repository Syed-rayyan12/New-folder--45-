import { DEFAULT_MOCKUPS } from '@/lib/mockups'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** The studio serves the supplied T-shirt, hoodie and sweater OBJ models. */
export async function GET() {
  return Response.json({mockups:DEFAULT_MOCKUPS},{headers:{'Cache-Control':'no-store'}})
}
