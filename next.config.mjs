/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  experimental: { optimizePackageImports: ['highlight.js'] },
}
export default nextConfig
