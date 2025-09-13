/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Fix for module resolution issues
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'whatwg-url': false,
        'tr46': false,
        'webidl-conversions': false,
        'tailwind-merge': false,
        'clsx': false,
      }
    }
    return config
  },
  experimental: {
    // Remove the moved configuration
  },
  serverExternalPackages: ['tailwind-merge', 'clsx']
}

export default nextConfig