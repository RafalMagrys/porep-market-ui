import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/rpc/v1',
        destination: 'http://127.0.0.1:1234/rpc/v1',
      },
    ]
  },
}

export default nextConfig
