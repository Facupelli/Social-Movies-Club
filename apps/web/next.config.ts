import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable image optimization
  images: {
    // Configure domains for external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
      // Add any other image domains you use
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      }
    ],
    // Set image sizes for better performance
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Enable format detection for modern formats
    formats: ['image/webp', 'image/avif'],
    // Set minimum cache TTL for images
    minimumCacheTTL: 60,
  },
  // Enable experimental features for better performance
  experimental: {
    // Optimize CSS loading
    optimizeCss: true,
  },
  // Configure Turbopack for faster builds
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Configure compression
  compress: true,
  // Enable React strict mode for better development
  reactStrictMode: true,
};

export default nextConfig;
