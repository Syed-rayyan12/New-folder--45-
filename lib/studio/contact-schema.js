import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(100),
  email: z.email('Please enter a valid email address.').max(254),
  company: z.string().trim().max(150).optional().default(''),
  service: z.enum(['Website design & development', 'E-commerce website', 'Pro system', 'Branding', 'Not sure yet']),
  budget: z.enum(['Let’s discuss', 'Under £2,500', '£2,500–£5,000', '£5,000–£10,000', '£10,000+']),
  message: z.string().trim().min(20, 'Tell us a little more (at least 20 characters).').max(5000),
  consent: z.literal(true, { error: 'Please agree so we can respond to your enquiry.' }),
  website: z.string().max(0).optional().default(''),
})
