/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL ?? 'http://localhost:3001',
  },
};

module.exports = nextConfig;
