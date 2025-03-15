/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Remove appDir from experimental
  experimental: {}
};

module.exports = nextConfig;