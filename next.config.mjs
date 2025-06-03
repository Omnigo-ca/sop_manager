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
  // Configuration pour permettre l'importation de CSS de Swagger UI
  transpilePackages: ['swagger-ui-react'],
}

export default nextConfig
