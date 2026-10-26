/** @type {import('next').NextConfig} */
const nextConfig = {
  // Windows sandbox processes cannot fork build workers; threads retain checks.
  experimental: { workerThreads: process.platform === 'win32', cpus: 2 },
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    ] }]
  },
}

export default nextConfig
