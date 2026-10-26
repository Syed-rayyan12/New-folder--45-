import localFont from 'next/font/local'
import { MotionProvider } from '@/components/studio/motion-provider'
import './globals.css'

const lilex = localFont({ src: '../public/fonts/lilex-variable.ttf', variable: '--font-lilex', display: 'swap', weight: '100 700' })
const poppins = localFont({ src: [
  { path: '../public/fonts/poppins-regular.ttf', weight: '400', style: 'normal' },
  { path: '../public/fonts/poppins-medium.ttf', weight: '500', style: 'normal' },
  { path: '../public/fonts/poppins-semibold.ttf', weight: '600', style: 'normal' },
], variable: '--font-poppins', display: 'swap' })

export const metadata = {
  title: 'Natural Web Studio — Websites Built for Business Growth',
  description: 'Strategy-led website design and development. Natural Web Studio creates distinctive, high-performing websites that build trust and turn visitors into enquiries.',
  openGraph: { title: 'Natural Web Studio — Websites Built to Make an Impact', description: 'Strategy. Design. Development. A better website starts here.', type: 'website', locale: 'en_GB' },
  robots: { index: true, follow: true },
  icons: { icon: '/studio-mark.svg' },
}
export const viewport = { themeColor: '#050505', colorScheme: 'dark', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }) {
  return <html lang="en" className={`${lilex.variable} ${poppins.variable}`}><body><a className="skip-link" href="#main">Skip to content</a><MotionProvider>{children}</MotionProvider></body></html>
}
