/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['ui', 'database', 'trpc', 'types']
}

module.exports = nextConfig
