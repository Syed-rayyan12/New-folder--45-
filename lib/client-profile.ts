import { z } from 'zod'

export const clientProfileSchema=z.object({
  fullName:z.string().trim().min(2,'Enter your full name.').max(100),
  lastName:z.string().trim().min(1,'Enter your last name.').max(100),
  email:z.string().trim().email('Enter a valid email address.').max(254),
  phone:z.string().trim().regex(/^[+\d\s().-]+$/,'Enter a valid phone number.').refine(value=>{const digits=value.replace(/\D/g,'');return digits.length>=7&&digits.length<=15},'Use 7–15 digits, including your country code.'),
  location:z.string().trim().min(2,'Enter your location.').max(180),
})
export type ClientProfile=z.infer<typeof clientProfileSchema>
