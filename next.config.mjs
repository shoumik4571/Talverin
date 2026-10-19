/** @type {import('next').NextConfig} */
const nextConfig = {
  // Isolated output dir for packaged (Electron) builds so the dev
  // server's .next directory is never trampled by `next build`.
  distDir: process.env.TALVERIN_DIST || '.next',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
