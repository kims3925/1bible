import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['https://*.ngrok-free.dev', 'https://*.ngrok.io'],
};

export default nextConfig;
