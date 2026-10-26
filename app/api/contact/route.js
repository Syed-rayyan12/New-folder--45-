import { Resend } from 'resend'
import { contactSchema } from '@/lib/studio/contact-schema'

export const runtime = 'nodejs'
const requests = new Map()
const WINDOW = 15 * 60 * 1000

export async function POST(request) {
  const origin = request.headers.get('origin')
  const allowed = new URL(process.env.SITE_URL || request.url).origin
  if (!origin || origin !== allowed) return Response.json({ error: 'This request could not be verified.' }, { status: 403 })
  // A bounded, best-effort instance-local limiter. Use shared storage at scale.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const now = Date.now()
  for (const [key, entry] of requests) if (entry.expires < now) requests.delete(key)
  const current = requests.get(ip)
  if (current && current.count >= 5) return Response.json({ error: 'Please wait a few minutes before trying again.' }, { status: 429, headers: { 'Retry-After': '900' } })
  if (requests.size >= 5000 && !current) return Response.json({ error: 'Please try again shortly.' }, { status: 503 })
  requests.set(ip, { count: (current?.count || 0) + 1, expires: current?.expires || now + WINDOW })
  if (!request.headers.get('content-type')?.includes('application/json')) return Response.json({ error: 'Expected a JSON request.' }, { status: 415 })
  let data
  try {
    // Limit the body before allocating or parsing an unbounded payload.
    const reader = request.body?.getReader()
    if (!reader) throw new Error('Empty body')
    const chunks = []; let size = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 24000) { await reader.cancel(); return Response.json({ error: 'Your message is too large.' }, { status: 413 }) }
      chunks.push(value)
    }
    data = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch { return Response.json({ error: 'Please check your form and try again.' }, { status: 400 }) }
  const parsed = contactSchema.safeParse(data)
  if (!parsed.success) return Response.json({ error: 'Please check the highlighted fields.', fields: parsed.error.flatten().fieldErrors }, { status: 400 })
  const { name, email, company, service, budget, message } = parsed.data
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_TO_EMAIL || !process.env.CONTACT_FROM_EMAIL) return Response.json({ error: 'Email delivery is not configured yet. Please try again later.' }, { status: 503 })
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL,
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `New website enquiry — ${name.replace(/[\r\n]/g, ' ')}`,
      text: `Name: ${name}\nEmail: ${email}\nCompany: ${company || 'Not provided'}\nService: ${service}\nBudget: ${budget}\n\n${message}`,
    })
    if (error) throw new Error('Email provider error')
    return Response.json({ success: true })
  } catch { return Response.json({ error: 'We could not send your enquiry. Please try again shortly.' }, { status: 502 }) }
}
