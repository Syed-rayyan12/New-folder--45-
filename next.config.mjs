/** @type {import('next').NextConfig} */
const nextConfig = {
  // Windows sandbox processes cannot fork build workers; threads retain checks.
  experimental: { agentUpgrade: 'security', workerThreads: process.platform === 'win32', cpus: 2 },
  poweredByHeader: false,
  distDir: process.env.PRVLG_DIST_DIR || '.next',
  // Static assets are served by the CDN, never by the Next.js server function.
  outputFileTracingExcludes: {
    '/*': [
      './public/**/*',
      './.reference/**/*',
      './.backups/**/*',
      './.scene-check/**/*',
      './.tools/**/*',
      './docs/**/*',
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    ] }]
  },
}

export default nextConfig
