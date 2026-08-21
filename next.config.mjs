/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  experimental: { optimizePackageImports: ['highlight.js'] },
  images: {
    // next/image refuses any remote host that is not listed here, which is why
    // Google profile pictures render as a broken image without this block.
    // Google serves avatars from lh3..lh6.googleusercontent.com and can change
    // which one, so the whole subdomain is allowed.
    remotePatterns: [
      { protocol: 'https', hostname: '*.googleusercontent.com', pathname: '/**' },
    ],
  },
}
export default nextConfig
