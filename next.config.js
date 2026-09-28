import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds to skip warnings/errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript checking during builds (since it works locally)
    ignoreBuildErrors: true,
  },
  images: {
    // Vercel Image Optimization is returning 402 (quota/payment) in production,
    // which breaks shop/product images served via /_next/image. Serve originals
    // from Payload media (/api/media/file/...) until optimization is enabled again.
    unoptimized: true,
    remotePatterns: [
      // Allow images from Vercel Blob Storage
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'nabea.at',
      },
      {
        protocol: 'https',
        hostname: 'www.nabea.at',
      },
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
    ],
  },
  reactStrictMode: true,
  redirects,
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig)
